import {deleteSite} from '@jahia/cypress';
import {docsRtlSite, docsSite} from '../support/docs';

// Removes the demo sites of the documentation screenshots. Skipped with DOCS_KEEP_SITE=true
// (CYPRESS_DOCS_KEEP_SITE=true), to work on one spec without seeding the sites again.
describe('Documentation screenshots: teardown', () => {
    it('deletes the demo sites', function () {
        if (String(Cypress.env('DOCS_KEEP_SITE')) === 'true') {
            this.skip();
        }

        cy.login();
        deleteSite(docsSite);
        deleteSite(docsRtlSite);
    });
});
