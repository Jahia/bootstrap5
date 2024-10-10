import javax.jcr.ItemNotFoundException
import org.jahia.services.content.JCRContentUtils
import org.jahia.services.content.JCRNodeWrapper
import org.jahia.services.render.RenderService
import org.jahia.services.render.Resource
import org.jahia.taglibs.jcr.node.JCRTagUtils
import org.slf4j.LoggerFactory

// Initialize logger for this class
logger = LoggerFactory.getLogger(this.class)

// Create a resource to include hidden multilevel navigation resources
Resource addResources = new Resource(currentNode, "html", "hidden.basenav-multilevel-resources", currentResource.getContextConfiguration())

// Render the added resources
print(RenderService.getInstance().render(addResources, renderContext))

// Helper method to render a menu item link
def renderMenuItem(menuItemUrl, menuItemTitle, navLinkClass, statusClass, isCurrent) {
    return """
    <a class="${navLinkClass} ${statusClass}" href="${menuItemUrl}">
        ${menuItemTitle} ${isCurrent ? "<span class='visually-hidden'>(current)</span>" : ""}
    </a>
    """
}

// Helper method to get the URL and title for a menu item
def getMenuItemDetails(menuItem, renderContext) {
    def menuItemUrl = "#"
    def menuItemTitle = menuItem.displayableName

    // Determine URL and title based on the node type
    if (menuItem.isNodeType('jnt:page')) {
        menuItemUrl = renderContext.getResponse().encodeURL(menuItem.url)
    } else if (menuItem.isNodeType('jnt:nodeLink')) {
        JCRNodeWrapper refNode = menuItem.properties['j:node'].node
        if (refNode) {
            menuItemTitle = menuItem.getPropertyAsString("jcr:title") ?: refNode.displayableName
            menuItemUrl = renderContext.getResponse().encodeURL(refNode.url)
        }
    } else if (menuItem.isNodeType('jnt:externalLink')) {
        menuItemUrl = menuItem.properties['j:url'].string
    }
    return [menuItemUrl, menuItemTitle]
}

// Recursive method to print the menu structure
def printMenu(startNode, level, ulClass, liClass, navLinkClass, maxlevel) {
    if (!startNode) return

    // Get all child nodes of type 'jmix:navMenuItem'
    def children = JCRContentUtils.getChildrenOfType(startNode, "jmix:navMenuItem")
    children.eachWithIndex { menuItem, index ->
        if (!menuItem) return

        // Check if the item is of the correct type (either a menu item or a menu link)
        def correctType = !menuItem.isNodeType("jmix:navMenu")
        menuItem.properties['j:displayInMenuName']?.each { displayInMenuName ->
            correctType |= displayInMenuName.string.equals(currentNode.name)
        }

        if (correctType) {
            // Check if the item has children and determine if it is active or current
            boolean hasChildren = level < maxlevel && JCRTagUtils.hasChildrenOfType(menuItem, "jmix:navMenuItem")
            def (menuItemUrl, menuItemTitle) = getMenuItemDetails(menuItem, renderContext)
            boolean isActive = renderContext.mainResource.node.path.indexOf(menuItem.path) > -1
            boolean isCurrent = renderContext.mainResource.node.path.equals(menuItem.path)
            String statusClass = isCurrent ? 'active' : isActive ? 'inpath' : ''

            // Print the menu item
            print "<li class='${liClass}'>"
            print renderMenuItem(menuItemUrl, menuItemTitle, navLinkClass, statusClass, isCurrent)

            // If the item has children, recursively print them as a dropdown menu
            if (hasChildren && level < maxlevel) {
                print "<ul class='dropdown-menu'>"
                printMenu(menuItem, level + 1, ulClass, liClass, navLinkClass, maxlevel)
                print "</ul>"
            }

            print "</li>"
        }
    }
}

// Define the starting node based on the 'root' property
JCRNodeWrapper startNode = null
JCRNodeWrapper currentPageNode = renderContext.mainResource.node
String root = currentNode.properties.root.string
long maxlevel = 2

// Determine the starting node based on the 'root' setting
switch (root) {
    case "currentPage":
        startNode = currentPageNode
        break
    case "parentPage":
        startNode = currentPageNode.parent
        break
    case "customRootPage":
        startNode = currentNode.properties.customRootPage.node
        break
    default:
        startNode = renderContext.site.home
        break
}

// Helper method to get node properties with a default value fallback
def getOrDefault = { node, propertyName, defaultValue ->
    node.hasProperty(propertyName) ? node.getProperty(propertyName).string ?: defaultValue : defaultValue
}

// Set CSS classes based on the current node properties
String ulClass = getOrDefault(currentNode, "ulClass", "navbar-nav me-auto")
String liClass = getOrDefault(currentNode, "liClass", "nav-item")
String navLinkClass = getOrDefault(currentNode, "navLinkClass", "nav-link")

// Check for specific node type to adjust maximum menu levels
if (currentNode.isNodeType("bootstrap5mix:navbarGlobalSettings")) {
    maxlevel = currentNode.properties.maxlevel?.string?.toLong() ?: maxlevel
}

// Add parent node path as a dependency for the current resource, if possible
try {
    currentResource.dependencies.add(renderContext.mainResource.node.getParent().getCanonicalPath())
} catch (ItemNotFoundException e) {
    logger.warn("Parent not found", e)
}

// Print the main menu structure
print "<ul class='${ulClass}'>"
printMenu(startNode, 1, ulClass, liClass, navLinkClass, maxlevel)
print "</ul>"