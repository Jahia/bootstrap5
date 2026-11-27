import {createTestPage, publishPage, deleteTestPage, pageUrl} from '../support/bootstrap5';

const siteKey = 'bootstrap5test';
const content = `/sites/${siteKey}/home/parity-test/pagecontent`;

const addNode = (parentPathOrId: string, name: string, primaryNodeType: string, properties: object[] = [], mixins: string[] = [], children: object[] = []) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/addNode.graphql',
        variables: {parentPathOrId, name, primaryNodeType, properties, mixins, children}
    });
};

// Behaviours of 2.x that had no end-to-end test: the alert skin, tab deep links, and what is
// rendered around tabs and accordions.
describe('Bootstrap5 — Alert skin, tabs and accordion (2.x parity)', () => {
    before(() => {
        cy.login();
        createTestPage('parity-test');

        // A text wearing the alert skin: the skin wraps the text it is applied to
        addNode(content, 'skinned-text', 'bootstrap5nt:text', [
            {name: 'text', value: '<p class="skinned-content">Content inside the alert</p>', language: 'en'},
            {name: 'j:skin', value: 'skins.alert'},
            {name: 'backgroundColor', value: 'warning'},
            {name: 'addDismissButton', value: 'true', type: 'BOOLEAN'}
        ], ['jmix:skinnable', 'bootstrap5mix:alert']);

        // Tabs
        addNode(content, 'tabs', 'bootstrap5nt:tabs', [
            {name: 'type', value: 'tab'},
            {name: 'fade', value: 'true', type: 'BOOLEAN'},
            {name: 'useListNameAsAnchor', value: 'true', type: 'BOOLEAN'}
        ], [], [
            {name: 'first', primaryNodeType: 'jnt:contentList', properties: [{name: 'jcr:title', value: 'First', language: 'en'}]},
            {name: 'second', primaryNodeType: 'jnt:contentList', properties: [{name: 'jcr:title', value: 'Second', language: 'en'}]}
        ]);
        addNode(`${content}/tabs/second`, 'text', 'bootstrap5nt:text', [
            {name: 'text', value: '<p class="second-tab-content">Second tab</p>', language: 'en'}
        ]);

        // Accordion
        addNode(content, 'accordions', 'bootstrap5nt:accordions', [], [], [
            {name: 'panel-1', primaryNodeType: 'bootstrap5nt:accordion', properties: [{name: 'jcr:title', value: 'Panel 1', language: 'en'}]}
        ]);

        publishPage('parity-test');
    });

    after(() => {
        cy.login();
        deleteTestPage('parity-test');
    });

    context('Alert skin', () => {
        beforeEach(() => {
            cy.visit(pageUrl('parity-test'));
        });

        it('wraps the content it is applied to in the alert', () => {
            cy.get('.alert.alert-warning .skinned-content').should('contain.text', 'Content inside the alert');
        });

        it('renders the dismiss button, and dismissing removes the alert with its content', () => {
            cy.get('.alert.alert-warning.alert-dismissible .btn-close').click();
            cy.get('.skinned-content').should('not.exist');
        });
    });

    context('Tabs deep links', () => {
        it('opens the tab named by the URL fragment', () => {
            cy.visit(`${pageUrl('parity-test')}#second`);
            cy.get('#tab-btn-second').should('have.class', 'active').and('have.attr', 'aria-selected', 'true');
            cy.get('#second').should('have.class', 'active');
            cy.get('.second-tab-content').should('be.visible');
        });

        it('without a fragment the first tab stays open', () => {
            cy.visit(pageUrl('parity-test'));
            cy.get('#tab-btn-first').should('have.class', 'active');
        });

        it('changing tab writes its anchor in the URL', () => {
            cy.visit(pageUrl('parity-test'));
            cy.get('#tab-btn-second').click();
            cy.location('hash').should('eq', '#second');
        });
    });

    context('No stray markup in live', () => {
        beforeEach(() => {
            cy.visit(pageUrl('parity-test'));
        });

        it('the tab panels are the only children of .tab-content', () => {
            cy.get('.tab-content').children().should('have.length', 2);
            cy.get('.tab-content').children().each($child => {
                expect($child).to.have.class('tab-pane');
            });
        });

        it('the accordion holds its panel', () => {
            cy.get('.accordion .accordion-item').should('have.length', 1);
        });
    });
});
