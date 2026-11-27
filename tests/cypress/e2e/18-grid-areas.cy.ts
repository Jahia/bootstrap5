import gql from 'graphql-tag'
import {
    createTestPage, publishPage, deleteTestPage, pageUrl,
    addNode, addAreaWithTexts, deleteNode, publishNode, previewUrl
} from '../support/bootstrap5'

const siteKey = 'bootstrap5test'
const home = `/sites/${siteKey}/home`

// Where a grid stores the content of its columns, in the three situations a site meets:
// on a page, inside content shared from another page (an area in an absolute area),
// and inside a page template.
describe('Bootstrap5 — Grid column areas', () => {
    let templatesBase = ''

    before(() => {
        cy.login()

        // ── Grid in the header of the home page (an absolute area shown on every page) ──
        createTestPage('grid-areas-test')
        addNode(home, 'header', 'jnt:contentList')
        addNode(`${home}/header`, 'header-grid', 'bootstrap5nt:grid', [{name: 'grid', value: '12'}],
            ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createRow'])
        addAreaWithTexts(`${home}/header/header-grid`, 'main', ['header-grid-content'])

        // ── listLimit: 3 items in the column, 2 displayed ──
        addNode(`${home}/grid-areas-test/pagecontent`, 'grid-limited', 'bootstrap5nt:grid',
            [{name: 'grid', value: '12'}, {name: 'listLimit', value: '2'}],
            ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createRow', 'bootstrap5mix:listLimit'])
        addAreaWithTexts(`${home}/grid-areas-test/pagecontent/grid-limited`, 'main',
            ['limited-item', 'limited-item', 'limited-item'])

        publishNode(`${home}/header`)
        publishPage('grid-areas-test')

        // ── Grid in a page template ──
        // The templates of the template set live under /modules/{module}/{version}/templates
        cy.apollo({
            query: gql`query {
                jcr { nodesByQuery(query: "select * from [jnt:pageTemplate] where isdescendantnode('/modules/bootstrap5-templates-starter') and localname() = 'starter'") { nodes { path } } }
            }`
        }).then((result: {data: {jcr: {nodesByQuery: {nodes: {path: string}[]}}}}) => {
            templatesBase = result.data.jcr.nodesByQuery.nodes[0].path.replace(/\/starter$/, '')

            // Page template "with-grid": its page content is a 4/8 grid
            addNode(templatesBase, 'with-grid', 'jnt:pageTemplate', [], [],
                [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}])
            addNode(`${templatesBase}/with-grid/pagecontent`, 'tplgrid', 'bootstrap5nt:grid', [{name: 'grid', value: '4_8'}],
                ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createRow'])

            // Two pages use the template. Inside a template the area names are prefixed with the
            // grid name, and each page holds its own lists: {page}/tplgrid-main, {page}/tplgrid-side
            for (const page of ['tpl-a', 'tpl-b']) {
                addNode(home, page, 'jnt:page', [
                    {name: 'jcr:title', value: page, language: 'en'},
                    {name: 'j:templateName', value: 'with-grid'}
                ])
                addAreaWithTexts(`${home}/${page}`, 'tplgrid-main', [`${page}-main`])
                addAreaWithTexts(`${home}/${page}`, 'tplgrid-side', [`${page}-side`])
            }
        })
    })

    after(() => {
        cy.login()
        deleteTestPage('grid-areas-test')
        deleteNode(`${home}/header/header-grid`)
        deleteNode(`${home}/tpl-a`)
        deleteNode(`${home}/tpl-b`)
        cy.then(() => deleteNode(`${templatesBase}/with-grid`))
    })

    context('Grid inside shared content (area in an absolute area)', () => {
        it('a grid of the home page header shows its column content on another page', () => {
            cy.visit(pageUrl('grid-areas-test'))
            cy.get('.header-grid-content').should('exist')
        })
    })

    context('listLimit', () => {
        it('displays no more items than the limit', () => {
            cy.visit(pageUrl('grid-areas-test'))
            cy.get('.limited-item').should('have.length', 2)
        })
    })

    context('Grid inside a page template', () => {
        beforeEach(() => {
            cy.login()
        })

        it('page A shows its own column content, in the columns of the template grid', () => {
            cy.visit(previewUrl(`${home}/tpl-a`))
            cy.get('.col-md-8 .tpl-a-main').should('exist')
            cy.get('.col-md-4 .tpl-a-side').should('exist')
        })

        it('page A does not show the content of page B', () => {
            cy.visit(previewUrl(`${home}/tpl-a`))
            cy.get('.tpl-b-main').should('not.exist')
            cy.get('.tpl-b-side').should('not.exist')
        })

        it('page B shows its own column content', () => {
            cy.visit(previewUrl(`${home}/tpl-b`))
            cy.get('.col-md-8 .tpl-b-main').should('exist')
            cy.get('.col-md-4 .tpl-b-side').should('exist')
            cy.get('.tpl-a-main').should('not.exist')
        })
    })
})
