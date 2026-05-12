import {createTestPage, addComponent, publishPage, deleteTestPage, pageUrl} from '../support/bootstrap5'

describe('Bootstrap5 — Button', () => {
    before(() => {
        cy.login()
        createTestPage('button-test')
    })

    after(() => {
        cy.login()
        deleteTestPage('button-test')
    })

    context('External link', () => {
        before(() => {
            cy.login()
            addComponent('button-test', 'btn-external', 'bootstrap5nt:button',
                [
                    {name: 'jcr:title', value: 'Visit Jahia', language: 'en'},
                    {name: 'buttonType', value: 'externalLink'},
                    {name: 'externalLink', value: 'https://www.jahia.com'}
                ],
                ['bootstrap5mix:externalLink']
            )
            publishPage('button-test')
        })

        it('renders an <a> tag with .btn class', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('.btn').should('exist')
        })

        it('link points to the external URL', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('.btn[href="https://www.jahia.com"]').should('exist')
        })
    })

    context('Modal', () => {
        before(() => {
            cy.login()
            addComponent('button-test', 'btn-modal', 'bootstrap5nt:button',
                [
                    {name: 'jcr:title', value: 'Open Modal', language: 'en'},
                    {name: 'buttonType', value: 'modal'}
                ],
                ['bootstrap5mix:modal']
            )
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/button-test/pagecontent/btn-modal',
                    name: 'modal-content',
                    primaryNodeType: 'bootstrap5nt:text',
                    properties: [{name: 'text', value: '<p class="modal-body-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>', language: 'en'}]
                }
            })
            publishPage('button-test')
        })

        it('renders a button with data-bs-toggle="modal"', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('button[data-bs-toggle="modal"]').should('exist')
        })

        it('modal div is present in DOM', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('.modal').should('exist')
        })

        it('clicking the button opens the modal', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('button[data-bs-toggle="modal"]').first().click()
            cy.get('.modal.show').should('exist')
        })

        it('modal body renders droppable child content', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('.modal-body-content').should('exist')
        })
    })

    context('Collapse', () => {
        before(() => {
            cy.login()
            addComponent('button-test', 'btn-collapse', 'bootstrap5nt:button',
                [
                    {name: 'jcr:title', value: 'Toggle Content', language: 'en'},
                    {name: 'buttonType', value: 'collapse'}
                ],
                ['bootstrap5mix:collapse']
            )
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/button-test/pagecontent/btn-collapse',
                    name: 'collapse-content',
                    primaryNodeType: 'bootstrap5nt:text',
                    properties: [{name: 'text', value: '<p class="collapse-body-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>', language: 'en'}]
                }
            })
            publishPage('button-test')
        })

        it('renders a toggle with data-bs-toggle="collapse"', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('[data-bs-toggle="collapse"]').should('exist')
        })

        it('collapse area is hidden by default', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('[data-bs-toggle="collapse"]').first().then($btn => {
                // Collapse JSP renders <a href="#collapse-{id}"> not data-bs-target
                const target = $btn.attr('href') || $btn.attr('data-bs-target')
                cy.get(target).should('not.have.class', 'show')
            })
        })

        it('clicking the button expands the collapse area', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('[data-bs-toggle="collapse"]').first().then($btn => {
                const target = $btn.attr('href') || $btn.attr('data-bs-target')
                cy.wrap($btn).click()
                cy.get(target).should('have.class', 'show')
            })
        })

        it('collapse area renders droppable child content', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('.collapse-body-content').should('exist')
        })
    })

    context('Offcanvas', () => {
        before(() => {
            cy.login()
            addComponent('button-test', 'btn-offcanvas', 'bootstrap5nt:button',
                [
                    {name: 'jcr:title', value: 'Open Panel', language: 'en'},
                    {name: 'buttonType', value: 'Offcanvas'}
                ],
                ['bootstrap5mix:Offcanvas']
            )
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/addNode.graphql',
                variables: {
                    parentPathOrId: '/sites/bootstrap5test/home/button-test/pagecontent/btn-offcanvas',
                    name: 'offcanvas-content',
                    primaryNodeType: 'bootstrap5nt:text',
                    properties: [{name: 'text', value: '<p class="offcanvas-body-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>', language: 'en'}]
                }
            })
            publishPage('button-test')
        })

        it('renders a button with data-bs-toggle="offcanvas"', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('[data-bs-toggle="offcanvas"]').should('exist')
        })

        it('clicking the button opens the offcanvas panel', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('[data-bs-toggle="offcanvas"]').first().click()
            cy.get('.offcanvas.show').should('exist')
        })

        it('offcanvas body renders droppable child content', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('.offcanvas-body-content').should('exist')
        })
    })

    context('Styles', () => {
        before(() => {
            cy.login()
            addComponent('button-test', 'btn-styled', 'bootstrap5nt:button',
                [
                    {name: 'jcr:title', value: 'Styled Button', language: 'en'},
                    {name: 'buttonType', value: 'externalLink'},
                    {name: 'externalLink', value: 'https://example.com'},
                    {name: 'style', value: 'danger'},
                    {name: 'size', value: 'btn-lg'}
                ],
                ['bootstrap5mix:externalLink', 'bootstrap5mix:buttonAdvancedSettings']
            )
            addComponent('button-test', 'btn-outline', 'bootstrap5nt:button',
                [
                    {name: 'jcr:title', value: 'Outline Button', language: 'en'},
                    {name: 'buttonType', value: 'externalLink'},
                    {name: 'externalLink', value: 'https://example.com'},
                    {name: 'style', value: 'primary'},
                    {name: 'outline', value: 'true', type: 'BOOLEAN'}
                ],
                ['bootstrap5mix:externalLink', 'bootstrap5mix:buttonAdvancedSettings']
            )
            publishPage('button-test')
        })

        it('applies the configured color class', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('.btn-danger').should('exist')
        })

        it('applies the configured size class', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('.btn-lg').should('exist')
        })

        it('outline=true renders btn-outline-{style} instead of btn-{style}', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('.btn-outline-primary').should('exist')
            cy.get('#btn-outline .btn-primary').should('not.exist')
        })
    })

    context('Modal — advanced', () => {
        before(() => {
            cy.login()
            addComponent('button-test', 'btn-modal-centered', 'bootstrap5nt:button',
                [
                    {name: 'jcr:title', value: 'Centered Modal', language: 'en'},
                    {name: 'buttonType', value: 'modal'},
                    {name: 'verticallyCentered', value: 'true', type: 'BOOLEAN'}
                ],
                ['bootstrap5mix:modal']
            )
            publishPage('button-test')
        })

        it('verticallyCentered=true adds modal-dialog-centered class', () => {
            cy.visit(pageUrl('button-test'))
            cy.get('.modal-dialog-centered').should('exist')
        })
    })
})
