import {createTestPage, publishPage, deleteTestPage, pageUrl} from '../support/bootstrap5'

describe('Bootstrap5 — Grid', () => {
    before(() => {
        cy.login()
        createTestPage('grid-test')

        // Predefined grid 6/6 — property is 'grid' (not 'gridType') on bootstrap5mix:predefinedGrid
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/grid-test/pagecontent',
                name: 'grid-predefined',
                primaryNodeType: 'bootstrap5nt:grid',
                mixins: ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createRow', 'bootstrap5mix:createContainer'],
                properties: [
                    {name: 'grid', value: '6_6'},
                    {name: 'containerType', value: 'container'}
                ]
            }
        })

        // Custom grid — property is 'gridClasses' (not 'customGridClasses') on bootstrap5mix:customGrid
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/grid-test/pagecontent',
                name: 'grid-custom',
                primaryNodeType: 'bootstrap5nt:grid',
                mixins: ['bootstrap5mix:customGrid', 'bootstrap5mix:createRow'],
                properties: [
                    {name: 'gridClasses', value: 'col-8,col-4'}
                ]
            }
        })

        // Section wrapper
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/grid-test/pagecontent',
                name: 'grid-section',
                primaryNodeType: 'bootstrap5nt:grid',
                mixins: ['bootstrap5mix:createSection'],
                properties: [
                    {name: 'sectionElement', value: 'section'},
                    {name: 'sectionId', value: 'test-section'}
                ]
            }
        })

        publishPage('grid-test')
    })

    after(() => {
        cy.login()
        deleteTestPage('grid-test')
    })

    it('predefined grid renders a .container', () => {
        cy.visit(pageUrl('grid-test'))
        cy.get('.container').should('exist')
    })

    it('predefined grid renders a .row', () => {
        cy.visit(pageUrl('grid-test'))
        cy.get('.row').should('exist')
    })

    it('predefined 6/6 grid renders two .col-md-6 columns', () => {
        cy.visit(pageUrl('grid-test'))
        cy.get('.col-md-6').should('have.length.at.least', 2)
    })

    it('custom grid applies the configured column classes', () => {
        cy.visit(pageUrl('grid-test'))
        cy.get('.col-8').should('exist')
        cy.get('.col-4').should('exist')
    })

    it('section grid renders a <section> element with the configured id', () => {
        cy.visit(pageUrl('grid-test'))
        cy.get('section#test-section').should('exist')
    })
})
