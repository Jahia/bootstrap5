import {createTestPage, addComponent, publishPage, deleteTestPage, pageUrl} from '../support/bootstrap5'

describe('Bootstrap5 — Accordion', () => {
    before(() => {
        cy.login()
        createTestPage('accordion-test')
        // Create accordions container
        addComponent('accordion-test', 'accordions', 'bootstrap5nt:accordions',
            [{name: 'flush', value: 'false', type: 'BOOLEAN'}]
        )
        // Add two accordion items
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/accordion-test/pagecontent/accordions',
                name: 'item1',
                primaryNodeType: 'bootstrap5nt:accordion',
                properties: [
                    {name: 'jcr:title', value: 'First Panel', language: 'en'},
                    {name: 'show', value: 'true', type: 'BOOLEAN'}
                ]
            }
        })
        // Add droppable child content inside the first accordion panel
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/accordion-test/pagecontent/accordions/item1',
                name: 'panel-content',
                primaryNodeType: 'bootstrap5nt:text',
                properties: [{name: 'text', value: '<p class="accordion-text-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>', language: 'en'}]
            }
        })
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/accordion-test/pagecontent/accordions',
                name: 'item2',
                primaryNodeType: 'bootstrap5nt:accordion',
                properties: [
                    {name: 'jcr:title', value: 'Second Panel', language: 'en'},
                    {name: 'show', value: 'false', type: 'BOOLEAN'}
                ]
            }
        })
        publishPage('accordion-test')
    })

    after(() => {
        cy.login()
        deleteTestPage('accordion-test')
    })

    it('bootstrap5 JS bundle is loaded when a JS component is present', () => {
        cy.visit(pageUrl('accordion-test'))
        cy.window().should('have.property', 'bootstrap')
    })

    it('renders the accordion wrapper', () => {
        cy.visit(pageUrl('accordion-test'))
        cy.get('.accordion').should('exist')
    })

    it('renders two accordion items', () => {
        cy.visit(pageUrl('accordion-test'))
        cy.get('.accordion-item').should('have.length', 2)
    })

    it('first panel is expanded by default (show=true)', () => {
        cy.visit(pageUrl('accordion-test'))
        cy.get('.accordion-collapse').first().should('have.class', 'show')
    })

    it('second panel is collapsed by default', () => {
        cy.visit(pageUrl('accordion-test'))
        cy.get('.accordion-collapse').eq(1).should('not.have.class', 'show')
    })

    it('clicking the second header expands it', () => {
        cy.visit(pageUrl('accordion-test'))
        cy.get('.accordion-button').eq(1).click()
        cy.get('.accordion-collapse').eq(1).should('have.class', 'show')
    })

    it('accordion panel body renders droppable child content', () => {
        cy.visit(pageUrl('accordion-test'))
        cy.get('.accordion-text-content').should('exist')
        cy.get('.accordion-text-content').should('contain.text', 'Lorem ipsum')
    })

    it('opening second panel closes the first (single-open behaviour)', () => {
        cy.visit(pageUrl('accordion-test'))
        cy.get('.accordion-button').eq(1).click()
        cy.get('.accordion-collapse').first().should('not.have.class', 'show')
    })

    context('Flush variant', () => {
        before(() => {
            cy.login()
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/accordion-test/pagecontent',
                    name: 'accordions-flush',
                    primaryNodeType: 'bootstrap5nt:accordions',
                    properties: [{name: 'flush', value: 'true', type: 'BOOLEAN'}]
                }
            })
            publishPage('accordion-test')
        })

        it('flush accordion has .accordion-flush class', () => {
            cy.visit(pageUrl('accordion-test'))
            cy.get('.accordion-flush').should('exist')
        })
    })
})
