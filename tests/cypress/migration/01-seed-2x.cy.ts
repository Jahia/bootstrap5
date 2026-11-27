import {createSite, deleteSite, getNodeByPath, publishAndWaitJobEnding} from '@jahia/cypress'
import {addNode, addAreaWithTexts} from '../support/bootstrap5'
import {migrationSite, migrationHome, migrationPages, baselineFile, takeSnapshot, PageSnapshot} from '../support/migration'

const text = (marker: string) => [{name: 'text', value: `<p class="${marker}">${marker}</p>`, language: 'en'}]
const addText = (parent: string, name: string, marker: string) => addNode(parent, name, 'bootstrap5nt:text', text(marker))

const addPage = (parent: string, name: string, title: string) => {
    addNode(parent, name, 'jnt:page', [
        {name: 'jcr:title', value: title, language: 'en'},
        {name: 'j:templateName', value: 'starter'}
    ], [], [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}])
}

// Step 1 of the migration test, run while bootstrap5 2.x is installed: builds a site the way a 2.x
// site is built (content stored where 2.x stores it), and records how 2.x renders it.
describe('Migration 2.x → 3.x — seed the site with 2.x', () => {
    let imageUuid = ''
    let subPageUuid = ''

    before(() => {
        cy.login()
        deleteSite(migrationSite)
        createSite(migrationSite, {templateSet: 'bootstrap5-templates-starter', serverName: 'localhost', locale: 'en'})

        cy.fixture('images/placeholder-red.png', 'binary').then((image: string) => {
            const blob = Cypress.Blob.binaryStringToBlob(image, 'image/png')
            const file = new File([blob], 'mig-image.png', {type: blob.type})
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/uploadFile.graphql',
                variables: {parentPathOrId: `/sites/${migrationSite}/files`, name: 'mig-image.png', mimeType: 'image/png', file}
            })
        })
        getNodeByPath(`/sites/${migrationSite}/files/mig-image.png`).its('data.jcr.nodeByPath.uuid').then((uuid: string) => {
            imageUuid = uuid
        })

        // ── Pages ──
        addPage(migrationHome, 'mig-components', 'Components')
        addPage(migrationHome, 'mig-layout', 'Layout')
        addPage(migrationHome, 'mig-section', 'Section')
        addPage(`${migrationHome}/mig-section`, 'mig-sub', 'Sub page')
        addPage(`${migrationHome}/mig-section/mig-sub`, 'mig-leaf', 'Leaf')
        getNodeByPath(`${migrationHome}/mig-section/mig-sub`).its('data.jcr.nodeByPath.uuid').then((uuid: string) => {
            subPageUuid = uuid
        })

        // ── Shared header and footer of the home page (absolute areas of the template) ──
        addNode(migrationHome, 'header', 'jnt:contentList')
        addNode(`${migrationHome}/header`, 'navbar', 'bootstrap5nt:navbar', [
            {name: 'root', value: 'homePage'},
            {name: 'maxlevel', value: '3'},
            {name: 'brandText', value: 'Migration site', language: 'en'}
        ], ['bootstrap5mix:navbarGlobalSettings', 'bootstrap5mix:brand'])
        addNode(migrationHome, 'footer', 'jnt:contentList')
        addText(`${migrationHome}/footer`, 'footer-text', 'mig-footer')

        // ── Content shared through a grid with absolute areas (level 0: stored under the home page) ──
        addAreaWithTexts(migrationHome, 'main', ['mig-absolute-home'])

        cy.then(() => {
            const components = `${migrationHome}/mig-components/pagecontent`

            addText(components, 'text', 'mig-text')

            // Text wearing the alert skin
            addNode(components, 'alert-text', 'bootstrap5nt:text', [
                ...text('mig-alert'),
                {name: 'j:skin', value: 'skins.alert'},
                {name: 'backgroundColor', value: 'warning'},
                {name: 'addDismissButton', value: 'true', type: 'BOOLEAN'}
            ], ['jmix:skinnable', 'bootstrap5mix:alert'])

            // Accordion: a panel with its own rich text, a panel with content dropped in it
            addNode(components, 'accordions', 'bootstrap5nt:accordions', [], [], [
                {name: 'panel-1', primaryNodeType: 'bootstrap5nt:accordion', properties: [
                    {name: 'jcr:title', value: 'Panel 1', language: 'en'},
                    {name: 'text', value: '<p class="mig-accordion-text">mig-accordion-text</p>', language: 'en'},
                    {name: 'show', value: 'true', type: 'BOOLEAN'}
                ]},
                {name: 'panel-2', primaryNodeType: 'bootstrap5nt:accordion', properties: [
                    {name: 'jcr:title', value: 'Panel 2', language: 'en'}
                ]}
            ])
            addText(`${components}/accordions/panel-2`, 'dropped', 'mig-accordion-dropped')

            // Tabs
            addNode(components, 'tabs', 'bootstrap5nt:tabs', [
                {name: 'type', value: 'tab'},
                {name: 'fade', value: 'true', type: 'BOOLEAN'},
                {name: 'useListNameAsAnchor', value: 'true', type: 'BOOLEAN'}
            ], [], [
                {name: 'first', primaryNodeType: 'jnt:contentList', properties: [{name: 'jcr:title', value: 'First', language: 'en'}]},
                {name: 'second', primaryNodeType: 'jnt:contentList', properties: [{name: 'jcr:title', value: 'Second', language: 'en'}]}
            ])
            addText(`${components}/tabs/first`, 'text', 'mig-tab-first')
            addText(`${components}/tabs/second`, 'text', 'mig-tab-second')

            // Carousel
            addNode(components, 'carousel', 'bootstrap5nt:carousel', [
                {name: 'useIndicators', value: 'true', type: 'BOOLEAN'},
                {name: 'useLeftAndRightControls', value: 'true', type: 'BOOLEAN'},
                {name: 'ride', value: 'false', type: 'BOOLEAN'}
            ], ['bootstrap5mix:carouselAdvancedSettings'], [
                {name: 'slide-1', primaryNodeType: 'bootstrap5nt:carouselItem', properties: [
                    {name: 'jcr:title', value: 'Slide one', language: 'en'},
                    {name: 'caption', value: 'Caption one', language: 'en'},
                    {name: 'image', value: imageUuid, type: 'WEAKREFERENCE'}
                ]},
                {name: 'slide-2', primaryNodeType: 'bootstrap5nt:carouselItem', properties: [
                    {name: 'jcr:title', value: 'Slide two', language: 'en'},
                    {name: 'image', value: imageUuid, type: 'WEAKREFERENCE'}
                ]}
            ])

            // Card: header, image, dropped content, free footer (an area stored under the card)
            addNode(components, 'card', 'bootstrap5nt:card', [
                {name: 'jcr:title', value: 'Card title', language: 'en'},
                {name: 'headerSize', value: 'h3'},
                {name: 'image', value: imageUuid, type: 'WEAKREFERENCE'},
                {name: 'freeFooter', value: 'true', type: 'BOOLEAN'}
            ], ['bootstrap5mix:cardAdvancedSettings'])
            addText(`${components}/card`, 'body-text', 'mig-card-body')
            addAreaWithTexts(`${components}/card`, 'cardFooter', ['mig-card-footer'])

            // Card with a plain text footer
            addNode(components, 'card-plain', 'bootstrap5nt:card', [
                {name: 'jcr:title', value: 'Plain card', language: 'en'},
                {name: 'footer', value: 'Plain footer', language: 'en'}
            ])

            // Figure
            addNode(components, 'figure', 'bootstrap5nt:figure', [
                {name: 'jcr:title', value: 'Figure caption', language: 'en'},
                {name: 'image', value: imageUuid, type: 'WEAKREFERENCE'}
            ])

            // Buttons
            addNode(components, 'button-internal', 'bootstrap5nt:button', [
                {name: 'jcr:title', value: 'Internal', language: 'en'},
                {name: 'buttonType', value: 'internalLink'},
                {name: 'internalLink', value: subPageUuid, type: 'WEAKREFERENCE'}
            ], ['bootstrap5mix:internalLink'])
            addNode(components, 'button-external', 'bootstrap5nt:button', [
                {name: 'jcr:title', value: 'External', language: 'en'},
                {name: 'buttonType', value: 'externalLink'},
                {name: 'externalLink', value: 'https://www.jahia.com'}
            ], ['bootstrap5mix:externalLink'])
            addNode(components, 'button-modal', 'bootstrap5nt:button', [
                {name: 'jcr:title', value: 'Modal', language: 'en'},
                {name: 'buttonType', value: 'modal'},
                {name: 'modalTitle', value: 'Modal title', language: 'en'}
            ], ['bootstrap5mix:modal'])
            addText(`${components}/button-modal`, 'content', 'mig-modal-content')
            addNode(components, 'button-collapse', 'bootstrap5nt:button', [
                {name: 'jcr:title', value: 'Collapse', language: 'en'},
                {name: 'buttonType', value: 'collapse'},
                {name: 'show', value: 'true', type: 'BOOLEAN'}
            ], ['bootstrap5mix:collapse'])
            addText(`${components}/button-collapse`, 'content', 'mig-collapse-content')
            addNode(components, 'button-offcanvas', 'bootstrap5nt:button', [
                {name: 'jcr:title', value: 'Offcanvas', language: 'en'},
                {name: 'buttonType', value: 'Offcanvas'},
                {name: 'OffcanvasTitle', value: 'Offcanvas title', language: 'en'}
            ], ['bootstrap5mix:Offcanvas'])
            addText(`${components}/button-offcanvas`, 'content', 'mig-offcanvas-content')
            addNode(components, 'button-popover', 'bootstrap5nt:button', [
                {name: 'jcr:title', value: 'Popover', language: 'en'},
                {name: 'buttonType', value: 'popover'},
                {name: 'popoverTitle', value: 'Popover title', language: 'en'},
                {name: 'popoverContent', value: 'Popover content', language: 'en'}
            ], ['bootstrap5mix:popover'])

            // ── Layout page: every way a 2.x grid stores its columns ──
            const layout = `${migrationHome}/mig-layout/pagecontent`
            const grid = (name: string, pattern: string, areas: string[]) => {
                addNode(layout, name, 'bootstrap5nt:grid', [{name: 'grid', value: pattern}],
                    ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createRow', 'bootstrap5mix:createContainer'])
                areas.forEach(area => addAreaWithTexts(`${layout}/${name}`, area, [`mig-${name}-${area}`]))
            }

            grid('g-12', '12', ['main'])
            grid('g-6-6', '6_6', ['main', 'side'])
            grid('g-4-8', '4_8', ['side', 'main'])
            grid('g-8-4', '8_4', ['main', 'side'])
            grid('g-2-10', '2_10', ['main', 'side'])
            grid('g-10-2', '10_2', ['side', 'main'])
            grid('g-3-9', '3_9', ['side', 'main'])
            grid('g-9-3', '9_3', ['main', 'side'])
            grid('g-4-4-4', '4_4_4', ['main', 'side', 'extra'])
            grid('g-3-6-3', '3_6_3', ['side', 'main', 'extra'])
            grid('g-3-3-3-3', '3_3_3_3', ['main', 'side', 'extra', 'extra2'])

            addNode(layout, 'g-custom', 'bootstrap5nt:grid', [{name: 'gridClasses', value: 'col-8,col-4'}],
                ['bootstrap5mix:customGrid', 'bootstrap5mix:createRow'])
            addAreaWithTexts(`${layout}/g-custom`, 'col0', ['mig-g-custom-col0'])
            addAreaWithTexts(`${layout}/g-custom`, 'col1', ['mig-g-custom-col1'])

            addNode(layout, 'g-section', 'bootstrap5nt:grid', [
                {name: 'sectionElement', value: 'section'},
                {name: 'sectionId', value: 'mig-section-id'},
                {name: 'sectionCssClass', value: 'py-3'},
                {name: 'sectionStyle', value: 'background-color: rgb(1, 2, 3)'}
            ], ['bootstrap5mix:createSection'])
            addAreaWithTexts(`${layout}/g-section`, 'main', ['mig-g-section-main'])

            // A grid nested in a column of another grid
            addNode(`${layout}/g-6-6/side`, 'nested', 'bootstrap5nt:grid', [{name: 'grid', value: '6_6'}],
                ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createRow'])
            addAreaWithTexts(`${layout}/g-6-6/side/nested`, 'main', ['mig-nested-main'])
            addAreaWithTexts(`${layout}/g-6-6/side/nested`, 'side', ['mig-nested-side'])

            // Paged list: the pager before its list
            addNode(layout, 'pager', 'bootstrap5nt:pagination', [
                {name: 'displayPager', value: 'true'},
                {name: 'pageSize', value: '2'},
                {name: 'nbOfPages', value: '10'},
                {name: 'nbOfPagesInEdit', value: '100'}
            ], ['bootstrap5mix:advancedPagination'])
            addNode(layout, 'paged-list', 'jnt:contentList')
            for (let i = 1; i <= 5; i++) {
                addText(`${layout}/paged-list`, `item-${i}`, `mig-paged-${i}`)
            }

            // ── Deep page: breadcrumb and a grid showing the content shared by the home page ──
            const deep = `${migrationHome}/mig-section/mig-sub/pagecontent`
            addNode(deep, 'breadcrumb', 'bootstrap5nt:breadcrumb')
            addNode(deep, 'g-absolute', 'bootstrap5nt:grid', [{name: 'grid', value: '12'}, {name: 'level', value: '0'}],
                ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createRow', 'bootstrap5mix:createAbsoluteAreas'])
            addText(deep, 'text', 'mig-deep-text')
        })

        getNodeByPath(`${migrationHome}/mig-layout/pagecontent/paged-list`).its('data.jcr.nodeByPath.uuid').then((listUuid: string) => {
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/mutateNode.graphql',
                variables: {
                    pathOrId: `${migrationHome}/mig-layout/pagecontent/pager`,
                    properties: [{name: 'j:bindedComponent', value: listUuid, type: 'WEAKREFERENCE'}]
                }
            })
        })

        // The baseline must picture the whole site: wait for the publication job to end, then check
        // that the deepest page is live before any page (and its cached navbar) is rendered
        publishAndWaitJobEnding(`/sites/${migrationSite}`, ['en'])
        cy.waitUntil(() => cy.request({
            url: `/cms/render/live/en${migrationHome}/mig-section/mig-sub/mig-leaf.html`,
            failOnStatusCode: false
        }).then(response => response.status === 200), {timeout: 60000, interval: 2000})
    })

    it('2.x renders every page of the site', () => {
        Object.values(migrationPages).forEach(url => {
            cy.request(url).its('status').should('eq', 200)
        })
    })

    it('records how 2.x renders the site', () => {
        const baseline: Record<string, PageSnapshot> = {}
        Object.entries(migrationPages).forEach(([name, url]) => {
            cy.visit(url)
            cy.document().then(doc => {
                baseline[name] = takeSnapshot(doc)
            })
        })
        cy.then(() => {
            // The content is there: a baseline of empty pages would prove nothing
            expect(Object.keys(baseline.components.markers), 'markers on the components page').to.include.members([
                'mig-text', 'mig-alert', 'mig-accordion-text', 'mig-accordion-dropped', 'mig-tab-first', 'mig-tab-second',
                'mig-card-body', 'mig-card-footer', 'mig-modal-content', 'mig-collapse-content', 'mig-offcanvas-content', 'mig-footer'
            ])
            expect(Object.keys(baseline.layout.markers), 'markers on the layout page').to.include.members([
                'mig-g-2-10-main', 'mig-g-2-10-side', 'mig-g-10-2-main', 'mig-g-10-2-side', 'mig-g-custom-col0',
                'mig-g-section-main', 'mig-nested-main', 'mig-paged-1', 'mig-paged-2'
            ])
            expect(Object.keys(baseline.deep.markers), 'markers on the deep page').to.include.members([
                'mig-deep-text', 'mig-absolute-home', 'mig-footer'
            ])
            cy.writeFile(baselineFile, baseline)
        })
    })
})
