import {publishPage, deleteTestPage} from '../support/bootstrap5'

const siteKey = 'bootstrap5test'

// Breadcrumb only renders when fn:length(pageNodes) > 1 with the page at level 3+
// under home (home → parent → child → test-page).
// Structure: /home/breadcrumb-l1/breadcrumb-l2/breadcrumb-test
describe('Bootstrap5 — Breadcrumb', () => {
    const testPageUrl = `/cms/render/live/en/sites/${siteKey}/home/breadcrumb-l1/breadcrumb-l2/breadcrumb-test.html`

    before(() => {
        cy.login()
        // Level 1 under home
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: `/sites/${siteKey}/home`,
                name: 'breadcrumb-l1',
                primaryNodeType: 'jnt:page',
                properties: [
                    {name: 'jcr:title', value: 'Level 1', language: 'en'},
                    {name: 'j:templateName', value: 'starter'}
                ],
                children: [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}]
            }
        })
        // Level 2
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: `/sites/${siteKey}/home/breadcrumb-l1`,
                name: 'breadcrumb-l2',
                primaryNodeType: 'jnt:page',
                properties: [
                    {name: 'jcr:title', value: 'Level 2', language: 'en'},
                    {name: 'j:templateName', value: 'starter'}
                ],
                children: [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}]
            }
        })
        // Level 3 — this is where the breadcrumb component lives
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: `/sites/${siteKey}/home/breadcrumb-l1/breadcrumb-l2`,
                name: 'breadcrumb-test',
                primaryNodeType: 'jnt:page',
                properties: [
                    {name: 'jcr:title', value: 'Breadcrumb Test', language: 'en'},
                    {name: 'j:templateName', value: 'starter'}
                ],
                children: [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}]
            }
        })
        // Add breadcrumb component on the level-3 page
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: `/sites/${siteKey}/home/breadcrumb-l1/breadcrumb-l2/breadcrumb-test/pagecontent`,
                name: 'breadcrumb',
                primaryNodeType: 'bootstrap5nt:breadcrumb'
            }
        })
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/publishNode.graphql',
            variables: {
                pathOrId: `/sites/${siteKey}/home/breadcrumb-l1`,
                languages: ['en'],
                publishSubNodes: true,
                includeSubTree: true
            }
        })
        cy.wait(2000)
    })

    after(() => {
        cy.login()
        deleteTestPage('breadcrumb-l1')
    })

    it('renders the breadcrumb list (ol.breadcrumb with aria-label)', () => {
        cy.visit(testPageUrl)
        // JSP renders <ol class="breadcrumb" aria-label="..."> directly — no <nav> wrapper
        cy.get('ol.breadcrumb').should('exist')
        cy.get('ol.breadcrumb').should('have.attr', 'aria-label')
    })

    it('renders at least two breadcrumb items', () => {
        cy.visit(testPageUrl)
        cy.get('.breadcrumb-item').should('have.length.at.least', 2)
    })

    it('last breadcrumb item is active with aria-current="page"', () => {
        cy.visit(testPageUrl)
        cy.get('.breadcrumb-item').last().should('have.class', 'active')
        cy.get('.breadcrumb-item').last().should('have.attr', 'aria-current', 'page')
    })

    it('non-active breadcrumb items have links', () => {
        cy.visit(testPageUrl)
        cy.get('.breadcrumb-item').not('.active').first().find('a').should('exist')
    })
})
