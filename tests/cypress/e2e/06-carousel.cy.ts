import {createTestPage, publishPage, deleteTestPage, pageUrl, uploadPlaceholderImage} from '../support/bootstrap5'

describe('Bootstrap5 — Carousel', () => {
    let redImageUuid: string
    let blueImageUuid: string

    before(() => {
        cy.login()
        createTestPage('carousel-test')
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addNode.graphql',
            variables: {
                parentPathOrId: '/sites/bootstrap5test/home/carousel-test/pagecontent',
                name: 'carousel',
                primaryNodeType: 'bootstrap5nt:carousel',
                mixins: ['bootstrap5mix:carouselAdvancedSettings'],
                properties: [
                    {name: 'useIndicators', value: 'true', type: 'BOOLEAN'},
                    {name: 'useLeftAndRightControls', value: 'true', type: 'BOOLEAN'},
                    {name: 'ride', value: 'false', type: 'BOOLEAN'}
                ]
            }
        })
        // Upload two distinct placeholder images (red + blue) — one per slide
        uploadPlaceholderImage('placeholder-red.png').then(uuid => {
            redImageUuid = uuid
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/carousel-test/pagecontent/carousel',
                    name: 'slide1',
                    primaryNodeType: 'bootstrap5nt:carouselItem',
                    properties: [
                        {name: 'jcr:title', value: 'Slide One', language: 'en'},
                        {name: 'image', value: uuid, type: 'WEAKREFERENCE'}
                    ]
                }
            })
        })
        uploadPlaceholderImage('placeholder-blue.png').then(uuid => {
            blueImageUuid = uuid
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/carousel-test/pagecontent/carousel',
                    name: 'slide2',
                    primaryNodeType: 'bootstrap5nt:carouselItem',
                    properties: [
                        {name: 'jcr:title', value: 'Slide Two', language: 'en'},
                        {name: 'image', value: uuid, type: 'WEAKREFERENCE'}
                    ]
                }
            })
            publishPage('carousel-test')
        })
    })

    after(() => {
        cy.login()
        deleteTestPage('carousel-test')
    })

    it('renders the carousel wrapper', () => {
        cy.visit(pageUrl('carousel-test'))
        cy.get('.carousel').should('exist')
    })

    it('renders two carousel items', () => {
        cy.visit(pageUrl('carousel-test'))
        cy.get('.carousel-item').should('have.length', 2)
    })

    it('first slide is active', () => {
        cy.visit(pageUrl('carousel-test'))
        cy.get('.carousel-item').first().should('have.class', 'active')
    })

    it('slide image is rendered', () => {
        cy.visit(pageUrl('carousel-test'))
        cy.get('.carousel-item img').should('exist')
    })

    it('renders indicators when enabled', () => {
        cy.visit(pageUrl('carousel-test'))
        cy.get('.carousel-indicators').should('exist')
    })

    it('renders prev/next controls', () => {
        cy.visit(pageUrl('carousel-test'))
        cy.get('.carousel-control-prev').should('exist')
        cy.get('.carousel-control-next').should('exist')
    })

    it('ride=false does not add data-bs-ride attribute', () => {
        cy.visit(pageUrl('carousel-test'))
        cy.get('.carousel').first().should('not.have.attr', 'data-bs-ride')
    })

    context('Ride variant', () => {
        before(() => {
            cy.login()
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/carousel-test/pagecontent',
                    name: 'carousel-ride',
                    primaryNodeType: 'bootstrap5nt:carousel',
                    mixins: ['bootstrap5mix:carouselAdvancedSettings'],
                    properties: [
                        {name: 'ride', value: 'true', type: 'BOOLEAN'},
                        {name: 'useIndicators', value: 'false', type: 'BOOLEAN'},
                        {name: 'useLeftAndRightControls', value: 'false', type: 'BOOLEAN'}
                    ]
                }
            })
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/carousel-test/pagecontent/carousel-ride',
                    name: 'slide1',
                    primaryNodeType: 'bootstrap5nt:carouselItem',
                    properties: [
                        {name: 'jcr:title', value: 'Auto Slide', language: 'en'},
                        {name: 'image', value: blueImageUuid, type: 'WEAKREFERENCE'}
                    ]
                }
            })
            publishPage('carousel-test')
        })

        it('ride=true adds data-bs-ride="carousel" attribute', () => {
            cy.visit(pageUrl('carousel-test'))
            cy.get('[data-bs-ride="carousel"]').should('exist')
        })
    })

    context('Keyboard/wrap disabled', () => {
        before(() => {
            cy.login()
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/carousel-test/pagecontent',
                    name: 'carousel-nokb',
                    primaryNodeType: 'bootstrap5nt:carousel',
                    mixins: ['bootstrap5mix:carouselAdvancedSettings'],
                    properties: [
                        {name: 'ride', value: 'false', type: 'BOOLEAN'},
                        {name: 'keyboard', value: 'false', type: 'BOOLEAN'},
                        {name: 'wrap', value: 'false', type: 'BOOLEAN'},
                        {name: 'useIndicators', value: 'false', type: 'BOOLEAN'},
                        {name: 'useLeftAndRightControls', value: 'false', type: 'BOOLEAN'}
                    ]
                }
            })
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/carousel-test/pagecontent/carousel-nokb',
                    name: 'slide1',
                    primaryNodeType: 'bootstrap5nt:carouselItem',
                    properties: [
                        {name: 'jcr:title', value: 'No KB Slide', language: 'en'},
                        {name: 'image', value: blueImageUuid, type: 'WEAKREFERENCE'}
                    ]
                }
            })
            publishPage('carousel-test')
        })

        it('keyboard=false adds data-bs-keyboard="false"', () => {
            cy.visit(pageUrl('carousel-test'))
            cy.get('[data-bs-keyboard="false"]').should('exist')
        })

        it('wrap=false adds data-bs-wrap="false"', () => {
            cy.visit(pageUrl('carousel-test'))
            cy.get('[data-bs-wrap="false"]').should('exist')
        })
    })

    context('Fade variant', () => {
        before(() => {
            cy.login()
            // Reuse blueImageUuid set by the outer before() — no second upload needed
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/carousel-test/pagecontent',
                    name: 'carousel-fade',
                    primaryNodeType: 'bootstrap5nt:carousel',
                    mixins: ['bootstrap5mix:carouselAdvancedSettings'],
                    properties: [
                        {name: 'fade', value: 'true', type: 'BOOLEAN'},
                        {name: 'useLeftAndRightControls', value: 'false', type: 'BOOLEAN'}
                    ]
                }
            })
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/carousel-test/pagecontent/carousel-fade',
                    name: 'slide1',
                    primaryNodeType: 'bootstrap5nt:carouselItem',
                    properties: [
                        {name: 'jcr:title', value: 'Fade Slide', language: 'en'},
                        {name: 'image', value: blueImageUuid, type: 'WEAKREFERENCE'}
                    ]
                }
            })
            publishPage('carousel-test')
        })

        it('fade carousel has .carousel-fade class', () => {
            cy.visit(pageUrl('carousel-test'))
            cy.get('.carousel-fade').should('exist')
        })
    })
})
