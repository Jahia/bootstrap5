import org.jahia.services.render.RenderService
import org.jahia.services.render.Resource
import org.jahia.taglibs.jcr.node.JCRTagUtils
import org.slf4j.LoggerFactory

import javax.jcr.ItemNotFoundException

logger = LoggerFactory.getLogger(this.class)

Resource addResources = new Resource(currentNode, "html", "hidden.basenav-multilevel-resources", currentResource.getContextConfiguration())
print(RenderService.getInstance().render(addResources, renderContext));


getPagesL1 = { value, curentPageNode ->
    logger.debug("value :" + value.toString())
    logger.debug("curentPageNode :" + curentPageNode.toString())
    switch (value) {
        case "currentPage": return JCRTagUtils.getChildrenOfType(curentPageNode, 'jmix:navMenuItem')
        case "parentPage": return JCRTagUtils.getChildrenOfType(curentPageNode.parent, 'jmix:navMenuItem')
        case "customRootPage": return JCRTagUtils.getChildrenOfType(currentNode.properties.customRootPage.node, 'jmix:navMenuItem')
        default: return JCRTagUtils.getChildrenOfType(renderContext.site.home, 'jmix:navMenuItem')
    }
}

getTitle = { node ->
    switch (true) {
        case JCRTagUtils.isNodeType(node, 'jnt:nodeLink'):
            try {
                return node.properties['jcr:title'].string ?: node.properties['j:node'].node.displayableName
            } catch (ItemNotFoundException e) {
                logger.error("Error processing nodeLink displayableName ", e)
                return node.displayableName
            }
        default: return node.displayableName
    }
}
getUrl = { node ->
    switch (true) {
        case JCRTagUtils.isNodeType(node, 'jnt:navMenuText'): return "#";
        case JCRTagUtils.isNodeType(node, 'jnt:externalLink'): return node.properties['j:url'].string;
        case JCRTagUtils.isNodeType(node, 'jnt:page'): return renderContext.getResponse().encodeURL(node.url);
        case JCRTagUtils.isNodeType(node, 'jnt:nodeLink'):
            try {
                currentResource.dependencies.add(node.properties['j:node'].string);
                return renderContext.getResponse().encodeURL(node.properties['j:node'].node.url);
            } catch (ItemNotFoundException e) {
                logger.error("Error processing nodeLink url ", e)
                return "#";
            }
    }
}

showPage = { node ->
    if (!node.properties['j:displayInMenuName']) {
        return true
    }
    def show = false;
    node.properties['j:displayInMenuName'].each { enableMenuName ->
        if (enableMenuName == currentNode.name) {
            show = true;
        }
    }
    return show;
}

def ulHTML = '''    
        <ul class="${classes}">
        '''
def li_navItemHTML = '''
        <li class="nav-item ${active ? ' active':''}">
            <a class="nav-link" href="${url}">
                ${title}
                ${active ?'<span class="sr-only">(current)</span>':''}
            </a>
        </li>
        '''

def li_dropdownHTML = '''
        <li class="nav-item  ${active? ' active' :''} dropdown">
            <a class="nav-link dropdown-toggle ${active? ' active' :''}" href="#"
               id="navbarDropdownMen-${identifier}"
               data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    ${title}
            </a>
            <div class="dropdown-menu"
                 aria-labelledby="navbarDropdownMen-${identifier}">
                <a class="dropdown-item" href="${url}">${title}</a>
                <div class="dropdown-divider"></div>
        '''
def a_dropdownItemHTML = '''
        <a class="dropdown-item ${active ? ' active':''}" href="${url}">
            ${title}
            ${active ?'<span class="sr-only">(current)</span>':''}
        </a>
        '''


def ul = new groovy.text.StreamingTemplateEngine().createTemplate(ulHTML)
def li_navItem = new groovy.text.StreamingTemplateEngine().createTemplate(li_navItemHTML)
def li_dropdown = new groovy.text.StreamingTemplateEngine().createTemplate(li_dropdownHTML)
def a_dropdownItem = new groovy.text.StreamingTemplateEngine().createTemplate(a_dropdownItemHTML)

createNav = { node, recursive ->
    if (!showPage(node))
        return

    def childNodes = JCRTagUtils.getChildrenOfType(node, 'jmix:navMenuItem')
    logger.debug("childNodes : " + childNodes.toString())
    logger.debug("recursive : " + recursive.toString())

    if (childNodes && recursive) {

        print li_dropdown.make([
                active    : renderContext.mainResource.path.contains(node.path),
                url       : getUrl(node),
                title     : getTitle(node),
                identifier: node.identifier
        ])

        childNodes.each { childNode ->
            if (!showPage(childNode))
                return

            print a_dropdownItem.make([
                    active: renderContext.mainResource.path.contains(childNode.path),
                    url   : getUrl(childNode),
                    title : getTitle(childNode)
            ])
        }

        print "</div></li>"
    } else {
        print li_navItem.make([
                active: renderContext.mainResource.path.contains(node.path),
                url   : getUrl(node),
                title : getTitle(node)
        ])
    }
}

curentPageNode = JCRTagUtils.isNodeType(renderContext.mainResource.node, 'jmix:navMenuItem') ?
        renderContext.mainResource.node :
        JCRTagUtils.getParentOfType(renderContext.mainResource.node, 'jmix:navMenuItem')

def pagesL1 = getPagesL1(
        currentNode.properties.root.string,
        curentPageNode
)
logger.debug("pagesL1 : " + pagesL1.toString())

// Add dependencies to parent of main resource so that we are aware of new pages at sibling level
try {
    currentResource.dependencies.add(renderContext.mainResource.node.getParent().getCanonicalPath());
} catch (ItemNotFoundException e) {
}

if (!pagesL1.isEmpty()) {
    def recursive = JCRTagUtils.isNodeType(currentNode, 'bootstrap5mix:navbarGlobalSettings') ?
            currentNode.properties.recursive.boolean : true

    print ul.make([
            classes: JCRTagUtils.isNodeType(currentNode, 'bootstrap5mix:customizeNavbar') ?
                    currentNode.properties.ulClass.string : 'navbar-nav me-auto'
    ])
    pagesL1.each { page -> createNav(page, recursive) }
    print "</ul>"
}
