import {createTestPage, publishPage, deleteTestPage, pageUrl, uploadPlaceholderImage} from '../support/bootstrap5'

describe('Bootstrap5 — Figure', () => {
    let sharedImageUuid: string

    before(() => {
        cy.login()
        createTestPage('figure-test')
        uploadPlaceholderImage().then(uuid => {
            sharedImageUuid = uuid
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/figure-test/pagecontent',
                    name: 'figure',
                    primaryNodeType: 'bootstrap5nt:figure',
                    properties: [
                        {name: 'image', value: uuid, type: 'WEAKREFERENCE'},
                        {name: 'jcr:title', value: 'A test caption', language: 'en'}
                    ]
                }
            })
            publishPage('figure-test')
        })
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
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/figure-test/pagecontent',
                    name: 'figure-centered',
                    primaryNodeType: 'bootstrap5nt:figure',
                    mixins: ['bootstrap5mix:figureAdvancedSettings'],
                    properties: [
                        {name: 'image', value: sharedImageUuid, type: 'WEAKREFERENCE'},
                        {name: 'jcr:title', value: 'Centered caption', language: 'en'},
                        {name: 'captionAlignment', value: 'text-center'}
                    ]
                }
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
            // thumbnails=true → img-thumbnail class; responsive=false → no img-fluid
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/figure-test/pagecontent',
                    name: 'figure-thumbnail',
                    primaryNodeType: 'bootstrap5nt:figure',
                    mixins: ['bootstrap5mix:imageAdvancedSettings'],
                    properties: [
                        {name: 'image', value: sharedImageUuid, type: 'WEAKREFERENCE'},
                        {name: 'thumbnails', value: 'true', type: 'BOOLEAN'}
                    ]
                }
            })
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/figure-test/pagecontent',
                    name: 'figure-nofluid',
                    primaryNodeType: 'bootstrap5nt:figure',
                    mixins: ['bootstrap5mix:imageAdvancedSettings'],
                    properties: [
                        {name: 'image', value: sharedImageUuid, type: 'WEAKREFERENCE'},
                        {name: 'responsive', value: 'false', type: 'BOOLEAN'}
                    ]
                }
            })
            publishPage('figure-test')
        })

        it('thumbnails=true adds img-thumbnail class', () => {
            cy.visit(pageUrl('figure-test'))
            cy.get('img.img-thumbnail').should('exist')
        })

        it('responsive=false removes img-fluid class', () => {
            cy.visit(pageUrl('figure-test'))
            // figure-nofluid is the last non-fluid figure — it should not have img-fluid
            cy.get('figure.figure').last().find('img').should('not.have.class', 'img-fluid')
        })
    })
})
