import {createTestPage, addComponent, publishPage, deleteTestPage, pageUrl, uploadPlaceholderImage} from '../support/bootstrap5'

// Editor-provided text and CSS class values must be rendered as text, never as markup.
// Each payload tries to inject an <img onerror> that would set window.__b5xss.
const textPayload = '<img src="x" class="b5-xss" onerror="window.__b5xss=1">'
const attrPayload = 'x" onmouseover="window.__b5xss=1'
const pageName = 'escaping-test'
const titlePageName = 'escaping-title-test'

const expectNoInjection = () => {
    cy.get('img.b5-xss').should('not.exist')
    cy.get('[onmouseover]').should('not.exist')
    cy.window().its('__b5xss').should('be.undefined')
}

describe('Bootstrap5 — Escaping of editor-provided values', () => {
    before(() => {
        cy.login()
        createTestPage(pageName)
        addComponent(pageName, 'button-modal', 'bootstrap5nt:button',
            [
                {name: 'jcr:title', value: textPayload, language: 'en'},
                {name: 'buttonType', value: 'modal'},
                {name: 'modalTitle', value: textPayload, language: 'en'},
                {name: 'closeText', value: textPayload, language: 'en'},
                {name: 'cssClass', value: attrPayload}
            ],
            ['bootstrap5mix:modal', 'bootstrap5mix:buttonAdvancedSettings']
        )
        addComponent(pageName, 'card', 'bootstrap5nt:card',
            [
                {name: 'jcr:title', value: textPayload, language: 'en'},
                {name: 'footer', value: textPayload, language: 'en'}
            ]
        )
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: `/sites/bootstrap5test/home/${pageName}/pagecontent`,
                name: 'grid-custom',
                primaryNodeType: 'bootstrap5nt:grid',
                mixins: ['bootstrap5mix:customGrid', 'bootstrap5mix:createRow'],
                properties: [{name: 'gridClasses', value: `col-8,${attrPayload}`}]
            }
        })
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: `/sites/bootstrap5test/home/${pageName}/pagecontent`,
                name: 'carousel',
                primaryNodeType: 'bootstrap5nt:carousel'
            }
        })
        uploadPlaceholderImage('placeholder-orange.png').then(uuid => {
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: `/sites/bootstrap5test/home/${pageName}/pagecontent/carousel`,
                    name: 'slide1',
                    primaryNodeType: 'bootstrap5nt:carouselItem',
                    mixins: ['bootstrap5mix:advancedCarouselItem'],
                    properties: [
                        {name: 'jcr:title', value: textPayload, language: 'en'},
                        {name: 'caption', value: textPayload, language: 'en'},
                        {name: 'carouselItemClass', value: attrPayload},
                        {name: 'image', value: uuid, type: 'WEAKREFERENCE'}
                    ]
                }
            })
            publishPage(pageName)
        })

        // Page whose own title carries the payload, rendered in <title> by the template
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home',
                name: titlePageName,
                primaryNodeType: 'jnt:page',
                properties: [
                    {name: 'jcr:title', value: `</title>${textPayload}`, language: 'en'},
                    {name: 'j:templateName', value: 'starter'}
                ],
                children: [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}]
            }
        })
        publishPage(titlePageName)
    })

    after(() => {
        cy.login()
        deleteTestPage(pageName)
        deleteTestPage(titlePageName)
    })

    it('renders component text and class values without injecting markup', () => {
        cy.visit(pageUrl(pageName))
        expectNoInjection()
    })

    it('renders the payload as visible text', () => {
        cy.visit(pageUrl(pageName))
        cy.get('.card-header').should('contain.text', textPayload)
        cy.get('.card-footer').should('contain.text', textPayload)
        cy.get('.carousel-caption h3').should('contain.text', textPayload)
        cy.get('.carousel-caption p').should('contain.text', textPayload)
        cy.get('[data-bs-toggle="modal"]').should('contain.text', textPayload)
    })

    it('escapes the page title in <title>', () => {
        cy.visit(pageUrl(titlePageName))
        cy.title().should('eq', `</title>${textPayload}`)
        expectNoInjection()
    })
})
