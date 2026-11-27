import {createSite, deleteSite} from '@jahia/cypress'
import {addNode, publishNode} from '../support/bootstrap5'

const siteKey = 'bootstrap5lang'
const home = `/sites/${siteKey}/home`
const live = (path: string, lang: string) => `/cms/render/live/${lang}${path}.html`

// The language switcher of the navbar on a site in three languages.
describe('Bootstrap5 — Navbar language switcher (multilingual site)', () => {
    before(() => {
        cy.login()
        createSite(siteKey, {
            templateSet: 'bootstrap5-templates-starter',
            serverName: 'localhost',
            locale: 'en',
            languages: 'en,fr,de'
        })
        // The site and its home page are published first, in English only: the home page has no
        // French or German translation, which pages in those languages must cope with
        publishNode(`/sites/${siteKey}`, ['en'])

        // "all": translated and published in the three languages
        addNode(home, 'all', 'jnt:page', [
            {name: 'jcr:title', value: 'All languages', language: 'en'},
            {name: 'jcr:title', value: 'Toutes les langues', language: 'fr'},
            {name: 'jcr:title', value: 'Alle Sprachen', language: 'de'},
            {name: 'j:templateName', value: 'starter'}
        ], [], [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}])
        addNode(`${home}/all/pagecontent`, 'navbar', 'bootstrap5nt:navbar', [{name: 'root', value: 'homePage'}])

        // "partial": published in English and French only
        addNode(home, 'partial', 'jnt:page', [
            {name: 'jcr:title', value: 'Partial', language: 'en'},
            {name: 'jcr:title', value: 'Partiel', language: 'fr'},
            {name: 'jcr:title', value: 'Teilweise', language: 'de'},
            {name: 'j:templateName', value: 'starter'}
        ], [], [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}])
        addNode(`${home}/partial/pagecontent`, 'navbar', 'bootstrap5nt:navbar', [{name: 'root', value: 'homePage'}])

        // "invalid": published everywhere, but German is invalidated on the page
        addNode(home, 'invalid', 'jnt:page', [
            {name: 'jcr:title', value: 'Invalid', language: 'en'},
            {name: 'jcr:title', value: 'Invalide', language: 'fr'},
            {name: 'jcr:title', value: 'Ungültig', language: 'de'},
            {name: 'j:templateName', value: 'starter'},
            {name: 'j:invalidLanguages', values: ['de']}
        ], [], [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}])
        addNode(`${home}/invalid/pagecontent`, 'navbar', 'bootstrap5nt:navbar', [{name: 'root', value: 'homePage'}])

        publishNode(`${home}/all`, ['en', 'fr', 'de'])
        publishNode(`${home}/partial`, ['en', 'fr'])
        publishNode(`${home}/invalid`, ['en', 'fr', 'de'])
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(3000)
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
    })

    it('shows the current language code on the toggle', () => {
        cy.visit(live(`${home}/all`, 'en'))
        cy.get('.language-nav #languageSwitchButton').should('contain.text', 'EN')
    })

    it('lists the other languages by their own name, with lang attributes', () => {
        cy.visit(live(`${home}/all`, 'en'))
        cy.get('#language-menu a.dropdown-item').should('have.length', 2)
        cy.contains('#language-menu a.dropdown-item', 'français').should('have.attr', 'lang', 'fr')
        cy.contains('#language-menu a.dropdown-item', 'Deutsch').should('have.attr', 'lang', 'de')
    })

    it('does not list the current language', () => {
        cy.visit(live(`${home}/all`, 'fr'))
        cy.get('.language-nav #languageSwitchButton').should('contain.text', 'FR')
        cy.contains('#language-menu a.dropdown-item', 'français').should('not.exist')
        cy.contains('#language-menu a.dropdown-item', 'English').should('exist')
    })

    it('a language link opens the same page in that language', () => {
        cy.visit(live(`${home}/all`, 'en'))
        cy.contains('#language-menu a.dropdown-item', 'français')
            .should('have.attr', 'href')
            .then(href => {
                cy.visit(String(href))
            })
        cy.location('pathname').should('include', '/fr/')
        cy.title().should('eq', 'Toutes les langues')
        cy.get('html').should('have.attr', 'lang', 'fr')
    })

    it('a page renders in a language the home page is not translated in', () => {
        cy.request(live(`${home}/all`, 'de')).its('status').should('eq', 200)
        cy.visit(live(`${home}/all`, 'de'))
        cy.title().should('eq', 'Alle Sprachen')
        cy.get('nav.navbar').should('exist')
    })

    it('the skip link is the first link of the page, translated, and targets the main landmark', () => {
        cy.visit(live(`${home}/all`, 'fr'))
        cy.get('body a').first()
            .should('have.attr', 'href', '#main')
            .and('have.text', 'Aller au contenu principal')
        cy.get('main#main nav.navbar').should('exist')
        cy.visit(live(`${home}/all`, 'en'))
        cy.get('body a').first().should('have.text', 'Skip to main content')
    })

    it('in live, a language in which the page is not published is not offered', () => {
        cy.visit(live(`${home}/partial`, 'en'))
        cy.contains('#language-menu a.dropdown-item', 'français').should('exist')
        cy.contains('#language-menu a.dropdown-item', 'Deutsch').should('not.exist')
    })

    it('a language invalidated on the page is not offered', () => {
        cy.visit(live(`${home}/invalid`, 'en'))
        cy.contains('#language-menu a.dropdown-item', 'français').should('exist')
        cy.contains('#language-menu a.dropdown-item', 'Deutsch').should('not.exist')
    })
})
