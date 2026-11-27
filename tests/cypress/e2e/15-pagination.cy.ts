import {getNodeByPath} from '@jahia/cypress';
import {createTestPage, publishPage, deleteTestPage, pageUrl} from '../support/bootstrap5';

const siteKey = 'bootstrap5test';
const content = `/sites/${siteKey}/home/pagination-test/pagecontent`;

const addNode = (parentPathOrId: string, name: string, primaryNodeType: string, properties: object[] = [], mixins: string[] = []) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/addNode.graphql',
        variables: {parentPathOrId, name, primaryNodeType, properties, mixins}
    });
};

// Bootstrap5nt:pagination bound to a list (j:bindedComponent): 5 items, 2 per page.
describe('Bootstrap5 — Pagination', () => {
    before(() => {
        cy.login();
        createTestPage('pagination-test');

        // The pager comes before its list: that is where 2.x needs it for the first page to be
        // limited. It is bound to the list once the list exists and has an identifier.
        addNode(content, 'pager', 'bootstrap5nt:pagination', [
            {name: 'displayPager', value: 'true'},
            {name: 'pageSize', value: '2'},
            {name: 'nbOfPages', value: '10'},
            {name: 'nbOfPagesInEdit', value: '100'}
        ], ['bootstrap5mix:advancedPagination']);
        addNode(content, 'paged-list', 'jnt:contentList');
        for (let i = 1; i <= 5; i++) {
            addNode(`${content}/paged-list`, `item-${i}`, 'bootstrap5nt:text', [
                {name: 'text', value: `<p class="paged-item" data-item="${i}">Item ${i}</p>`, language: 'en'}
            ]);
        }

        getNodeByPath(`${content}/paged-list`).its('data.jcr.nodeByPath.uuid').then((listUuid: string) => {
            cy.apollo({
                mutationFile: 'graphql/jcr/mutation/mutateNode.graphql',
                variables: {
                    pathOrId: `${content}/pager`,
                    properties: [{name: 'j:bindedComponent', value: listUuid, type: 'WEAKREFERENCE'}]
                }
            });
        });
        publishPage('pagination-test');
    });

    after(() => {
        cy.login();
        deleteTestPage('pagination-test');
    });

    it('renders a pager with one entry per page, the first one current', () => {
        cy.visit(pageUrl('pagination-test'));
        cy.get('ul.pagination').should('exist');
        // Previous + 3 pages (5 items, 2 per page) + next
        cy.get('ul.pagination > li.page-item').should('have.length', 5);
        cy.get('ul.pagination > li.page-item.active').should('have.attr', 'aria-current', 'page').and('contain.text', '1');
    });

    it('"previous" is disabled on the first page', () => {
        cy.visit(pageUrl('pagination-test'));
        cy.get('ul.pagination > li.page-item').first().should('have.class', 'disabled');
        cy.get('ul.pagination > li.page-item').last().should('not.have.class', 'disabled');
    });

    it('the first page shows the first two items only', () => {
        cy.visit(pageUrl('pagination-test'));
        cy.get('.paged-item').should('have.length', 2);
        cy.get('.paged-item').first().should('have.attr', 'data-item', '1');
    });

    it('following the link of page 2 shows items 3 and 4, and marks page 2 current', () => {
        cy.visit(pageUrl('pagination-test'));
        cy.contains('ul.pagination a.page-link', '2').click();
        cy.url().should('include', 'begin');
        cy.get('.paged-item').should('have.length', 2);
        cy.get('.paged-item').first().should('have.attr', 'data-item', '3');
        cy.get('ul.pagination > li.page-item.active').should('contain.text', '2');
    });

    it('the last page shows the remaining item, and "next" is disabled', () => {
        cy.visit(pageUrl('pagination-test'));
        cy.contains('ul.pagination a.page-link', '3').click();
        cy.get('.paged-item').should('have.length', 1);
        cy.get('.paged-item').first().should('have.attr', 'data-item', '5');
        cy.get('ul.pagination > li.page-item').last().should('have.class', 'disabled');
    });
});
