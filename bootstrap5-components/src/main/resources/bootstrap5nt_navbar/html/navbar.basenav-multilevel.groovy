import javax.jcr.ItemNotFoundException
import org.jahia.services.content.JCRContentUtils
import org.jahia.services.render.RenderService
import org.jahia.services.render.Resource
import org.jahia.taglibs.jcr.node.JCRTagUtils
import org.slf4j.LoggerFactory

def logger = LoggerFactory.getLogger(this.class)

// Render additional resources if needed
def addResources = new Resource(currentNode, "html", "hidden.basenav-multilevel-resources", currentResource.getContextConfiguration())
println RenderService.getInstance().render(addResources, renderContext)

// Initialize StringBuilder for HTML output
def htmlOutput = new StringBuilder()

/**
 * Renders the menu recursively starting from the given node.
 */
def renderMenu(startNode, level, ulClass, liClass, navLinkClass, maxLevel, htmlOutput) {
    if (startNode) {
        def children = JCRContentUtils.getChildrenOfType(startNode, "jmix:navMenuItem")
        children.each { menuItem ->
            if (menuItem && shouldDisplay(menuItem)) {
                def details = getMenuItemDetails(menuItem)
                if (hasChildren(menuItem, level, maxLevel)) {
                    renderDropdownMenuItem(menuItem, level, ulClass, liClass, navLinkClass, maxLevel, details, htmlOutput)
                } else {
                    renderSimpleMenuItem(menuItem, level, liClass, navLinkClass, details, htmlOutput)
                }
            }
        }
    }
}

/**
 * Renders a dropdown menu item with submenus.
 */
def renderDropdownMenuItem(menuItem, level, ulClass, liClass, navLinkClass, maxLevel, details, htmlOutput) {
    def currentIndicator = details.isCurrent ? " <span class='visually-hidden'>(current)</span>" : ""

    if (level == 1) {
        // Configuration for level 1
        htmlOutput << """
            <li class='${liClass} dropdown'>
                <a class='${navLinkClass} dropdown-toggle${details.activeClass}'
                   id='dropdown-${menuItem.identifier}' data-bs-toggle='dropdown' href='#'>
                    ${details.menuItemTitle}${currentIndicator}
                </a>
                <ul class='dropdown-menu' aria-labelledby='dropdown-${menuItem.identifier}'>
        """
    } else {
        // Configuration for other levels
        htmlOutput << """
            <li class='dropend'>
                <a class='dropdown-item dropdown-toggle' href='#'>
                    ${details.menuItemTitle}${currentIndicator}
                </a>
                <ul class='submenu dropdown-menu'>
        """
    }

    // Render the simple menu item and divider if applicable
    if (!menuItem.isNodeType("jnt:navMenuText")) {
        renderSimpleMenuItem(menuItem, level, liClass, navLinkClass, details, htmlOutput)
        htmlOutput << "<li class='dropdown-divider'></li>"
    }

    // Recursively render the submenu
    renderMenu(menuItem, level + 1, ulClass, liClass, navLinkClass, maxLevel, htmlOutput)

    // Close the tags
    htmlOutput << "</ul></li>"
}

/**
 * Renders a simple menu item without submenus.
 */
def renderSimpleMenuItem(menuItem, level, liClass, navLinkClass, details, htmlOutput) {
    def currentIndicator = details.isCurrent ? " <span class='visually-hidden'>(current)</span>" : ""
    if (level == 1) {
        htmlOutput << """
            <li class='${liClass}'>
                <a class='${navLinkClass}${details.activeClass}' href='${details.menuItemUrl}'>
                    ${details.menuItemTitle}${currentIndicator}
                </a>
            </li>
        """
    } else {
        htmlOutput << """
            <li>
                <a class='dropdown-item${details.activeClass}' href='${details.menuItemUrl}'>
                    ${details.menuItemTitle}${currentIndicator}
                </a>
            </li>
        """
    }
}

/**
 * Determines if a menu item should be displayed.
 */
def shouldDisplay(menuItem) {
    if (menuItem.isNodeType("jmix:navMenu")) {
        return false
    }
    def displayInMenuNames = menuItem.hasProperty("j:displayInMenuName") ? menuItem.getProperty("j:displayInMenuName").values*.string : null
    return !displayInMenuNames || displayInMenuNames.contains(currentNode.name)
}

/**
 * Checks if a menu item has children and if the maximum level is not exceeded.
 */
def hasChildren(menuItem, level, maxLevel) {
    return level < maxLevel && JCRTagUtils.hasChildrenOfType(menuItem, "jmix:navMenuItem")
}

/**
 * Retrieves details of a menu item.
 */
def getMenuItemDetails(menuItem) {
    def isActive = renderContext.mainResource.node.path.contains(menuItem.path)
    def isCurrent = renderContext.mainResource.node.path.equals(menuItem.path)
    def activeClass = isCurrent ? ' active' : isActive ? ' inpath' : ''
    def menuItemUrl = getMenuItemUrl(menuItem)
    def menuItemTitle = menuItem.displayableName ?: "Untitled"
    return [
            isActive     : isActive,
            isCurrent    : isCurrent,
            activeClass  : activeClass,
            menuItemUrl  : menuItemUrl,
            menuItemTitle: menuItemTitle
    ]
}

/**
 * Gets the URL of a menu item.
 */
def getMenuItemUrl(menuItem) {
    try {
        if (menuItem.isNodeType('jnt:page')) {
            return renderContext.response.encodeURL(menuItem.url)
        } else if (menuItem.isNodeType('jnt:nodeLink')) {
            return getNodeLinkUrl(menuItem)
        } else if (menuItem.isNodeType('jnt:externalLink')) {
            return menuItem.hasProperty('j:url') ? menuItem.getProperty('j:url').string : "#"
        }
    } catch (Exception e) {
        logger.error("Error getting menu item URL: ${e.message}", e)
    }
    return "#"
}

/**
 * Gets the URL from a node link.
 */
def getNodeLinkUrl(menuItem) {
    def refNode = menuItem.hasProperty('j:node') ? menuItem.getProperty('j:node').node : null
    if (refNode) {
        currentResource.dependencies.add(refNode.canonicalPath)
        return renderContext.response.encodeURL(refNode.url)
    }
    return "#"
}

/**
 * Retrieves the starting node for the menu based on configuration.
 */
def getStartNode() {
    switch (currentNode.hasProperty('root') ? currentNode.getProperty('root').string : null) {
        case "currentPage":
            return renderContext.mainResource.node
        case "parentPage":
            return renderContext.mainResource.node.parent
        case "customRootPage":
            return currentNode.hasProperty('customRootPage') ? currentNode.getProperty('customRootPage').node : null
        default:
            return renderContext.site.home
    }
}

// Get the starting node
def startNode = getStartNode()

def getStringProperty(node, propName, defaultValue) {
    return node.hasProperty(propName) ? node.getProperty(propName)?.string?.trim() ?: defaultValue : defaultValue
}

def getIntegerProperty(node, propName, defaultValue) {
    return node.hasProperty(propName) ? node.getProperty(propName)?.string?.toInteger() ?: defaultValue : defaultValue
}

// Retrieve CSS classes with default values
String ulClass = getStringProperty(currentNode, "ulClass", "navbar-nav me-auto")
String liClass = getStringProperty(currentNode, "liClass", "nav-item")
String navLinkClass = getStringProperty(currentNode, "navLinkClass", "nav-link")
def maxLevel = getIntegerProperty(currentNode, 'maxlevel', 2)


// Start rendering the menu
htmlOutput << "<ul class='${ulClass}'>"
renderMenu(startNode, 1, ulClass, liClass, navLinkClass, maxLevel, htmlOutput)
htmlOutput << "</ul>"

// Output the final HTML
println htmlOutput.toString()