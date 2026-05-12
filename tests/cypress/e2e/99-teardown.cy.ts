import {deleteSite} from '@jahia/cypress'

const siteKey = 'bootstrap5test'

describe('Bootstrap5 — Teardown', () => {
    it('deletes the test site', () => {
        cy.login()
        deleteSite(siteKey)
    })
})
