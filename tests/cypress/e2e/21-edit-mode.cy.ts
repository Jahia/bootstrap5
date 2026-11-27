import {createTestPage, deleteTestPage, addNode, addAreaWithTexts, editFrameUrl} from '../support/bootstrap5'

const siteKey = 'bootstrap5test'
const page = `/sites/${siteKey}/home/edit-mode-test`
const content = `${page}/pagecontent`

/** The edit-mode wrapper Jahia puts around the node of that path. */
const moduleOf = (path: string) => `[jahiatype="module"][path="${path}"]`

// What editors get in edit mode (the page as jContent's page builder loads it): every component
// renders, is selectable, and offers the places where content can be added.
describe('Bootstrap5 — Edit mode', () => {
    before(() => {
        cy.login()
        createTestPage('edit-mode-test')

        addNode(content, 'grid', 'bootstrap5nt:grid', [{name: 'grid', value: '6_6'}, {name: 'listLimit', value: '2'}],
            ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createRow', 'bootstrap5mix:listLimit'])
        addAreaWithTexts(`${content}/grid`, 'main', ['edit-grid-main'])

        addNode(content, 'tabs', 'bootstrap5nt:tabs', [{name: 'type', value: 'tab'}], [], [
            {name: 'first', primaryNodeType: 'jnt:contentList', properties: [{name: 'jcr:title', value: 'First', language: 'en'}]}
        ])
        addNode(content, 'accordions', 'bootstrap5nt:accordions', [], [], [
            {name: 'panel-1', primaryNodeType: 'bootstrap5nt:accordion', properties: [{name: 'jcr:title', value: 'Panel 1', language: 'en'}]}
        ])
        addNode(content, 'carousel', 'bootstrap5nt:carousel', [], [], [
            {name: 'slide-1', primaryNodeType: 'bootstrap5nt:carouselItem', properties: [{name: 'jcr:title', value: 'Slide 1', language: 'en'}]}
        ])
        addNode(content, 'pager', 'bootstrap5nt:pagination', [{name: 'displayPager', value: 'true'}])
        addNode(content, 'modal-button', 'bootstrap5nt:button', [
            {name: 'jcr:title', value: 'Open', language: 'en'},
            {name: 'buttonType', value: 'modal'},
            {name: 'modalTitle', value: 'Modal title', language: 'en'}
        ], ['bootstrap5mix:modal'])
        addNode(content, 'text', 'bootstrap5nt:text', [{name: 'text', value: '<p class="edit-text">Text</p>', language: 'en'}])
    })

    after(() => {
        cy.login()
        deleteTestPage('edit-mode-test')
    })

    beforeEach(() => {
        cy.login()
        cy.visit(editFrameUrl(page))
    })

    it('renders the page without a rendering error', () => {
        cy.get('.edit-text').should('exist')
        cy.get('body').should('not.contain.text', 'Error while rendering')
        cy.get('body').should('not.contain.text', 'TypeError')
    })

    it('every component is an editable module', () => {
        for (const name of ['grid', 'tabs', 'accordions', 'carousel', 'pager', 'modal-button', 'text']) {
            cy.get(moduleOf(`${content}/${name}`)).should('exist')
        }
    })

    it('grid: both columns are areas stored under the grid, the empty one included', () => {
        cy.get(moduleOf(`${content}/grid/main`)).should('exist').find('.edit-grid-main').should('exist')
        cy.get(moduleOf(`${content}/grid/side`)).should('exist')
    })

    it('grid: the list limit is given to the editing interface', () => {
        cy.get(moduleOf(`${content}/grid/main`)).should('have.attr', 'listlimit', '2')
    })

    it('tabs: the tab list is editable, and a tab can be added', () => {
        cy.get(moduleOf(`${content}/tabs/first`)).should('exist')
        cy.get(`${moduleOf(`${content}/tabs`)} [jahiatype="module"][type="placeholder"][nodetypes="jnt:contentList"]`).should('exist')
    })

    it('accordion: the panel is editable, and a panel can be added', () => {
        cy.get(moduleOf(`${content}/accordions/panel-1`)).should('exist')
        cy.get(`${moduleOf(`${content}/accordions`)} [jahiatype="module"][type="placeholder"][nodetypes="bootstrap5nt:accordion"]`).should('exist')
    })

    it('carousel: the slide is editable, and a slide can be added', () => {
        cy.get(moduleOf(`${content}/carousel/slide-1`)).should('exist')
        cy.get(`${moduleOf(`${content}/carousel`)} [jahiatype="module"][type="placeholder"][nodetypes="bootstrap5nt:carouselItem"]`).should('exist')
    })

    it('pagination bound to nothing: a placeholder names the component', () => {
        cy.get(moduleOf(`${content}/pager`)).should('contain.text', 'pager')
    })

    it('modal button: content can be added in the modal', () => {
        cy.get(`${moduleOf(`${content}/modal-button`)} .modal-body [jahiatype="module"][type="placeholder"]`).should('exist')
    })
})
