import {createTestPage, addComponent, publishPage, deleteTestPage, pageUrl, uploadPlaceholderImage} from '../support/bootstrap5'

// Link schemes (b5:safeUrl), carousel defaults, and escaping in views not covered by 12-escaping.cy.ts.
// Choicelist properties with a value constraint (e.g. figure captionAlignment) are rejected by the JCR
// when set to an arbitrary value, so they are not exercised here.
const siteKey = 'bootstrap5test'
const pageName = 'hardening-test'
const stickyPageName = 'hardening-sticky-test'
const textPayload = '<img src="x" class="b5-xss" onerror="window.__b5xss=1">'
const jsUrl = 'javascript:window.__b5xss=1'
const externalLinks = ['b5-link-js', 'b5-link-https']

const expectNoInjection = () => {
    cy.get('img.b5-xss').should('not.exist')
    cy.get('[onmouseover]').should('not.exist')
    cy.window().its('__b5xss').should('be.undefined')
}

const addNode = (parentPathOrId: string, name: string, primaryNodeType: string, properties: object[] = [], mixins: string[] = [], children: object[] = []) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/addNode.graphql',
        variables: {parentPathOrId, name, primaryNodeType, properties, mixins, children}
    })
}

const publish = (path: string) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/publishNode.graphql',
        variables: {pathOrId: path, languages: ['en'], publishSubNodes: true, includeSubTree: true}
    })
}

describe('Bootstrap5 — Link schemes, defaults and escaping hardening', () => {
    const content = `/sites/${siteKey}/home/${pageName}/pagecontent`

    before(() => {
        cy.login()
        createTestPage(pageName)

        // Buttons with an external link: one active scheme, one https
        addComponent(pageName, 'button-js', 'bootstrap5nt:button',
            [
                {name: 'jcr:title', value: 'JS button', language: 'en'},
                {name: 'buttonType', value: 'externalLink'},
                {name: 'externalLink', value: jsUrl}
            ],
            ['bootstrap5mix:externalLink']
        )
        addComponent(pageName, 'button-https', 'bootstrap5nt:button',
            [
                {name: 'jcr:title', value: 'HTTPS button', language: 'en'},
                {name: 'buttonType', value: 'externalLink'},
                {name: 'externalLink', value: 'https://www.jahia.com/'}
            ],
            ['bootstrap5mix:externalLink']
        )

        // Navbar listing /home children, including two jnt:externalLink menu items, with a brand text payload
        addNode(`/sites/${siteKey}/home`, 'b5-link-js', 'jnt:externalLink', [{name: 'j:url', value: jsUrl}])
        addNode(`/sites/${siteKey}/home`, 'b5-link-https', 'jnt:externalLink', [{name: 'j:url', value: 'https://www.jahia.com/'}])
        addNode(content, 'navbar', 'bootstrap5nt:navbar',
            [
                {name: 'root', value: 'homePage'},
                {name: 'maxlevel', value: '1'},
                {name: 'brandText', value: textPayload, language: 'en'}
            ],
            ['bootstrap5mix:navbarGlobalSettings', 'bootstrap5mix:brand']
        )

        // Accordion and tabs item titles
        addNode(content, 'accordions', 'bootstrap5nt:accordions', [], [], [
            {name: 'item', primaryNodeType: 'bootstrap5nt:accordion',
                properties: [{name: 'jcr:title', value: textPayload, language: 'en'}]}
        ])
        addNode(content, 'tabs', 'bootstrap5nt:tabs', [{name: 'type', value: 'tab'}], [], [
            {name: 'tab-one', primaryNodeType: 'jnt:contentList',
                properties: [{name: 'jcr:title', value: textPayload, language: 'en'}]}
        ])

        // Carousel without bootstrap5mix:carouselAdvancedSettings
        uploadPlaceholderImage('placeholder-green.png').then(uuid => {
            addNode(content, 'carousel-default', 'bootstrap5nt:carousel', [], [], [
                {name: 'slide1', primaryNodeType: 'bootstrap5nt:carouselItem',
                    properties: [
                        {name: 'jcr:title', value: 'Default slide', language: 'en'},
                        {name: 'image', value: uuid, type: 'WEAKREFERENCE'}
                    ]}
            ])
            publishPage(pageName)
        })
        externalLinks.forEach(name => publish(`/sites/${siteKey}/home/${name}`))

        // Page using the sticky-footer template, whose title carries the payload
        addNode(`/sites/${siteKey}/home`, stickyPageName, 'jnt:page',
            [
                {name: 'jcr:title', value: `</title>${textPayload}`, language: 'en'},
                {name: 'j:templateName', value: 'sticky-footer'}
            ], [], [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}]
        )
        publishPage(stickyPageName)
    })

    after(() => {
        cy.login()
        deleteTestPage(pageName)
        deleteTestPage(stickyPageName)
        externalLinks.forEach(name => deleteTestPage(name))
    })

    it('never renders a javascript: link', () => {
        cy.visit(pageUrl(pageName))
        cy.get('a[href]').each($a => {
            expect($a.attr('href').replace(/[\s\u0000-\u001f]/g, '').toLowerCase()).not.to.contain('javascript:')
        })
        expectNoInjection()
    })

    it('button with an active scheme is rendered disabled, https is kept', () => {
        cy.visit(pageUrl(pageName))
        cy.contains('button[disabled]', 'JS button').should('exist')
        cy.contains('a.btn', 'HTTPS button').should('have.attr', 'href', 'https://www.jahia.com/')
    })

    it('navbar external link with an active scheme points to #, https is kept', () => {
        cy.visit(pageUrl(pageName))
        cy.contains('nav a', 'b5-link-js').should('have.attr', 'href', '#')
        cy.contains('nav a', 'b5-link-https').should('have.attr', 'href', 'https://www.jahia.com/')
    })

    it('carousel without advanced settings keeps Bootstrap wrap default', () => {
        cy.visit(pageUrl(pageName))
        cy.get('.carousel').should('exist').and('not.have.attr', 'data-bs-wrap')
    })

    it('renders navbar brand, accordion and tab titles as text', () => {
        cy.visit(pageUrl(pageName))
        cy.get('.navbar-brand').should('contain.text', textPayload)
        cy.get('.accordion-button').should('contain.text', textPayload)
        cy.get('.nav-tabs .nav-link').should('contain.text', textPayload)
        expectNoInjection()
    })

    it('escapes the page title in the sticky-footer template', () => {
        cy.visit(pageUrl(stickyPageName))
        cy.title().should('eq', `</title>${textPayload}`)
        expectNoInjection()
    })
})
