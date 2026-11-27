import {getNodeByPath} from '@jahia/cypress'
import {createTestPage, deleteTestPage, publishPage, pageUrl, addNode, addAreaWithTexts, deleteNode, publishNode, editFrameUrl} from '../support/bootstrap5'
import {checkA11y} from '../support/a11y'

const siteKey = 'bootstrap5test'
const home = `/sites/${siteKey}/home`
const page = `${home}/a11y-test`
const content = `${page}/pagecontent`

const text = (marker: string, html = marker) => [{name: 'text', value: `<p class="${marker}">${html}</p>`, language: 'en'}]

const addPage = (parent: string, name: string, title: string) => {
    addNode(parent, name, 'jnt:page', [
        {name: 'jcr:title', value: title, language: 'en'},
        {name: 'j:templateName', value: 'starter'}
    ], [], [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}])
}

/**
 * Bootstrap fades dialogs and panels in: colours measured during the transition are not the final
 * ones, so contrast is only checked once it is over.
 */
const waitForTransitions = () => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(600)
}

/** A real key press on the focused element (links only react to a real Enter key). */
const press = (key: 'Enter' | 'Escape') => cy.press(key)

// Accessibility of what the modules render: automatic WCAG 2.2 A/AA rules (axe-core) on a page
// holding every component, in its different states, and keyboard operation of the interactive ones.
describe('Bootstrap5 — Accessibility', () => {
    before(() => {
        cy.login()
        createTestPage('a11y-test')

        // Pages for a three-level menu
        addPage(home, 'a11y-section', 'Section')
        addPage(`${home}/a11y-section`, 'a11y-sub', 'Sub section')
        addPage(`${home}/a11y-section/a11y-sub`, 'a11y-leaf', 'Leaf page')

        cy.fixture('images/placeholder-blue.png', 'binary').then((image: string) => {
            const blob = Cypress.Blob.binaryStringToBlob(image, 'image/png')
            const file = new File([blob], 'a11y-image.png', {type: blob.type})
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/uploadFile.graphql',
                variables: {parentPathOrId: `/sites/${siteKey}/files`, name: 'a11y-image.png', mimeType: 'image/png', file}
            })
        })

        getNodeByPath(`/sites/${siteKey}/files/a11y-image.png`).its('data.jcr.nodeByPath.uuid').then((imageUuid: string) => {
            addNode(content, 'navbar', 'bootstrap5nt:navbar', [
                {name: 'root', value: 'homePage'},
                {name: 'maxlevel', value: '3'},
                {name: 'brandText', value: 'Test site', language: 'en'}
            ], ['bootstrap5mix:navbarGlobalSettings', 'bootstrap5mix:brand'])
            addNode(content, 'breadcrumb', 'bootstrap5nt:breadcrumb')
            addNode(content, 'intro', 'bootstrap5nt:text', [{name: 'text', value: '<h1>Accessibility test page</h1><p>Introduction.</p>', language: 'en'}])

            addNode(content, 'alert-text', 'bootstrap5nt:text', [
                ...text('a11y-alert', 'Alert content'),
                {name: 'j:skin', value: 'skins.alert'},
                {name: 'backgroundColor', value: 'warning'},
                {name: 'addDismissButton', value: 'true', type: 'BOOLEAN'}
            ], ['jmix:skinnable', 'bootstrap5mix:alert'])

            addNode(content, 'grid', 'bootstrap5nt:grid', [{name: 'grid', value: '4_8'}],
                ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createRow', 'bootstrap5mix:createContainer'])
            addAreaWithTexts(`${content}/grid`, 'main', ['a11y-grid-main'])
            addAreaWithTexts(`${content}/grid`, 'side', ['a11y-grid-side'])

            addNode(content, 'accordions', 'bootstrap5nt:accordions', [], [], [
                {name: 'panel-1', primaryNodeType: 'bootstrap5nt:accordion', properties: [
                    {name: 'jcr:title', value: 'First panel', language: 'en'},
                    {name: 'text', value: '<p>First panel text</p>', language: 'en'},
                    {name: 'show', value: 'true', type: 'BOOLEAN'}
                ]},
                {name: 'panel-2', primaryNodeType: 'bootstrap5nt:accordion', properties: [
                    {name: 'jcr:title', value: 'Second panel', language: 'en'},
                    {name: 'text', value: '<p>Second panel text</p>', language: 'en'}
                ]}
            ])

            addNode(content, 'tabs', 'bootstrap5nt:tabs', [
                {name: 'type', value: 'tab'},
                {name: 'fade', value: 'true', type: 'BOOLEAN'},
                {name: 'useListNameAsAnchor', value: 'true', type: 'BOOLEAN'}
            ], [], [
                {name: 'overview', primaryNodeType: 'jnt:contentList', properties: [{name: 'jcr:title', value: 'Overview', language: 'en'}]},
                {name: 'details', primaryNodeType: 'jnt:contentList', properties: [{name: 'jcr:title', value: 'Details', language: 'en'}]}
            ])
            addNode(`${content}/tabs/overview`, 'text', 'bootstrap5nt:text', text('a11y-tab-overview', 'Overview content'))
            addNode(`${content}/tabs/details`, 'text', 'bootstrap5nt:text', text('a11y-tab-details', 'Details content'))

            addNode(content, 'carousel', 'bootstrap5nt:carousel', [
                {name: 'useIndicators', value: 'true', type: 'BOOLEAN'},
                {name: 'useLeftAndRightControls', value: 'true', type: 'BOOLEAN'},
                {name: 'ride', value: 'false', type: 'BOOLEAN'}
            ], ['bootstrap5mix:carouselAdvancedSettings'], [
                {name: 'slide-1', primaryNodeType: 'bootstrap5nt:carouselItem', properties: [
                    {name: 'jcr:title', value: 'First slide', language: 'en'},
                    {name: 'image', value: imageUuid, type: 'WEAKREFERENCE'}
                ]},
                {name: 'slide-2', primaryNodeType: 'bootstrap5nt:carouselItem', properties: [
                    {name: 'jcr:title', value: 'Second slide', language: 'en'},
                    {name: 'image', value: imageUuid, type: 'WEAKREFERENCE'}
                ]}
            ])

            addNode(content, 'card', 'bootstrap5nt:card', [
                {name: 'jcr:title', value: 'Card title', language: 'en'},
                {name: 'headerSize', value: 'h2'},
                {name: 'image', value: imageUuid, type: 'WEAKREFERENCE'},
                {name: 'footer', value: 'Card footer', language: 'en'}
            ])
            addNode(`${content}/card`, 'body', 'bootstrap5nt:text', text('a11y-card-body', 'Card body'))

            addNode(content, 'figure', 'bootstrap5nt:figure', [
                {name: 'jcr:title', value: 'Figure caption', language: 'en'},
                {name: 'image', value: imageUuid, type: 'WEAKREFERENCE'}
            ])

            addNode(content, 'button-external', 'bootstrap5nt:button', [
                {name: 'jcr:title', value: 'Visit Jahia', language: 'en'},
                {name: 'buttonType', value: 'externalLink'},
                {name: 'externalLink', value: 'https://www.jahia.com'}
            ], ['bootstrap5mix:externalLink'])
            addNode(content, 'button-modal', 'bootstrap5nt:button', [
                {name: 'jcr:title', value: 'Open dialog', language: 'en'},
                {name: 'buttonType', value: 'modal'},
                {name: 'modalTitle', value: 'Dialog title', language: 'en'}
            ], ['bootstrap5mix:modal'])
            addNode(`${content}/button-modal`, 'content', 'bootstrap5nt:text', text('a11y-modal-content', 'Dialog content'))
            addNode(content, 'button-collapse', 'bootstrap5nt:button', [
                {name: 'jcr:title', value: 'Toggle details', language: 'en'},
                {name: 'buttonType', value: 'collapse'}
            ], ['bootstrap5mix:collapse'])
            addNode(`${content}/button-collapse`, 'content', 'bootstrap5nt:text', text('a11y-collapse-content', 'Collapsed content'))
            addNode(content, 'button-offcanvas', 'bootstrap5nt:button', [
                {name: 'jcr:title', value: 'Open panel', language: 'en'},
                {name: 'buttonType', value: 'Offcanvas'},
                {name: 'OffcanvasTitle', value: 'Panel title', language: 'en'}
            ], ['bootstrap5mix:Offcanvas'])
            addNode(`${content}/button-offcanvas`, 'content', 'bootstrap5nt:text', text('a11y-offcanvas-content', 'Panel content'))
            addNode(content, 'button-popover', 'bootstrap5nt:button', [
                {name: 'jcr:title', value: 'More information', language: 'en'},
                {name: 'buttonType', value: 'popover'},
                {name: 'popoverTitle', value: 'Popover title', language: 'en'},
                {name: 'popoverContent', value: 'Popover content', language: 'en'}
            ], ['bootstrap5mix:popover'])

            addNode(content, 'pager', 'bootstrap5nt:pagination', [
                {name: 'displayPager', value: 'true'},
                {name: 'pageSize', value: '2'},
                {name: 'nbOfPages', value: '10'},
                {name: 'nbOfPagesInEdit', value: '100'}
            ], ['bootstrap5mix:advancedPagination'])
            addNode(content, 'paged-list', 'jnt:contentList')
            for (let i = 1; i <= 5; i++) {
                addNode(`${content}/paged-list`, `item-${i}`, 'bootstrap5nt:text', text('a11y-paged-item', `Item ${i}`))
            }
        })

        getNodeByPath(`${content}/paged-list`).its('data.jcr.nodeByPath.uuid').then((listUuid: string) => {
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/mutateNode.graphql',
                variables: {pathOrId: `${content}/pager`, properties: [{name: 'j:bindedComponent', value: listUuid, type: 'WEAKREFERENCE'}]}
            })
        })

        publishNode(`${home}/a11y-section`)
        publishPage('a11y-test')
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(3000)
    })

    after(() => {
        cy.login()
        deleteTestPage('a11y-test')
        deleteNode(`${home}/a11y-section`)
    })

    context('Automatic WCAG 2.2 A/AA rules (axe-core)', () => {
        beforeEach(() => {
            cy.visit(pageUrl('a11y-test'))
            cy.get('.a11y-grid-main').should('exist')
        })

        it('the page as it loads', () => {
            checkA11y('live page')
        })

        it('with a menu and its sub-menu open', () => {
            cy.get('nav.navbar li.dropdown > a.dropdown-toggle').first().click()
            cy.get('nav.navbar li.dropdown > ul.dropdown-menu').should('have.class', 'show')
            cy.get('nav.navbar li.dropend > a.dropdown-toggle').first().focus()
            press('Enter')
            cy.get('nav.navbar ul.submenu').should('be.visible')
            checkA11y('menu open', {include: 'nav.navbar'})
        })

        it('with the second tab open', () => {
            cy.get('#tab-btn-details').click()
            cy.get('#details').should('have.class', 'active')
            checkA11y('second tab open', {include: '.tab-content'})
            checkA11y('tab list', {include: 'ul[role="tablist"]'})
        })

        it('with the second accordion panel open', () => {
            cy.get('.accordion-button').eq(1).click()
            cy.get('.accordion-collapse').eq(1).should('have.class', 'show')
            checkA11y('accordion open', {include: '.accordion'})
        })

        it('with the dialog open', () => {
            cy.get('[data-bs-toggle="modal"][data-bs-target^="#modal-"]').click()
            cy.get('.modal.show .a11y-modal-content').should('be.visible')
            waitForTransitions()
            checkA11y('dialog open', {include: '.modal.show'})
        })

        it('with the offcanvas panel open', () => {
            cy.get('[data-bs-toggle="offcanvas"]').click()
            cy.get('.offcanvas.show .a11y-offcanvas-content').should('be.visible')
            waitForTransitions()
            checkA11y('offcanvas open', {include: '.offcanvas.show'})
        })

        it('with the collapse open', () => {
            cy.get('button.btn[data-bs-toggle="collapse"]').click()
            cy.get('.a11y-collapse-content').should('be.visible')
            waitForTransitions()
            checkA11y('collapse open', {include: 'main'})
        })

        it('on the second page of the paged list', () => {
            cy.contains('ul.pagination a.page-link', '2').click()
            cy.get('ul.pagination .page-item.active').should('contain.text', '2')
            checkA11y('second page of the list')
        })

        it('with the login dialog open', () => {
            cy.get('nav.navbar button.login').click()
            cy.get('.modal.show input[name="username"]').should('be.visible')
            waitForTransitions()
            checkA11y('login dialog', {include: '.modal.show'})
        })
    })

    context('Automatic rules in edit mode', () => {
        it('the components as editors see them', () => {
            cy.login()
            cy.visit(editFrameUrl(page))
            cy.get('.a11y-grid-main').should('exist')
            // Only what the modules render: the wrappers and placeholders Jahia adds in edit mode
            // are Jahia's own markup
            checkA11y('edit mode', {include: 'main', exclude: ['[jahiatype="module"][type="placeholder"]', '.jahia-template-gxt > img']})
        })
    })

    context('Keyboard', () => {
        beforeEach(() => {
            cy.visit(pageUrl('a11y-test'))
            cy.get('.a11y-grid-main').should('exist')
        })

        it('the skip link is the first stop and targets the main content', () => {
            cy.get('body a').first()
                .should('have.attr', 'href', '#main')
                .focus()
            cy.focused().should('be.visible').and('have.text', 'Skip to main content')
            cy.get('main#main').should('have.attr', 'tabindex', '-1')
        })

        it('menu: Enter opens it, Escape closes it and gives the focus back', () => {
            cy.get('nav.navbar li.dropdown > a.dropdown-toggle').first().as('toggle').focus()
            press('Enter')
            cy.get('@toggle').should('have.attr', 'aria-expanded', 'true')
            cy.get('nav.navbar li.dropdown > ul.dropdown-menu').should('be.visible')
            press('Escape')
            cy.get('@toggle').should('have.attr', 'aria-expanded', 'false')
            cy.focused().should('have.attr', 'id').then(id => {
                cy.get('@toggle').should('have.attr', 'id', id)
            })
        })

        it('sub-menu: opens from the keyboard and its pages can be reached', () => {
            // The menu of this spec's own pages: other specs leave theirs in the navigation
            cy.get('nav.navbar a.dropdown-toggle[href$="/a11y-sub.html"]').as('subToggle')
            cy.get('@subToggle').closest('li.dropdown').children('a.dropdown-toggle').focus()
            press('Enter')
            cy.get('@subToggle').should('be.visible').focus()
            press('Enter')
            cy.get('@subToggle').should('have.attr', 'aria-expanded', 'true')
            cy.get('@subToggle').siblings('ul.submenu').should('be.visible')
            cy.get('nav.navbar ul.submenu a[href$="/a11y-leaf.html"]').should('be.visible').focus()
            cy.focused().should('have.attr', 'href').and('include', 'a11y-leaf')
        })

        it('tabs: arrow keys move between tabs, and the focus stays on the tab', () => {
            cy.get('#tab-btn-overview').focus().type('{rightarrow}')
            cy.get('#tab-btn-details').should('have.attr', 'aria-selected', 'true')
            cy.focused().should('have.attr', 'id', 'tab-btn-details')
            cy.location('hash').should('eq', '#details')
            cy.get('#tab-btn-overview').should('have.attr', 'tabindex', '-1')
            cy.focused().type('{leftarrow}')
            cy.focused().should('have.attr', 'id', 'tab-btn-overview')
        })

        it('dialog: opens with the focus inside, Escape closes it and gives the focus back', () => {
            cy.get('[data-bs-toggle="modal"][data-bs-target^="#modal-"]').as('trigger').focus().type('{enter}')
            cy.get('.modal.show').should('be.visible').and('have.attr', 'aria-modal', 'true')
            cy.focused().closest('.modal.show').should('exist')
            cy.focused().type('{esc}')
            cy.get('.modal.show').should('not.exist')
            cy.focused().should('have.attr', 'data-bs-toggle', 'modal')
        })

        it('offcanvas: opens with the focus inside, Escape closes it and gives the focus back', () => {
            cy.get('[data-bs-toggle="offcanvas"]').focus().type('{enter}')
            cy.get('.offcanvas.show').should('be.visible')
            cy.focused().closest('.offcanvas.show').should('exist')
            cy.focused().type('{esc}')
            cy.get('.offcanvas.show').should('not.exist')
            cy.focused().should('have.attr', 'data-bs-toggle', 'offcanvas')
        })

        it('accordion: the header button toggles its panel and says so', () => {
            cy.get('.accordion-button').eq(1).as('header').focus().type('{enter}')
            cy.get('@header').should('have.attr', 'aria-expanded', 'true')
            cy.get('.accordion-collapse').eq(1).should('have.class', 'show')
        })

        it('carousel: the controls are buttons with a name, and change the slide', () => {
            cy.get('.carousel-control-next').should('have.prop', 'tagName', 'BUTTON').focus().type('{enter}')
            cy.get('.carousel-item').eq(1).should('have.class', 'active')
            cy.get('.carousel-control-prev .visually-hidden').should('have.text', 'Previous')
            cy.get('.carousel-indicators button').first().should('have.attr', 'aria-label', 'Slide 1')
        })

        it('pagination: every enabled entry is a reachable link, disabled ones are not links', () => {
            cy.get('ul.pagination .page-item:not(.disabled):not(.active) a.page-link').each($link => {
                expect($link).not.to.have.attr('tabindex')
                expect($link.attr('href')).to.include('begin')
            })
            cy.get('ul.pagination .page-item.disabled a').should('not.exist')
        })

        it('alert: the dismiss button has a name and removes the alert', () => {
            cy.get('.alert .btn-close').should('have.attr', 'aria-label', 'Close').focus().type('{enter}')
            cy.get('.a11y-alert').should('not.exist')
        })
    })
})
