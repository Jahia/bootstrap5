import javax.jcr.ItemNotFoundException
import org.jahia.services.content.JCRContentUtils
import org.jahia.services.content.JCRNodeWrapper
import org.jahia.services.render.RenderService
import org.jahia.services.render.Resource
import org.jahia.taglibs.jcr.node.JCRTagUtils
import org.slf4j.LoggerFactory

logger = LoggerFactory.getLogger(this.class)

Resource addResources = new Resource(currentNode, "html", "hidden.basenav-multilevel-resources", currentResource.getContextConfiguration())
print(RenderService.getInstance().render(addResources, renderContext));

def printMenu;
printMenu = { startNode, level, ulClass, maxlevel ->
    if (startNode != null) {
        children = JCRContentUtils.getChildrenOfType(startNode, "jmix:navMenuItem")
        children.eachWithIndex() { menuItem, index ->
            if (menuItem != null) {
                def correctType = true;
                if (menuItem.isNodeType("jmix:navMenu")) {
                    correctType = false;
                }
                if (menuItem.properties['j:displayInMenuName']) {
                    correctType = false;
                    menuItem.properties['j:displayInMenuName'].each() {
                        correctType |= (it.string.equals(currentNode.name))
                    }
                }
                if (correctType) {

                    boolean hasChildren = level < maxlevel && JCRTagUtils.hasChildrenOfType(menuItem, "jmix:navMenuItem")
                    String menuItemUrl = null;
                    String menuItemTitle = menuItem.displayableName;
                    boolean isActive = renderContext.mainResource.node.path.indexOf(menuItem.path) > -1;
                    boolean isCurrent = renderContext.mainResource.node.path.equals(menuItem.path);
                    String statusClass = isCurrent ? ' active' : isActive ? ' inpath' : '';

                    if (menuItem.isNodeType('jnt:page')) {
                        menuItemUrl = renderContext.getResponse().encodeURL(menuItem.url);
                    } else if (menuItem.isNodeType('jnt:nodeLink')) {
                        JCRNodeWrapper refNode = menuItem.properties['j:node'].node;
                        if (refNode != null) {
                            currentResource.dependencies.add(refNode.getCanonicalPath());
                            if ("".equals(menuItemTitle)) {
                                menuItemTitle = refNode.displayableName;
                            }
                            menuItemUrl = renderContext.getResponse().encodeURL(refNode.url);
                        }
                    } else if (menuItem.isNodeType('jnt:externalLink')) {
                        menuItemUrl = menuItem.properties['j:url'].string;
                    }
                    if (menuItemUrl == null || "".equals(menuItemUrl)) {
                        menuItemUrl = "#";
                    }

                    if (hasChildren && level < maxlevel) {
                        if (level == 1) {
                            print "<li class=\"nav-item\">";
                            print "<a class='nav-link ${isActive ? ' active' : ''} dropdown-toggle' id='navbarDropdownMen-${menuItem.identifier}' data-bs-toggle='dropdown' aria-haspopup='true' aria-expanded='false' href='#'>${menuItemTitle}"
                            if (isCurrent) {
                                print " <span class='visually-hidden'>(current)</span>";
                            }
                            print "</a>";
                            print "<ul class='dropdown-menu' aria-labelledby='navbarDropdownMen-${menuItem.identifier}'>";
                            print "<li><a class='dropdown-item' href='${menuItemUrl}'>${menuItemTitle}</a></li>";
                            print "<li class='dropdown-divider'></li>";
                            printMenu(menuItem, level + 1, ulClass, maxlevel);
                            print "</ul>";
                            print "</li>";
                        } else {
                            print "<li class='dropend'>";
                            print "<a class=\"dropdown-item dropdown-toggle ${statusClass} \" href='${menuItemUrl}'>${menuItemTitle}"
                            if (isCurrent) {
                                print " <span class='visually-hidden'>(current)</span>";
                            }
                            print "</a>";
                            print "<ul class='submenu dropdown-menu'>";
                            print "<li><a class='dropdown-item' href='${menuItemUrl}'>${menuItemTitle}</a></li>";
                            print "<li class='dropdown-divider'></li>";
                            printMenu(menuItem, level + 1, ulClass, maxlevel);
                            print "</ul>";
                            print "</li>";
                        }
                    } else {
                        if (level == 1) {
                            print "<li class='nav-item'>";
                            print "<a class=\"nav-link ${statusClass}\" href=\"${menuItemUrl}\">${menuItemTitle}";
                            if (isCurrent) {
                                print " <span class=\"visually-hidden\">(current)</span>";
                            }
                            print "</a>"
                            print "</li>";
                        } else {
                            print "<li>";
                            print "<a class=\"dropdown-item ${statusClass}\" href=\"${menuItemUrl}\">${menuItemTitle}";
                            if (isCurrent) {
                                print " <span class=\"visually-hidden\">(current)</span>";
                            }
                            print "</a>"
                            print "</li>";

                        }
                    }
                }
            }
        }
    }
}

JCRNodeWrapper startNode = null;
JCRNodeWrapper curentPageNode = renderContext.mainResource.node;
String root = currentNode.properties.root.string;
long maxlevel = 2;
switch (root) {
    case "currentPage": startNode = curentPageNode;
    case "parentPage": startNode = curentPageNode.parent;
    case "customRootPage": startNode = currentNode.properties.customRootPage.node;
}
if (startNode == null) {
    startNode = renderContext.site.home;
}

String ulClass = "navbar-nav me-auto";
if (currentNode.isNodeType("bootstrap5mix:navbarGlobalSettings")) {
    try {
        maxlevel = Long.parseLong(currentNode.properties.maxlevel.string);
    } catch (NumberFormatException e) {
    }
}
if (currentNode.isNodeType("bootstrap5mix:customizeNavbar")) {
    ulClass = currentNode.properties.ulClass.string;
}

// Add dependencies to parent of main resource so that we are aware of new pages at sibling level
try {
    currentResource.dependencies.add(renderContext.mainResource.node.getParent().getCanonicalPath());
} catch (ItemNotFoundException e) {
}
print "<ul class='${ulClass}'>";
printMenu(startNode, 1, ulClass, maxlevel)
print "</ul>"
