import {createTestPage, publishPage, deleteTestPage, pageUrl, uploadPlaceholderImage} from '../support/bootstrap5'

const siteKey = 'bootstrap5test'

const addSeparator = (name: string) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/addNode.graphql',
        variables: {
            parentPathOrId: `/sites/${siteKey}/home/figure-test/pagecontent`,
            name,
            primaryNodeType: 'bootstrap5nt:text',
            properties: [{name: 'text', value: '<hr/>', language: 'en'}]
        }
    })
}

describe('Bootstrap5 — Figure', () => {
    // One distinct colored image per figure variant
    let redUuid: string    // figure (base)
    let blueUuid: string   // figure-centered
    let greenUuid: string  // figure-thumbnail
    let orangeUuid: string // figure-nofluid

    before(() => {
        cy.login()
        createTestPage('figure-test')

        // Upload all four images upfront so nested contexts can reference the UUIDs
        uploadPlaceholderImage('placeholder-red.png').then(uuid => { redUuid = uuid })
        uploadPlaceholderImage('placeholder-blue.png').then(uuid => { blueUuid = uuid })
        uploadPlaceholderImage('placeholder-green.png').then(uuid => { greenUuid = uuid })
        uploadPlaceholderImage('placeholder-orange.png').then(uuid => { orangeUuid = uuid })

        // Base figure (red image) — tests default rendering
        cy.then(() => {
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: `/sites/${siteKey}/home/figure-test/pagecontent`,
                    name: 'figure',
                    primaryNodeType: 'bootstrap5nt:figure',
                    properties: [
                        {name: 'image', value: redUuid, type: 'WEAKREFERENCE'},
                        {name: 'jcr:title', value: 'A test caption', language: 'en'}
                    ]
                }
            })
        })
        publishPage('figure-test')
    })

    after(() => {
        cy.login()
        deleteTestPage('figure-test')
    })

    it('renders the figure wrapper', () => {
        cy.visit(pageUrl('figure-test'))
        cy.get('figure.figure').should('exist')
    })

    it('renders the figure image', () => {
        cy.visit(pageUrl('figure-test'))
        cy.get('figure.figure img.figure-img').should('exist')
    })

    it('image is responsive (img-fluid) by default', () => {
        cy.visit(pageUrl('figure-test'))
        cy.get('figure.figure img.img-fluid').should('exist')
    })

    it('renders the figcaption when title is set', () => {
        cy.visit(pageUrl('figure-test'))
        cy.get('figcaption.figure-caption').should('exist')
    })

    it('figcaption contains the caption text', () => {
        cy.visit(pageUrl('figure-test'))
        cy.get('figcaption.figure-caption').should('contain.text', 'A test caption')
    })

    context('Caption alignment', () => {
        before(() => {
            cy.login()
            // Separator + blue image figure with centered caption
            addSeparator('hr-before-centered')
            cy.then(() => {
                cy.apollo({
                    mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                    variables: {
                        parentPathOrId: `/sites/${siteKey}/home/figure-test/pagecontent`,
                        name: 'figure-centered',
                        primaryNodeType: 'bootstrap5nt:figure',
                        mixins: ['bootstrap5mix:figureAdvancedSettings'],
                        properties: [
                            {name: 'image', value: blueUuid, type: 'WEAKREFERENCE'},
                            {name: 'jcr:title', value: 'Centered caption', language: 'en'},
                            {name: 'captionAlignment', value: 'text-center'}
                        ]
                    }
                })
            })
            publishPage('figure-test')
        })

        it('centered figure caption has text-center class', () => {
            cy.visit(pageUrl('figure-test'))
            cy.get('figcaption.figure-caption.text-center').should('exist')
        })
    })

    context('Image options', () => {
        before(() => {
            cy.login()
            // Separator + green image figure with thumbnail style
            addSeparator('hr-before-thumbnail')
            cy.then(() => {
                cy.apollo({
                    mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                    variables: {
                        parentPathOrId: `/sites/${siteKey}/home/figure-test/pagecontent`,
                        name: 'figure-thumbnail',
                        primaryNodeType: 'bootstrap5nt:figure',
                        mixins: ['bootstrap5mix:imageAdvancedSettings'],
                        properties: [
                            {name: 'image', value: greenUuid, type: 'WEAKREFERENCE'},
                            {name: 'thumbnails', value: 'true', type: 'BOOLEAN'}
                        ]
                    }
                })
            })
            // Separator + orange image figure with responsive disabled
            addSeparator('hr-before-nofluid')
            cy.then(() => {
                cy.apollo({
                    mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                    variables: {
                        parentPathOrId: `/sites/${siteKey}/home/figure-test/pagecontent`,
                        name: 'figure-nofluid',
                        primaryNodeType: 'bootstrap5nt:figure',
                        mixins: ['bootstrap5mix:imageAdvancedSettings'],
                        properties: [
                            {name: 'image', value: orangeUuid, type: 'WEAKREFERENCE'},
                            {name: 'responsive', value: 'false', type: 'BOOLEAN'}
                        ]
                    }
                })
            })
            publishPage('figure-test')
        })

        it('thumbnails=true adds img-thumbnail class', () => {
            cy.visit(pageUrl('figure-test'))
            cy.get('img.img-thumbnail').should('exist')
        })

        it('responsive=false removes img-fluid class', () => {
            cy.visit(pageUrl('figure-test'))
            // figure-nofluid is the last figure — its image must not have img-fluid
            cy.get('figure.figure').last().find('img').should('not.have.class', 'img-fluid')
        })
    })
})
