import {createTestPage, addComponent, publishPage, deleteTestPage, pageUrl} from '../support/bootstrap5'

describe('Bootstrap5 — Tabs', () => {
    before(() => {
        cy.login()
        createTestPage('tabs-test')
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/tabs-test/pagecontent',
                name: 'tabs',
                primaryNodeType: 'bootstrap5nt:tabs',
                properties: [
                    {name: 'type', value: 'tab'},
                    {name: 'fade', value: 'true', type: 'BOOLEAN'},
                    {name: 'useListNameAsAnchor', value: 'true', type: 'BOOLEAN'}
                ],
                children: [
                    {name: 'tab-one', primaryNodeType: 'jnt:contentList',
                        properties: [{name: 'jcr:title', value: 'Tab One', language: 'en'}]},
                    {name: 'tab-two', primaryNodeType: 'jnt:contentList',
                        properties: [{name: 'jcr:title', value: 'Tab Two', language: 'en'}]}
                ]
            }
        })
        // Add droppable content inside the first tab's content list
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/tabs-test/pagecontent/tabs/tab-one',
                name: 'tab-content',
                primaryNodeType: 'bootstrap5nt:text',
                properties: [{name: 'text', value: '<p class="tab-body-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>', language: 'en'}]
            }
        })
        publishPage('tabs-test')
    })

    after(() => {
        cy.login()
        deleteTestPage('tabs-test')
    })

    it('renders nav with .nav-tabs class', () => {
        cy.visit(pageUrl('tabs-test'))
        cy.get('.nav.nav-tabs').should('exist')
    })

    it('renders two tab buttons', () => {
        cy.visit(pageUrl('tabs-test'))
        cy.get('.nav-link').should('have.length', 2)
    })

    it('first tab is active by default', () => {
        cy.visit(pageUrl('tabs-test'))
        cy.get('.nav-link').first().should('have.class', 'active')
    })

    it('first tab pane is visible', () => {
        cy.visit(pageUrl('tabs-test'))
        cy.get('.tab-pane').first().should('have.class', 'active')
    })

    it('clicking the second tab activates it', () => {
        cy.visit(pageUrl('tabs-test'))
        cy.get('.nav-link').eq(1).click()
        cy.get('.nav-link').eq(1).should('have.class', 'active')
    })

    it('clicking the second tab deactivates the first', () => {
        cy.visit(pageUrl('tabs-test'))
        cy.get('.nav-link').eq(1).click()
        cy.get('.nav-link').first().should('not.have.class', 'active')
    })

    it('tab panes have .fade class when fade is enabled', () => {
        cy.visit(pageUrl('tabs-test'))
        cy.get('.tab-pane').should('have.class', 'fade')
    })

    it('first tab pane renders droppable child content', () => {
        cy.visit(pageUrl('tabs-test'))
        cy.get('.tab-body-content').should('exist')
        cy.get('.tab-body-content').should('contain.text', 'Lorem ipsum')
    })

    context('Pills variant', () => {
        before(() => {
            cy.login()
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/tabs-test/pagecontent',
                    name: 'pills',
                    primaryNodeType: 'bootstrap5nt:tabs',
                    properties: [{name: 'type', value: 'pill'}],
                    children: [
                        {name: 'pill-one', primaryNodeType: 'jnt:contentList',
                            properties: [{name: 'jcr:title', value: 'Pill One', language: 'en'}]}
                    ]
                }
            })
            publishPage('tabs-test')
        })

        it('pills tabs have .nav-pills class', () => {
            cy.visit(pageUrl('tabs-test'))
            cy.get('.nav.nav-pills').should('exist')
        })
    })
})
