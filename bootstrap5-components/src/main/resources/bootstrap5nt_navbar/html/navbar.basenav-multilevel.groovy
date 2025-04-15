import javax.jcr.ItemNotFoundException
import org.jahia.services.content.JCRContentUtils
import org.jahia.services.render.RenderService
import org.jahia.services.render.Resource
import org.jahia.taglibs.jcr.node.JCRTagUtils
import org.slf4j.LoggerFactory

def logger = LoggerFactory.getLogger(this.class)

// Render additional resources if needed
def additionalResources = new Resource(currentNode, "html", "hidden.basenav-multilevel-resources", currentResource.getContextConfiguration())
println RenderService.getInstance().render(additionalResources, renderContext)

// Initialize StringBuilder for HTML output
def htmlBuilder = new StringBuilder()

/**
 * Recursively renders the menu starting from the given node.
 */
def renderMenu(menuNode, currentLevel, ulCssClass, liCssClass, navLinkCssClass, maxDepth, htmlBuilder) {
    if (!menuNode) return
    def menuItems = JCRContentUtils.getChildrenOfType(menuNode, "jmix:navMenuItem")
    menuItems.each { menuItem ->
        if (menuItem && shouldDisplayMenuItem(menuItem)) {
            def menuItemDetails = getMenuItemDetails(menuItem)
            if (hasChildMenuItems(menuItem, currentLevel, maxDepth)) {
                renderDropdownMenuItem(menuItem, currentLevel, ulCssClass, liCssClass, navLinkCssClass, maxDepth, menuItemDetails, htmlBuilder)
            } else {
                renderSimpleMenuItem(menuItem, currentLevel, liCssClass, navLinkCssClass, menuItemDetails, htmlBuilder)
            }
        }
    }
}

/**
 * Renders a dropdown menu item that contains submenus.
 */
def renderDropdownMenuItem(menuItem, currentLevel, ulCssClass, liCssClass, navLinkCssClass, maxDepth, menuItemDetails, htmlBuilder) {
    def currentIndicator = menuItemDetails.isCurrent ? " <span class='visually-hidden'>(current)</span>" : ""

    if (currentLevel == 1) {
        htmlBuilder << """
            <li class='${liCssClass} dropdown'>
                <a class='${navLinkCssClass} dropdown-toggle${menuItemDetails.activeClass}'
                   id='dropdown-${menuItem.identifier}' data-bs-toggle='dropdown' href='#'>
                    ${menuItemDetails.menuItemTitle}${currentIndicator}
                </a>
                <ul class='dropdown-menu' aria-labelledby='dropdown-${menuItem.identifier}'>
        """
    } else {
        htmlBuilder << """
            <li class='dropend'>
                <a class='dropdown-item dropdown-toggle' href='#'>
                    ${menuItemDetails.menuItemTitle}${currentIndicator}
                </a>
                <ul class='submenu dropdown-menu'>
        """
    }

    if (!menuItem.isNodeType("jnt:navMenuText")) {
        renderSimpleMenuItem(menuItem, currentLevel, liCssClass, navLinkCssClass, menuItemDetails, htmlBuilder)
        htmlBuilder << "<li class='dropdown-divider'></li>"
    }

    renderMenu(menuItem, currentLevel + 1, ulCssClass, liCssClass, navLinkCssClass, maxDepth, htmlBuilder)
    htmlBuilder << "</ul></li>"
}

/**
 * Renders a simple menu item without submenus.
 */
def renderSimpleMenuItem(menuItem, currentLevel, liCssClass, navLinkCssClass, menuItemDetails, htmlBuilder) {
    def currentIndicator = menuItemDetails.isCurrent ? " <span class='visually-hidden'>(current)</span>" : ""
    if (currentLevel == 1) {
        htmlBuilder << """
            <li class='${liCssClass}'>
                <a class='${navLinkCssClass}${menuItemDetails.activeClass}' href='${menuItemDetails.menuItemUrl}'>
                    ${menuItemDetails.menuItemTitle}${currentIndicator}
                </a>
            </li>
        """
    } else {
        htmlBuilder << """
            <li>
                <a class='dropdown-item${menuItemDetails.activeClass}' href='${menuItemDetails.menuItemUrl}'>
                    ${menuItemDetails.menuItemTitle}${currentIndicator}
                </a>
            </li>
        """
    }
}

/**
 * Determines whether a menu item should be displayed.
 */
def shouldDisplayMenuItem(menuItem) {
    if (menuItem.isNodeType("jmix:navMenu")) return false
    def displayInMenuNames = menuItem.hasProperty("j:displayInMenuName") ? menuItem.getProperty("j:displayInMenuName").values*.string : null
    return !displayInMenuNames || displayInMenuNames.contains(currentNode.name)
}

/**
 * Checks if a menu item has child items and if the maximum depth has not been exceeded.
 */
def hasChildMenuItems(menuItem, currentLevel, maxDepth) {
    return currentLevel < maxDepth && JCRTagUtils.hasChildrenOfType(menuItem, "jmix:navMenuItem")
}

/**
 * Retrieves the details of a menu item.
 */
def getMenuItemDetails(menuItem) {
    def mainResourceNode = renderContext.mainResource.node
    def isActive = mainResourceNode.path.contains(menuItem.path)
    def isCurrent = mainResourceNode.path == menuItem.path
    def activeClass = isCurrent ? ' active' : isActive ? ' inpath' : ''
    return [
            isActive     : isActive,
            isCurrent    : isCurrent,
            activeClass  : activeClass,
            menuItemUrl  : getMenuItemUrl(menuItem),
            menuItemTitle: menuItem.displayableName ?: "Untitled"
    ]
}

/**
 * Retrieves the URL for a menu item.
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
 * Retrieves the URL from a node link.
 */
def getNodeLinkUrl(menuItem) {
    def referenceNode = menuItem.hasProperty('j:node') ? menuItem.getProperty('j:node').node : null
    if (referenceNode) {
        currentResource.dependencies.add(referenceNode.canonicalPath)
        return renderContext.response.encodeURL(referenceNode.url)
    }
    return "#"
}

/**
 * Retrieves the starting node for the menu based on configuration.
 */
def getStartNode() {
    def rootProperty = currentNode.hasProperty('root') ? currentNode.getProperty('root').string : null
    switch (rootProperty) {
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

def getStringProperty(node, propertyName, defaultValue) {
    return node.hasProperty(propertyName) ? (node.getProperty(propertyName)?.string?.trim() ?: defaultValue) : defaultValue
}

def getIntegerProperty(node, propertyName, defaultValue) {
    return node.hasProperty(propertyName) ? (node.getProperty(propertyName)?.string?.toInteger() ?: defaultValue) : defaultValue
}

// Retrieve CSS classes with default values
String ulCssClass = getStringProperty(currentNode, "ulClass", "navbar-nav me-auto")
String liCssClass = getStringProperty(currentNode, "liClass", "nav-item")
String navLinkCssClass = getStringProperty(currentNode, "navLinkClass", "nav-link")
def maxDepth = getIntegerProperty(currentNode, 'maxlevel', 2)

// Determine the starting node for the menu
def menuStartNode = getStartNode()

// Start rendering the menu
htmlBuilder << "<ul class='${ulCssClass}'>"
renderMenu(menuStartNode, 1, ulCssClass, liCssClass, navLinkCssClass, maxDepth, htmlBuilder)
htmlBuilder << "</ul>"

// Output the final HTML
println htmlBuilder.toString()
