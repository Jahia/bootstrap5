import {createTestPage, publishPage, deleteTestPage, pageUrl} from '../support/bootstrap5'

const siteKey = 'bootstrap5test'

// Helper to create a jnt:page under any parent path
const createPage = (parentPath: string, name: string, title: string) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/addNode.graphql',
        variables: {
            parentPathOrId: parentPath,
            name,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: title, language: 'en'},
                {name: 'j:templateName', value: 'starter'}
            ],
            children: [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}]
        }
    })
}

describe('Bootstrap5 — Navbar', () => {
    before(() => {
        cy.login()
        createTestPage('navbar-test')

        // Build a multi-level page hierarchy under /home for the navbar to traverse:
        //   /home/nav-section-a  (has children → rendered as dropdown)
        //     /home/nav-section-a/nav-page-a1  (leaf)
        //     /home/nav-section-a/nav-page-a2  (has children → rendered as dropend at level 2)
        //       /home/nav-section-a/nav-page-a2/nav-page-a2x  (leaf, level 3)
        //   /home/nav-section-b  (leaf)
        createPage(`/sites/${siteKey}/home`, 'nav-section-a', 'Section A')
        createPage(`/sites/${siteKey}/home/nav-section-a`, 'nav-page-a1', 'Page A1')
        createPage(`/sites/${siteKey}/home/nav-section-a`, 'nav-page-a2', 'Page A2')
        createPage(`/sites/${siteKey}/home/nav-section-a/nav-page-a2`, 'nav-page-a2x', 'Page A2x')
        createPage(`/sites/${siteKey}/home`, 'nav-section-b', 'Section B')

        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: `/sites/${siteKey}/home/navbar-test/pagecontent`,
                name: 'navbar',
                primaryNodeType: 'bootstrap5nt:navbar',
                mixins: ['bootstrap5mix:navbarGlobalSettings'],
                properties: [
                    {name: 'root', value: 'homePage'},
                    {name: 'maxlevel', value: '3'}
                ]
            }
        })
        publishPage('navbar-test')
        // Publish the nav pages so they appear in live rendering
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/publishNode.graphql',
            variables: {
                pathOrId: `/sites/${siteKey}/home/nav-section-a`,
                languages: ['en'],
                publishSubNodes: true,
                includeSubTree: true
            }
        })
        // Explicitly publish the level-3 subtree so it reaches the live workspace
        // before the first page visit caches the navbar Groovy output
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/publishNode.graphql',
            variables: {
                pathOrId: `/sites/${siteKey}/home/nav-section-a/nav-page-a2`,
                languages: ['en'],
                publishSubNodes: true,
                includeSubTree: true
            }
        })
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/publishNode.graphql',
            variables: {
                pathOrId: `/sites/${siteKey}/home/nav-section-b`,
                languages: ['en'],
                publishSubNodes: true,
                includeSubTree: true
            }
        })
        cy.wait(4000)
    })

    after(() => {
        cy.login()
        deleteTestPage('navbar-test')
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/deleteNode.graphql',
            variables: {pathOrId: `/sites/${siteKey}/home/nav-section-a`, workspace: 'EDIT'}
        })
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/deleteNode.graphql',
            variables: {pathOrId: `/sites/${siteKey}/home/nav-section-b`, workspace: 'EDIT'}
        })
    })

    it('renders the navbar wrapper', () => {
        cy.visit(pageUrl('navbar-test'))
        cy.get('.navbar').should('exist')
    })

    it('renders the navbar brand link', () => {
        cy.visit(pageUrl('navbar-test'))
        cy.get('.navbar-brand').should('exist')
    })

    it('renders the navbar toggler button', () => {
        cy.visit(pageUrl('navbar-test'))
        cy.get('.navbar-toggler').should('exist')
    })

    it('renders the collapsible navbar content', () => {
        cy.visit(pageUrl('navbar-test'))
        cy.get('.collapse.navbar-collapse').should('exist')
    })

    it('renders navigation links', () => {
        cy.visit(pageUrl('navbar-test'))
        cy.get('.nav-item').should('exist')
        cy.get('.nav-link').should('exist')
    })

    context('Multi-level navigation', () => {
        it('top-level item with children renders as a dropdown', () => {
            cy.visit(pageUrl('navbar-test'))
            cy.get('.nav-item.dropdown').should('exist')
        })

        it('dropdown toggle uses data-bs-toggle="dropdown"', () => {
            cy.visit(pageUrl('navbar-test'))
            cy.get('[data-bs-toggle="dropdown"]').should('exist')
        })

        it('dropdown menu is present in DOM', () => {
            cy.visit(pageUrl('navbar-test'))
            cy.get('.dropdown-menu').should('exist')
        })

        it('second-level items render as dropdown-item', () => {
            cy.visit(pageUrl('navbar-test'))
            cy.get('.dropdown-item').should('exist')
        })

        it('leaf page at top level renders as a plain nav-item (no dropdown)', () => {
            cy.visit(pageUrl('navbar-test'))
            // Section B has no children — it must appear as a simple nav-item
            cy.get('.nav-item').not('.dropdown').should('exist')
        })

        it('third-level item renders inside a dropend submenu', () => {
            cy.visit(pageUrl('navbar-test'))
            cy.get('.dropend').should('exist')
            cy.get('.submenu.dropdown-menu').should('exist')
        })
    })

    context('Dark variant', () => {
        before(() => {
            cy.login()
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: `/sites/${siteKey}/home/navbar-test/pagecontent`,
                    name: 'navbar-dark',
                    primaryNodeType: 'bootstrap5nt:navbar',
                    mixins: ['bootstrap5mix:customizeNavbar'],
                    properties: [
                        {name: 'root', value: 'homePage'},
                        {name: 'navClass', value: 'navbar navbar-expand-lg navbar-dark bg-dark'}
                    ]
                }
            })
            publishPage('navbar-test')
        })

        it('dark navbar has navbar-dark class', () => {
            cy.visit(pageUrl('navbar-test'))
            cy.get('.navbar-dark').should('exist')
        })

        it('dark navbar has bg-dark class', () => {
            cy.visit(pageUrl('navbar-test'))
            cy.get('.bg-dark').should('exist')
        })
    })

    context('Container toggle', () => {
        before(() => {
            cy.login()
            // addContainerWithinTheNavbar=true → renders <div class="container"> inside <nav>
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: `/sites/${siteKey}/home/navbar-test/pagecontent`,
                    name: 'navbar-container',
                    primaryNodeType: 'bootstrap5nt:navbar',
                    mixins: ['bootstrap5mix:navbarGlobalSettings'],
                    properties: [
                        {name: 'root', value: 'homePage'},
                        {name: 'addContainerWithinTheNavbar', value: 'true', type: 'BOOLEAN'},
                        {name: 'addLoginButton', value: 'false', type: 'BOOLEAN'},
                        {name: 'addLanguageButton', value: 'false', type: 'BOOLEAN'}
                    ]
                }
            })
            // addContainerWithinTheNavbar=false (JSP default) → no .container child
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: `/sites/${siteKey}/home/navbar-test/pagecontent`,
                    name: 'navbar-nocontainer',
                    primaryNodeType: 'bootstrap5nt:navbar',
                    mixins: ['bootstrap5mix:navbarGlobalSettings'],
                    properties: [
                        {name: 'root', value: 'homePage'},
                        {name: 'addContainerWithinTheNavbar', value: 'false', type: 'BOOLEAN'},
                        {name: 'addLoginButton', value: 'false', type: 'BOOLEAN'},
                        {name: 'addLanguageButton', value: 'false', type: 'BOOLEAN'}
                    ]
                }
            })
            publishPage('navbar-test')
        })

        it('addContainerWithinTheNavbar=true wraps content in .container', () => {
            cy.visit(pageUrl('navbar-test'))
            cy.get('.navbar .container').should('exist')
        })

        it('addContainerWithinTheNavbar=false omits .container', () => {
            cy.visit(pageUrl('navbar-test'))
            // navbar-nocontainer is the last navbar added — it must not contain a .container
            cy.get('.navbar').last().within(() => {
                cy.get('.container').should('not.exist')
            })
        })
    })
})
