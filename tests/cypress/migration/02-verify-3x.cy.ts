import gql from 'graphql-tag'
import {migrationPages, migrationHome, baselineFile, takeSnapshot, PageSnapshot} from '../support/migration'

// Step 2 of the migration test, run after bootstrap5 3.x replaced 2.x on the same Jahia: the site
// built with 2.x must still display, with every piece of content where 2.x showed it.
/**
 * Differences with 2.x that are deliberate, each with its reason. Anything else fails the test.
 */
const acceptedContainerChanges: Record<string, {with2x: string; with3x: string; reason: string}> = {
    'mig-collapse-content': {
        with2x: 'div|collapse',
        with3x: 'div|collapse show',
        reason: '2.x put the "show" class of an initially open collapse on the button instead of the panel, so the panel stayed closed'
    }
}

/**
 * Deliberate differences in the number of a structure, per page: the exact counts are checked, so
 * that any other change of the same structures still fails.
 */
const acceptedCountChanges: Record<string, Record<string, {with2x: number; with3x: number; reason: string}>> = {
    components: {
        'button.btn': {
            with2x: 8,
            with3x: 7,
            reason: 'the popover button is a link with role="button": Bootstrap requires a focusable link for a popover closed on the next click'
        },
        'a.btn': {with2x: 2, with3x: 3, reason: 'the popover button, counted here now (see button.btn)'}
    }
}

describe('Migration 2.x → 3.x — the 2.x site rendered by 3.x', () => {
    let baseline: Record<string, PageSnapshot>

    before(() => {
        cy.readFile(baselineFile).then((content: Record<string, PageSnapshot>) => {
            baseline = content
        })
    })

    Object.entries(migrationPages).forEach(([name, url]) => {
        context(`page "${name}"`, () => {
            let current: PageSnapshot

            before(() => {
                cy.request(url).its('status').should('eq', 200)
                cy.visit(url)
                cy.document().then(doc => {
                    current = takeSnapshot(doc)
                })
            })

            it('shows every piece of content 2.x showed', () => {
                const missing = Object.keys(baseline[name].markers).filter(marker => !(marker in current.markers))
                expect(missing, 'content shown by 2.x and missing with 3.x').to.deep.equal([])
            })

            it('shows no content 2.x did not show', () => {
                const added = Object.keys(current.markers).filter(marker => !(marker in baseline[name].markers))
                expect(added, 'content shown by 3.x only').to.deep.equal([])
            })

            it('keeps every piece of content in the same container (column, tab, panel, card part…)', () => {
                const moved: Record<string, {with2x: string; with3x: string}> = {}
                Object.entries(baseline[name].markers).forEach(([marker, expected]) => {
                    const actual = current.markers[marker]
                    const accepted = acceptedContainerChanges[marker]
                    if (accepted && accepted.with2x === expected.container && actual && accepted.with3x === actual.container) {
                        cy.log(`Accepted difference for ${marker}: ${accepted.reason}`)
                        return
                    }

                    if (actual && actual.container !== expected.container) {
                        moved[marker] = {with2x: expected.container, with3x: actual.container}
                    }
                })
                expect(moved, 'content whose container changed').to.deep.equal({})
            })

            it('renders the same number of each structure', () => {
                const changed: Record<string, {with2x: number; with3x: number}> = {}
                Object.entries(baseline[name].counts).forEach(([selector, expected]) => {
                    const accepted = (acceptedCountChanges[name] ?? {})[selector]
                    if (accepted && accepted.with2x === expected && accepted.with3x === current.counts[selector]) {
                        cy.log(`Accepted difference for ${selector}: ${accepted.reason}`)
                        return
                    }

                    if (current.counts[selector] !== expected) {
                        changed[selector] = {with2x: expected, with3x: current.counts[selector]}
                    }
                })
                expect(changed, 'structures whose count changed').to.deep.equal({})
            })

            it('keeps the page title', () => {
                expect(current.title).to.eq(baseline[name].title)
            })
        })
    })

    // In the content editor, choosing a type (grid layout, button type, navbar root) adds the mixin
    // holding its settings, through choice list initializers registered under fixed keys. 2.x and
    // 3.x register the same keys from different bundles: removing 2.x must not take them away.
    context('content editor forms after the upgrade', () => {
        const mixinsOfChoices = (primaryNodeType: string, field: string) => cy.apollo({
            query: gql`query($type: String!, $path: String!) {
                forms { createForm(primaryNodeType: $type, uiLocale: "en", locale: "en", uuidOrPath: $path) {
                    sections { fieldSets { fields { name valueConstraints { value { string } properties { name value } } } } }
                } }
            }`,
            variables: {type: primaryNodeType, path: `${migrationHome}/mig-layout/pagecontent`}
        }).then((result: {data: {forms: {createForm: {sections: {fieldSets: {fields: {name: string; valueConstraints: {value: {string: string}; properties: {name: string; value: string}[]}[]}[]}[]}[]}}}}) => {
            const mixins: Record<string, string> = {}
            result.data.forms.createForm.sections.forEach(section => section.fieldSets.forEach(fieldSet => fieldSet.fields
                .filter(candidate => candidate.name === field)
                .forEach(found => found.valueConstraints.forEach(choice => {
                    const addMixin = choice.properties.find(property => property.name === 'addMixin')
                    if (addMixin) {
                        mixins[choice.value.string] = addMixin.value
                    }
                }))))
            return mixins
        })

        beforeEach(() => {
            cy.login()
        })

        it('grid: each layout type brings its settings', () => {
            mixinsOfChoices('bootstrap5nt:grid', 'typeOfGrid').should('deep.equal', {
                predefinedGrid: 'bootstrap5mix:predefinedGrid',
                customGrid: 'bootstrap5mix:customGrid'
            })
        })

        it('button: each button type brings its settings', () => {
            mixinsOfChoices('bootstrap5nt:button', 'buttonType').should('deep.equal', {
                internalLink: 'bootstrap5mix:internalLink',
                externalLink: 'bootstrap5mix:externalLink',
                modal: 'bootstrap5mix:modal',
                collapse: 'bootstrap5mix:collapse',
                popover: 'bootstrap5mix:popover',
                Offcanvas: 'bootstrap5mix:Offcanvas'
            })
        })

        it('navbar: the custom root brings its page picker', () => {
            mixinsOfChoices('bootstrap5nt:navbar', 'root').should('deep.equal', {
                customRootPage: 'bootstrap5mix:customRootPage'
            })
        })
    })

    context('behaviours', () => {
        it('the pager still pages the list', () => {
            cy.visit(migrationPages.layout)
            cy.get('[class*="mig-paged-"]').should('have.length', 2)
            cy.contains('ul.pagination a.page-link', '2').click()
            cy.get('.mig-paged-3').should('exist')
            cy.get('.mig-paged-1').should('not.exist')
        })

        it('the second tab opens and shows its content', () => {
            cy.visit(migrationPages.components)
            cy.get('#tab-btn-second').click()
            cy.get('.mig-tab-second').should('be.visible')
        })

        it('the modal opens with its content', () => {
            cy.visit(migrationPages.components)
            // The modal of the button component (the navbar has one too, for the login form)
            cy.get('[data-bs-toggle="modal"][data-bs-target^="#modal-"]').first().click()
            cy.get('.modal.show .mig-modal-content').should('be.visible')
        })

        it('the page can be opened in edit mode', () => {
            cy.login()
            cy.request(`/cms/editframe/default/en${migrationHome}/mig-layout.html`).its('status').should('eq', 200)
            cy.request(`/cms/editframe/default/en${migrationHome}/mig-components.html`).its('status').should('eq', 200)
        })
    })
})
