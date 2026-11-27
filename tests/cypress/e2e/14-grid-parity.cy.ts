import {createTestPage, publishPage, deleteTestPage, pageUrl} from '../support/bootstrap5';

const siteKey = 'bootstrap5test';
const content = `/sites/${siteKey}/home/grid-parity-test/pagecontent`;

const addNode = (parentPathOrId: string, name: string, primaryNodeType: string, properties: object[] = [], mixins: string[] = []) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/addNode.graphql',
        variables: {parentPathOrId, name, primaryNodeType, properties, mixins}
    });
};

/** A content list named `area` under `parent`, holding one text marked with `cssClass`. */
const addAreaWithText = (parent: string, area: string, cssClass: string) => {
    addNode(parent, area, 'jnt:contentList');
    addNode(`${parent}/${area}`, 'text', 'bootstrap5nt:text', [
        {name: 'text', value: `<p class="${cssClass}">${cssClass}</p>`, language: 'en'}
    ]);
};

const publish = (pathOrId: string) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/publishNode.graphql',
        variables: {pathOrId, languages: ['en'], publishSubNodes: true, includeSubTree: true}
    });
};

// Behaviours of the 2.x grid that existing sites rely on: where the column content is stored, and
// the areas shared from an ancestor page.
describe('Bootstrap5 — Grid (2.x parity)', () => {
    before(() => {
        cy.login();
        createTestPage('grid-parity-test');

        // 2_10 and 10_2: the 2.x JSP compared the spans as strings ("2" < "10" is false), so the
        // area names are main,side for 2_10 and side,main for 10_2. Sites hold content there.
        addNode(content, 'grid-2-10', 'bootstrap5nt:grid', [{name: 'grid', value: '2_10'}], ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createRow']);
        addAreaWithText(`${content}/grid-2-10`, 'main', 'g210-main');
        addAreaWithText(`${content}/grid-2-10`, 'side', 'g210-side');

        addNode(content, 'grid-10-2', 'bootstrap5nt:grid', [{name: 'grid', value: '10_2'}], ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createRow']);
        addAreaWithText(`${content}/grid-10-2`, 'main', 'g102-main');
        addAreaWithText(`${content}/grid-10-2`, 'side', 'g102-side');

        // 3_6_3: the centre column is "main"
        addNode(content, 'grid-3-6-3', 'bootstrap5nt:grid', [{name: 'grid', value: '3_6_3'}], ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createRow']);
        addAreaWithText(`${content}/grid-3-6-3`, 'side', 'g363-side');
        addAreaWithText(`${content}/grid-3-6-3`, 'main', 'g363-main');
        addAreaWithText(`${content}/grid-3-6-3`, 'extra', 'g363-extra');

        // Section with an inline style, a role and a label
        addNode(content, 'grid-styled', 'bootstrap5nt:grid', [
            {name: 'sectionElement', value: 'section'},
            {name: 'sectionId', value: 'styled-section'},
            {name: 'sectionStyle', value: 'background-color: rgb(1, 2, 3); padding-top: 12px'},
            {name: 'sectionRole', value: 'region'},
            {name: 'sectionAria', value: 'Styled section'}
        ], ['bootstrap5mix:createSection']);
        addAreaWithText(`${content}/grid-styled`, 'main', 'styled-content');

        // Absolute areas: the content is stored under the ancestor page of the chosen level
        // (level 0 = the home page) and shown on every page below it.
        addAreaWithText(`/sites/${siteKey}/home`, 'main', 'abs-home-content');
        addNode(content, 'grid-absolute', 'bootstrap5nt:grid', [{name: 'grid', value: '12'}, {name: 'level', value: '0'}], ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createRow', 'bootstrap5mix:createAbsoluteAreas']);
        // A list of the same name under the grid itself must NOT be what is displayed
        addAreaWithText(`${content}/grid-absolute`, 'main', 'abs-local-content');

        publish(`/sites/${siteKey}/home/main`);
        publishPage('grid-parity-test');
    });

    after(() => {
        cy.login();
        deleteTestPage('grid-parity-test');
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/deleteNode.graphql',
            variables: {pathOrId: `/sites/${siteKey}/home/main`, workspace: 'EDIT'}
        });
    });

    beforeEach(() => {
        cy.visit(pageUrl('grid-parity-test'));
    });

    it('2_10: the narrow column holds "main", the wide one "side" (as stored by 2.x)', () => {
        cy.get('.col-md-2 .g210-main').should('exist');
        cy.get('.col-md-10 .g210-side').should('exist');
    });

    it('10_2: the wide column holds "side", the narrow one "main" (as stored by 2.x)', () => {
        cy.get('.col-md-10 .g102-side').should('exist');
        cy.get('.col-md-2 .g102-main').should('exist');
    });

    it('3_6_3: the centre column holds "main"', () => {
        cy.get('.col-md-6 .g363-main').should('exist');
        cy.get('.col-md-3 .g363-side').should('exist');
        cy.get('.col-md-3 .g363-extra').should('exist');
    });

    it('section style, role and label are rendered, and the grid content with them', () => {
        cy.get('section#styled-section')
            .should('have.attr', 'role', 'region')
            .and('have.attr', 'aria-label', 'Styled section')
            .and('have.css', 'background-color', 'rgb(1, 2, 3)')
            .and('have.css', 'padding-top', '12px');
        cy.get('section#styled-section .styled-content').should('exist');
    });

    it('absolute areas level 0: the content of the home page is displayed on the page', () => {
        cy.get('.abs-home-content').should('exist');
    });

    it('absolute areas: the list of the same name under the grid is not used', () => {
        cy.get('.abs-local-content').should('not.exist');
    });
});
