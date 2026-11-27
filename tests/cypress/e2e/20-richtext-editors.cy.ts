import {createSite, deleteSite, getNodeByPath} from '@jahia/cypress'
import {createTestPage, deleteTestPage, addNode} from '../support/bootstrap5'

const ck4Site = 'bootstrap5test'
const ck5Site = 'bootstrap5ck5'
const ck4Text = `/sites/${ck4Site}/home/richtext-test/pagecontent/rich`
const ck5Text = `/sites/${ck5Site}/home/pagecontent/rich`

/** Opens the content editor of jContent on the node, full screen. */
const openContentEditor = (site: string, pagePath: string, nodePath: string) => {
    getNodeByPath(nodePath).its('data.jcr.nodeByPath.uuid').then((uuid: string) => {
        cy.visit(`/jahia/jcontent/${site}/en/pages/${pagePath}#(contentEditor:!((formKey:modal_0,isFullscreen:!t,lang:en,mode:edit,site:${site},uilang:en,uuid:'${uuid}')))`)
    })
}

const savedText = (nodePath: string) =>
    getNodeByPath(nodePath, ['text'], 'en').its('data.jcr.nodeByPath.properties.0.value')

// The rich text field of bootstrap5nt:text in the content editor, with the two editors Jahia offers:
// CKEditor 4 (default) and CKEditor 5 (richtext-ckeditor5 module, enabled per site).
describe('Bootstrap5 — Rich text editors', () => {
    before(() => {
        cy.login()

        // CKEditor 4: the main test site
        createTestPage('richtext-test')
        addNode(`/sites/${ck4Site}/home/richtext-test/pagecontent`, 'rich', 'bootstrap5nt:text',
            [{name: 'text', value: '<p>Initial text</p>', language: 'en'}])

        // CKEditor 5: a site of its own, listed in the configuration of the CKEditor 5 module
        deleteSite(ck5Site)
        createSite(ck5Site, {templateSet: 'bootstrap5-templates-starter', serverName: 'localhost', locale: 'en'})
        cy.runProvisioningScript({
            script: {
                fileContent: `- editConfiguration: "org.jahia.modules.richtextCKEditor5"\n  properties:\n    "includeSites[0]": "${ck5Site}"\n`,
                type: 'application/yaml'
            }
        })
        addNode(`/sites/${ck5Site}/home`, 'pagecontent', 'jnt:contentList')
        addNode(`/sites/${ck5Site}/home/pagecontent`, 'rich', 'bootstrap5nt:text',
            [{name: 'text', value: '<p>Initial text</p>', language: 'en'}])
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(3000)
    })

    after(() => {
        cy.login()
        deleteTestPage('richtext-test')
        deleteSite(ck5Site)
    })

    context('CKEditor 4', () => {
        beforeEach(() => {
            cy.login()
        })

        it('the toolbar configuration of the module is served', () => {
            cy.request('/modules/bootstrap5-components/javascript/ckconfig.js').then(response => {
                expect(response.status).to.eq(200)
                expect(response.body).to.contain('CKEDITOR.editorConfig')
            })
            cy.request('/modules/bootstrap5-components/javascript/cktemplates.js').its('status').should('eq', 200)
        })

        it('the editor loads with the toolbar of the module (templates, wash HTML)', () => {
            openContentEditor(ck4Site, 'home/richtext-test', ck4Text)
            cy.get('.cke_toolbox', {timeout: 60000}).should('be.visible')
            cy.get('.cke_button[title="Templates"]').should('exist')
            cy.get('.cke_button[title="Wash HTML"]').should('exist')
            cy.get('.ck-editor__editable').should('not.exist')
        })

        it('a text edited in the editor is saved', () => {
            openContentEditor(ck4Site, 'home/richtext-test', ck4Text)
            cy.get('.cke_toolbox', {timeout: 60000}).should('be.visible')
            cy.window().then(win => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const editors = Object.values((win as any).CKEDITOR.instances) as any[]
                expect(editors).to.have.length(1)
                editors[0].setData('<p>Edited with CKEditor 4</p>')
                editors[0].fire('change')
            })
            cy.get('button[data-sel-role="submitSave"]').should('not.be.disabled').click()
            cy.get('button[data-sel-role="submitSave"]', {timeout: 30000}).should('be.disabled')
            savedText(ck4Text).should('contain', 'Edited with CKEditor 4')
        })
    })

    context('CKEditor 5', () => {
        beforeEach(() => {
            cy.login()
        })

        it('the editor of the field is CKEditor 5, with its toolbar', () => {
            openContentEditor(ck5Site, 'home', ck5Text)
            cy.get('.ck-editor__editable', {timeout: 60000}).should('be.visible')
            cy.get('.ck-toolbar .ck-button').should('have.length.greaterThan', 5)
            cy.get('.ck-editor__editable').should('contain.text', 'Initial text')
            cy.get('.cke_toolbox').should('not.exist')
        })

        it('a text set in the editor is saved', function () {
            openContentEditor(ck5Site, 'home', ck5Text)
            cy.get('.ck-editor__editable', {timeout: 60000}).should('be.visible')
            // CKEditor 5 checks its license after loading; without a license covering the features
            // the module enables (AI assistant), it switches the editor to read-only.
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(4000)
            cy.get('.ck-editor__editable').then($editable => {
                if ($editable.hasClass('ck-read-only')) {
                    cy.log('CKEditor 5 is read-only on this instance (CKEditor license): saving is not tested')
                    this.skip()
                }

                // CKEditor 5 exposes its instance on the editable element
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const editor = ($editable[0] as any).ckeditorInstance
                expect(editor, 'CKEditor 5 instance').to.exist
                editor.setData('<p>Edited with CKEditor 5</p>')
            })
            cy.get('.ck-editor__editable').should('have.text', 'Edited with CKEditor 5')
            cy.get('button[data-sel-role="submitSave"]').should('not.be.disabled').click()
            cy.get('button[data-sel-role="submitSave"]', {timeout: 30000}).should('be.disabled')
            savedText(ck5Text).should('contain', 'Edited with CKEditor 5')
        })
    })
})
