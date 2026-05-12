import {createTestPage, publishPage, deleteTestPage, pageUrl} from '../support/bootstrap5'

describe('Bootstrap5 — Navbar', () => {
    before(() => {
        cy.login()
        createTestPage('navbar-test')
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/navbar-test/pagecontent',
                name: 'navbar',
                primaryNodeType: 'bootstrap5nt:navbar',
                properties: [
                    {name: 'root', value: 'homePage'}
                ]
            }
        })
        publishPage('navbar-test')
    })

    after(() => {
        cy.login()
        deleteTestPage('navbar-test')
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

    context('Dark variant', () => {
        before(() => {
            cy.login()
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/navbar-test/pagecontent',
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
                    parentPathOrId: '/sites/bootstrap5test/home/navbar-test/pagecontent',
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
                    parentPathOrId: '/sites/bootstrap5test/home/navbar-test/pagecontent',
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
            // At least one navbar (navbar-container) has a direct .container child
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
