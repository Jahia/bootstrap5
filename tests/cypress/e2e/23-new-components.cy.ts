import {createSite, deleteSite, getNodeByPath} from '@jahia/cypress'
import {createTestPage, deleteTestPage, publishPage, pageUrl, addNode, publishNode, editFrameUrl} from '../support/bootstrap5'
import {checkA11y} from '../support/a11y'

const siteKey = 'bootstrap5test'
const page = `/sites/${siteKey}/home/new-components-test`
const content = `${page}/pagecontent`

const rtlSite = 'bootstrap5rtl'
const ck5Site = 'bootstrap5ck5styles'

// Components and options added in 3.1: button group, progress bar, tooltip on buttons, colour mode,
// right-to-left stylesheet, Bootstrap styles in CKEditor 5.
describe('Bootstrap5 — Button group, progress, tooltip, colour mode, RTL', () => {
    before(() => {
        cy.login()
        createTestPage('new-components-test')

        addNode(content, 'navbar', 'bootstrap5nt:navbar', [
            {name: 'root', value: 'homePage'},
            {name: 'addColorModeButton', value: 'true', type: 'BOOLEAN'},
            {name: 'navClass', value: 'navbar navbar-expand-lg bg-body-tertiary'}
        ], ['bootstrap5mix:navbarGlobalSettings', 'bootstrap5mix:customizeNavbar'])

        // Button group: a link, a modal and a collapse button
        addNode(content, 'group', 'bootstrap5nt:buttonGroup', [{name: 'jcr:title', value: 'Actions', language: 'en'}])
        addNode(`${content}/group`, 'link', 'bootstrap5nt:button', [
            {name: 'jcr:title', value: 'Visit', language: 'en'},
            {name: 'buttonType', value: 'externalLink'},
            {name: 'externalLink', value: 'https://www.jahia.com'},
            {name: 'tooltip', value: 'Opens the Jahia website', language: 'en'}
        ], ['bootstrap5mix:externalLink', 'bootstrap5mix:buttonAdvancedSettings'])
        addNode(`${content}/group`, 'modal', 'bootstrap5nt:button', [
            {name: 'jcr:title', value: 'Details', language: 'en'},
            {name: 'buttonType', value: 'modal'},
            {name: 'modalTitle', value: 'Details', language: 'en'}
        ], ['bootstrap5mix:modal'])
        addNode(`${content}/group/modal`, 'content', 'bootstrap5nt:text',
            [{name: 'text', value: '<p class="group-modal-content">Modal content</p>', language: 'en'}])
        addNode(`${content}/group`, 'collapse', 'bootstrap5nt:button', [
            {name: 'jcr:title', value: 'More', language: 'en'},
            {name: 'buttonType', value: 'collapse'}
        ], ['bootstrap5mix:collapse'])
        addNode(`${content}/group/collapse`, 'content', 'bootstrap5nt:text',
            [{name: 'text', value: '<p class="group-collapse-content">Collapse content</p>', language: 'en'}])

        // Progress bars
        addNode(content, 'progress', 'bootstrap5nt:progress', [
            {name: 'label', value: 'Funds raised', language: 'en'},
            {name: 'value', value: '30', type: 'LONG'},
            {name: 'max', value: '120', type: 'LONG'},
            {name: 'color', value: 'warning'},
            {name: 'showValue', value: 'true', type: 'BOOLEAN'}
        ])
        addNode(content, 'progress-unnamed', 'bootstrap5nt:progress', [{name: 'value', value: '60', type: 'LONG'}])

        publishPage('new-components-test')
    })

    after(() => {
        cy.login()
        deleteTestPage('new-components-test')
    })

    context('Button group', () => {
        beforeEach(() => {
            cy.visit(pageUrl('new-components-test'))
        })

        it('groups its buttons, with the name given by the editor', () => {
            cy.get('.btn-group[role="group"][aria-label="Actions"]').within(() => {
                cy.get('a.btn, button.btn').should('have.length', 3)
            })
        })

        it('keeps the buttons adjacent: panels are rendered after the group', () => {
            cy.get('.btn-group .modal, .btn-group .collapse').should('not.exist')
            cy.get('.btn-group').children().each($child => {
                expect($child).to.have.class('btn')
            })
        })

        it('the modal button of the group still opens its modal', () => {
            cy.get('.btn-group [data-bs-toggle="modal"]').click()
            cy.get('.modal.show .group-modal-content').should('be.visible')
        })

        it('the collapse button of the group still toggles its panel', () => {
            cy.get('.btn-group [data-bs-toggle="collapse"]').click()
            cy.get('.group-collapse-content').should('be.visible')
        })
    })

    context('Progress bar', () => {
        beforeEach(() => {
            cy.visit(pageUrl('new-components-test'))
        })

        it('exposes its name and values, and fills the bar in proportion', () => {
            cy.get('.progress[aria-label="Funds raised"]')
                .should('have.attr', 'role', 'progressbar')
                .and('have.attr', 'aria-valuenow', '30')
                .and('have.attr', 'aria-valuemax', '120')
                .and('have.attr', 'aria-valuetext', '25%')
                .find('.progress-bar')
                .should('have.class', 'text-bg-warning')
                .and('have.text', '25%')
                .and('have.attr', 'style').and('match', /width:\s*25%/)
        })

        it('a bar without label still has a name', () => {
            cy.get('.progress[aria-valuenow="60"]').should('have.attr', 'aria-label', 'Progress')
        })
    })

    context('Tooltip on a button', () => {
        beforeEach(() => {
            cy.visit(pageUrl('new-components-test'))
        })

        it('shows on keyboard focus, describes the button, and closes with Escape without moving the focus', () => {
            cy.get('a[data-b5-tooltip-ready]').should('not.have.attr', 'title')
            // A link styled as a button stays a link
            cy.get('a[data-b5-tooltip-ready]').should('not.have.attr', 'role')
            cy.get('a[data-b5-tooltip]').focus()
            cy.get('.tooltip.show').should('be.visible').and('contain.text', 'Opens the Jahia website')
            cy.get('a[data-b5-tooltip]').should('have.attr', 'aria-describedby')
            cy.press('Escape')
            cy.get('.tooltip.show').should('not.exist')
            cy.get('a[data-b5-tooltip]').should('have.focus')
        })

        it('shows on hover and stays while the pointer is on the tooltip itself', () => {
            cy.get('a[data-b5-tooltip-ready]').trigger('mouseenter')
            cy.get('.tooltip.show').should('be.visible')
            cy.get('a[data-b5-tooltip]').trigger('mouseleave')
            cy.get('.tooltip.show').trigger('mouseenter')
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(400)
            cy.get('.tooltip.show').should('be.visible')
            cy.get('.tooltip.show').trigger('mouseleave')
            cy.get('.tooltip.show').should('not.exist')
        })
    })

    context('Colour mode', () => {
        beforeEach(() => {
            cy.clearAllLocalStorage()
            cy.visit(pageUrl('new-components-test'))
        })

        it('the page starts in the default mode of the site (light)', () => {
            cy.get('html').should('have.attr', 'data-bs-theme', 'light')
            cy.get('.color-mode-nav [data-bs-toggle="dropdown"]').should('contain.text', 'Colour mode: Light')
        })

        it('choosing "Dark" switches the page, the pressed state and the name of the toggle, and gives the focus back', () => {
            cy.get('.color-mode-nav [data-bs-toggle="dropdown"]').as('toggle').click()
            cy.get('[data-bs-theme-value="dark"]').click()
            cy.get('html').should('have.attr', 'data-bs-theme', 'dark')
            cy.get('[data-bs-theme-value="dark"]').should('have.attr', 'aria-pressed', 'true')
            cy.get('[data-bs-theme-value="light"]').should('have.attr', 'aria-pressed', 'false')
            cy.get('@toggle').should('contain.text', 'Colour mode: Dark')
            cy.focused().should('have.attr', 'data-bs-toggle', 'dropdown')
            // The page really is dark
            cy.get('body').should('have.css', 'background-color', 'rgb(33, 37, 41)')
        })

        it('the choice is kept on the next page load', () => {
            cy.get('.color-mode-nav [data-bs-toggle="dropdown"]').click()
            cy.get('[data-bs-theme-value="dark"]').click()
            cy.reload()
            cy.get('html').should('have.attr', 'data-bs-theme', 'dark')
            cy.get('[data-bs-theme-value="dark"]').should('have.attr', 'aria-pressed', 'true')
        })

        it('"Auto" follows the system setting', () => {
            cy.visit(pageUrl('new-components-test'), {
                onBeforeLoad(win) {
                    cy.stub(win, 'matchMedia').callsFake((query: string) => ({
                        matches: query.includes('dark'), media: query, addEventListener: () => undefined, removeEventListener: () => undefined
                    }))
                    win.localStorage.setItem('bootstrap5-color-mode', 'auto')
                }
            })
            cy.get('html').should('have.attr', 'data-bs-theme', 'dark')
            cy.get('[data-bs-theme-value="auto"]').should('have.attr', 'aria-pressed', 'true')
        })
    })

    context('Accessibility of the new components', () => {
        it('no WCAG 2.2 A/AA violation in light mode, in dark mode, and with the switcher open', () => {
            cy.clearAllLocalStorage()
            cy.visit(pageUrl('new-components-test'))
            cy.get('.progress').should('exist')
            checkA11y('new components, light')
            cy.get('.color-mode-nav [data-bs-toggle="dropdown"]').click()
            checkA11y('colour mode switcher open', {include: '.color-mode-nav'})
            cy.get('[data-bs-theme-value="dark"]').click()
            cy.get('html').should('have.attr', 'data-bs-theme', 'dark')
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(400)
            checkA11y('new components, dark')
        })

        it('edit mode: the group and the bars are editable, a button can be added to the group', () => {
            cy.login()
            cy.visit(editFrameUrl(page))
            cy.get(`[jahiatype="module"][path="${content}/group"]`).should('exist')
            cy.get(`[jahiatype="module"][path="${content}/group/link"]`).should('exist')
            cy.get(`[jahiatype="module"][path="${content}/progress"]`).should('exist')
            cy.get(`[jahiatype="module"][path="${content}/group"] [jahiatype="module"][type="placeholder"][nodetypes="bootstrap5nt:button"]`).should('exist')
        })
    })
})

describe('Bootstrap5 — Site colour mode and right-to-left stylesheet', () => {
    const live = (path: string, lang: string) => `/cms/render/live/${lang}${path}.html`
    const home = `/sites/${rtlSite}/home`

    before(() => {
        cy.login()
        deleteSite(rtlSite)
        createSite(rtlSite, {templateSet: 'bootstrap5-templates-starter', serverName: 'localhost', locale: 'en', languages: 'en,ar'})
        // Site setting: dark by default
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/addMixins.graphql',
            variables: {pathOrId: `/sites/${rtlSite}`, mixins: ['bootstrap5mix:siteColorMode']}
        })
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/mutateNode.graphql',
            variables: {pathOrId: `/sites/${rtlSite}`, properties: [{name: 'colorMode', value: 'dark'}]}
        })
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/mutateNode.graphql',
            variables: {pathOrId: home, properties: [{name: 'jcr:title', value: 'الرئيسية', language: 'ar'}]}
        })
        publishNode(`/sites/${rtlSite}`, ['en', 'ar'])
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(3000)
    })

    after(() => {
        cy.login()
        deleteSite(rtlSite)
    })

    it('a site set to dark renders dark without any script-side choice', () => {
        cy.clearAllLocalStorage()
        cy.request(live(home, 'en')).its('body').should('include', 'data-bs-theme="dark"')
        cy.visit(live(home, 'en'))
        cy.get('html').should('have.attr', 'data-bs-theme', 'dark').and('have.attr', 'data-b5-color-mode-default', 'dark')
    })

    // Which stylesheet is loaded is read from its effect (in live Jahia may serve the stylesheets
    // under generated names): Bootstrap's .float-start floats left, and right in its RTL build
    const floatStart = () => cy.document().then(doc => {
        const probe = doc.createElement('div')
        probe.className = 'float-start'
        doc.body.appendChild(probe)
        const float = doc.defaultView?.getComputedStyle(probe).float
        probe.remove()
        return float
    })

    it('a left-to-right page uses the standard stylesheet', () => {
        cy.visit(live(home, 'en'))
        cy.get('html').should('not.have.attr', 'dir')
        floatStart().should('eq', 'left')
    })

    it('a right-to-left page declares its direction and uses the right-to-left stylesheet', () => {
        cy.visit(live(home, 'ar'))
        cy.get('html').should('have.attr', 'dir', 'rtl').and('have.attr', 'lang', 'ar')
        cy.get('body').should('have.css', 'direction', 'rtl')
        floatStart().should('eq', 'right')
    })
})

describe('Bootstrap5 — Bootstrap styles in the rich text editors', () => {
    const text = `/sites/${ck5Site}/home/pagecontent/rich`

    const openContentEditor = (site: string, nodePath: string) => {
        getNodeByPath(nodePath).its('data.jcr.nodeByPath.uuid').then((uuid: string) => {
            cy.visit(`/jahia/jcontent/${site}/en/pages/home#(contentEditor:!((formKey:modal_0,isFullscreen:!t,lang:en,mode:edit,site:${site},uilang:en,uuid:'${uuid}')))`)
        })
    }

    /**
     * Without a valid Jahia licence, richtext-ckeditor5 falls back to the GPL key of CKEditor 5 while
     * its configurations still load the AI assistant, a premium plugin: the editor then locks itself
     * in read-only mode, for any rich text field. The editing tests need a licensed Jahia.
     */
    const skipWithoutLicence = (context: Mocha.Context) => {
        cy.window().then(win => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!(win as any).contextJsParameters?.valid) {
                cy.log('Skipped: CKEditor 5 is read-only on a Jahia without a valid licence')
                context.skip()
            }
        })
    }

    before(() => {
        cy.login()
        deleteSite(ck5Site)
        createSite(ck5Site, {templateSet: 'bootstrap5-templates-starter', serverName: 'localhost', locale: 'en'})
        cy.runProvisioningScript({
            script: {
                fileContent: `- editConfiguration: "org.jahia.modules.richtextCKEditor5"\n  properties:\n    "includeSites[0]": "${ck5Site}"\n`,
                type: 'application/yaml'
            }
        })
        addNode(`/sites/${ck5Site}/home`, 'pagecontent', 'jnt:contentList')
        addNode(`/sites/${ck5Site}/home/pagecontent`, 'rich', 'bootstrap5nt:text', [{name: 'text', value: '<p>Text</p>', language: 'en'}])
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(3000)
    })

    after(() => {
        cy.login()
        deleteSite(ck5Site)
    })

    it('CKEditor 5: the style list offers the Bootstrap styles (lead, badges, alerts, tables)', function () {
        cy.login()
        openContentEditor(ck5Site, text)
        cy.get('.ck-editor__editable', {timeout: 60000}).should('be.visible')
        skipWithoutLicence(this)
        cy.get('.ck-style-dropdown .ck-dropdown__button', {timeout: 20000}).click()
        cy.get('.ck-style-panel').should('be.visible').within(() => {
            cy.contains('.ck-style-grid__button', 'Lead').should('exist')
            cy.contains('.ck-style-grid__button', 'Primary Badge').should('exist')
            cy.contains('.ck-style-grid__button', 'Warning Alert').should('exist')
            cy.contains('.ck-style-grid__button', 'Striped Table').should('exist')
        })
    })

    it('CKEditor 5: a table gets the "table" class Bootstrap needs, and keeps its other classes', function () {
        cy.login()
        openContentEditor(ck5Site, text)
        cy.get('.ck-editor__editable', {timeout: 60000}).should('be.visible')
        skipWithoutLicence(this)
        cy.get('.ck-editor__editable').then($editable => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const editor = ($editable[0] as any).ckeditorInstance
            editor.setData('<table><tbody><tr><td>Plain</td></tr></tbody></table><table class="table-striped"><tbody><tr><td>Striped</td></tr></tbody></table>')
            const html = editor.getData()
            const tables = new DOMParser().parseFromString(html, 'text/html').querySelectorAll('table')
            expect(tables).to.have.length(2)
            expect(tables[0].classList.contains('table'), 'plain table').to.eq(true)
            expect(tables[1].classList.contains('table'), 'striped table').to.eq(true)
            expect(tables[1].classList.contains('table-striped'), 'striped table keeps its class').to.eq(true)
        })
    })

    it('CKEditor 4: the toolbar offers tables, and the style list the Bootstrap table styles', () => {
        cy.login()
        createTestPage('ck4-table-test')
        addNode(`/sites/${siteKey}/home/ck4-table-test/pagecontent`, 'rich', 'bootstrap5nt:text', [{name: 'text', value: '<p>Text</p>', language: 'en'}])
        getNodeByPath(`/sites/${siteKey}/home/ck4-table-test/pagecontent/rich`).its('data.jcr.nodeByPath.uuid').then((uuid: string) => {
            cy.visit(`/jahia/jcontent/${siteKey}/en/pages/home/ck4-table-test#(contentEditor:!((formKey:modal_0,isFullscreen:!t,lang:en,mode:edit,site:${siteKey},uilang:en,uuid:'${uuid}')))`)
        })
        cy.get('.cke_toolbox', {timeout: 60000}).should('be.visible')
        cy.get('.cke_button__table').should('exist')
        // Let the editor finish loading the field's own content before replacing it
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1500)
        cy.window().then(win => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const editor = Object.values((win as any).CKEDITOR.instances)[0] as any
            const names = (editor.config.stylesSet as {name: string}[]).map(style => style.name)
            expect(names).to.include.members(['Table', 'Striped Table', 'Primary Badge', 'Lead'])
            // A table gets the "table" class when saved, and keeps its other classes.
            // CKEditor 4 loads data asynchronously: read it back once it is loaded.
            return new Cypress.Promise<string>(resolve => {
                editor.setData('<table><tbody><tr><td>Plain</td></tr></tbody></table><table class="table-striped"><tbody><tr><td>Striped</td></tr></tbody></table>', {
                    callback: () => resolve(editor.getData())
                })
            })
        }).then((html: string) => {
            const tables = new DOMParser().parseFromString(html, 'text/html').querySelectorAll('table')
            expect(tables).to.have.length(2)
            expect(tables[0].className).to.eq('table')
            expect(tables[1].classList.contains('table')).to.eq(true)
            expect(tables[1].classList.contains('table-striped')).to.eq(true)
        })
        deleteTestPage('ck4-table-test')
    })
})
