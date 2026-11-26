import {createTestPage, addComponent, publishPage, deleteTestPage, pageUrl} from '../support/bootstrap5'

describe('Bootstrap5 — Card', () => {
    before(() => {
        cy.login()
        createTestPage('card-test')
        addComponent('card-test', 'card-basic', 'bootstrap5nt:card',
            [
                {name: 'jcr:title', value: 'Card Title', language: 'en'},
                {name: 'textAlign', value: 'text-start'},
                {name: 'headerSize', value: 'h3'}
            ]
        )
        // Add droppable child content inside the card body
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/card-test/pagecontent/card-basic',
                name: 'card-body-text',
                primaryNodeType: 'bootstrap5nt:text',
                properties: [{name: 'text', value: '<p class="card-body-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>', language: 'en'}]
            }
        })
        addComponent('card-test', 'card-colors', 'bootstrap5nt:card',
            [
                {name: 'jcr:title', value: 'Colored Card', language: 'en'},
                // JSP renders bg-${backgroundColor}, text-${textColor}, border-${borderColor}
                {name: 'backgroundColor', value: 'primary'},
                {name: 'textColor', value: 'white'},
                {name: 'borderColor', value: 'danger'}
            ],
            ['bootstrap5mix:colors']
        )
        addComponent('card-test', 'card-footer', 'bootstrap5nt:card',
            [
                {name: 'jcr:title', value: 'Card with Footer', language: 'en'},
                {name: 'footer', value: 'Footer text', language: 'en'}
            ]
        )
        publishPage('card-test')
    })

    after(() => {
        cy.login()
        deleteTestPage('card-test')
    })

    it('renders a .card element', () => {
        cy.visit(pageUrl('card-test'))
        cy.get('.card').should('exist')
    })

    it('renders the card body', () => {
        cy.visit(pageUrl('card-test'))
        cy.get('.card-body').should('exist')
    })

    it('renders the card header with the configured tag', () => {
        cy.visit(pageUrl('card-test'))
        // JSP renders <h3 class="card-header">title</h3> — h3 IS the card-header element
        cy.get('h3.card-header').should('exist')
    })

    it('applies background color class', () => {
        cy.visit(pageUrl('card-test'))
        cy.get('.card.bg-primary').should('exist')
    })

    it('applies text color class', () => {
        cy.visit(pageUrl('card-test'))
        cy.get('.card.text-white').should('exist')
    })

    it('applies border color class', () => {
        cy.visit(pageUrl('card-test'))
        cy.get('.card.border-danger').should('exist')
    })

    it('renders the card footer with text', () => {
        cy.visit(pageUrl('card-test'))
        cy.get('.card-footer').should('contain', 'Footer text')
    })

    it('card body renders droppable child content', () => {
        cy.visit(pageUrl('card-test'))
        cy.get('.card-body-content').should('exist')
        cy.get('.card-body-content').should('contain.text', 'Lorem ipsum')
    })
})
