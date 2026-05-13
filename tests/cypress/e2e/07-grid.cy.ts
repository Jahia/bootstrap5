import {createTestPage, publishPage, deleteTestPage, pageUrl} from '../support/bootstrap5'

describe('Bootstrap5 — Grid', () => {
    before(() => {
        cy.login()
        createTestPage('grid-test')

        // Predefined grid 6/6 — for 6_6 the JSP maps col 0 → 'main', col 1 → 'side'
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
        // Area subnodes (areaAsSubNode="true") + lorem ipsum content for each column
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/grid-test/pagecontent/grid-predefined',
                name: 'main',
                primaryNodeType: 'jnt:contentList'
            }
        })
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/grid-test/pagecontent/grid-predefined/main',
                name: 'text',
                primaryNodeType: 'bootstrap5nt:text',
                properties: [{name: 'text', value: '<p class="grid-main-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>', language: 'en'}]
            }
        })
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/grid-test/pagecontent/grid-predefined',
                name: 'side',
                primaryNodeType: 'jnt:contentList'
            }
        })
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/grid-test/pagecontent/grid-predefined/side',
                name: 'text',
                primaryNodeType: 'bootstrap5nt:text',
                properties: [{name: 'text', value: '<p class="grid-side-content">Ut enim ad minim veniam, quis nostrud exercitation.</p>', language: 'en'}]
            }
        })

        // Custom grid — JSP maps col 0 → 'col0', col 1 → 'col1'
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
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/grid-test/pagecontent/grid-custom',
                name: 'col0',
                primaryNodeType: 'jnt:contentList'
            }
        })
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/grid-test/pagecontent/grid-custom/col0',
                name: 'text',
                primaryNodeType: 'bootstrap5nt:text',
                properties: [{name: 'text', value: '<p class="grid-col0-content">Duis aute irure dolor in reprehenderit in voluptate velit esse.</p>', language: 'en'}]
            }
        })
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/grid-test/pagecontent/grid-custom',
                name: 'col1',
                primaryNodeType: 'jnt:contentList'
            }
        })
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/grid-test/pagecontent/grid-custom/col1',
                name: 'text',
                primaryNodeType: 'bootstrap5nt:text',
                properties: [{name: 'text', value: '<p class="grid-col1-content">Excepteur sint occaecat cupidatat non proident.</p>', language: 'en'}]
            }
        })

        // Section wrapper (no column areas — just wraps content in <section>)
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

    it('predefined grid main column renders its content', () => {
        cy.visit(pageUrl('grid-test'))
        cy.get('.grid-main-content').should('exist')
    })

    it('predefined grid side column renders its content', () => {
        cy.visit(pageUrl('grid-test'))
        cy.get('.grid-side-content').should('exist')
    })

    it('custom grid applies the configured column classes', () => {
        cy.visit(pageUrl('grid-test'))
        cy.get('.col-8').should('exist')
        cy.get('.col-4').should('exist')
    })

    it('custom grid col-8 renders its content', () => {
        cy.visit(pageUrl('grid-test'))
        cy.get('.grid-col0-content').should('exist')
    })

    it('custom grid col-4 renders its content', () => {
        cy.visit(pageUrl('grid-test'))
        cy.get('.grid-col1-content').should('exist')
    })

    it('section grid renders a <section> element with the configured id', () => {
        cy.visit(pageUrl('grid-test'))
        cy.get('section#test-section').should('exist')
    })
})
