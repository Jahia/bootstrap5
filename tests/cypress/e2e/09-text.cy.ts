import {createTestPage, publishPage, deleteTestPage, pageUrl} from '../support/bootstrap5'

describe('Bootstrap5 — Text', () => {
    before(() => {
        cy.login()
        createTestPage('text-test')
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/text-test/pagecontent',
                name: 'text',
                primaryNodeType: 'bootstrap5nt:text',
                properties: [
                    {name: 'text', value: '<p class="test-paragraph">Hello Bootstrap5</p>', language: 'en'}
                ]
            }
        })
        publishPage('text-test')
    })

    after(() => {
        cy.login()
        deleteTestPage('text-test')
    })

    it('renders the rich-text content', () => {
        cy.visit(pageUrl('text-test'))
        cy.get('.test-paragraph').should('exist')
    })

    it('renders the correct text content', () => {
        cy.visit(pageUrl('text-test'))
        cy.get('.test-paragraph').should('contain.text', 'Hello Bootstrap5')
    })

    it('renders raw HTML without extra wrapper', () => {
        cy.visit(pageUrl('text-test'))
        cy.get('p.test-paragraph').should('have.length', 1)
    })
})
