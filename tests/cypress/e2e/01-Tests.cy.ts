import {createSite} from '@jahia/cypress'
import {createTestPage, pageUrl} from '../support/bootstrap5'

const siteKey = 'bootstrap5test'

describe('Bootstrap5 — Infrastructure', () => {
    before(() => {
        cy.login()
        createSite(siteKey, {
            templateSet: 'bootstrap5-templates-starter',
            serverName: 'localhost',
            locale: 'en'
        })
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/publishNode.graphql',
            variables: {
                pathOrId: `/sites/${siteKey}`,
                languages: ['en'],
                publishSubNodes: true,
                includeSubTree: true
            }
        })
        createTestPage('infra-test')
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/publishNode.graphql',
            variables: {
                pathOrId: `/sites/${siteKey}/home/infra-test`,
                languages: ['en'],
                publishSubNodes: true,
                includeSubTree: true
            }
        })
        cy.wait(3000)
    })

    it('site bootstrap5test pages are accessible', () => {
        cy.request({
            url: pageUrl('infra-test'),
            failOnStatusCode: false
        }).its('status').should('eq', 200)
    })

    it('bootstrap5 CSS is loaded on the page', () => {
        cy.visit(pageUrl('infra-test'))
        cy.get('link[href*="bootstrap"]').should('exist')
    })

})
