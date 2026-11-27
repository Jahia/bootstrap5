import {getNodeByPath} from '@jahia/cypress';
import {createTestPage, publishPage, deleteTestPage, pageUrl} from '../support/bootstrap5';

const siteKey = 'bootstrap5test';
const home = `/sites/${siteKey}/home`;

const createPage = (parentPath: string, name: string, title: string) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/addNode.graphql',
        variables: {
            parentPathOrId: parentPath,
            name,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: title, language: 'en'},
                {name: 'j:templateName', value: 'starter'}
            ],
            children: [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}]
        }
    });
};

const addNavbar = (pagePath: string, name: string, properties: object[], mixins: string[] = []) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/addNode.graphql',
        variables: {
            parentPathOrId: `${pagePath}/pagecontent`,
            name,
            primaryNodeType: 'bootstrap5nt:navbar',
            properties,
            mixins
        }
    });
};

const publish = (pathOrId: string) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/publishNode.graphql',
        variables: {pathOrId, languages: ['en'], publishSubNodes: true, includeSubTree: true}
    });
};

const livePath = (path: string) => `/cms/render/live/en${path}.html`;

// Behaviours of the 2.x navbar ("basenav-multilevel" view): up to five levels, the state classes,
// and the root of the menu.
describe('Bootstrap5 — Navbar (2.x parity)', () => {
    before(() => {
        cy.login();

        // /home/deep-1/deep-2/deep-3/deep-4/deep-5: five levels below the home page
        let parent = home;
        for (let level = 1; level <= 5; level++) {
            createPage(parent, `deep-${level}`, `Deep ${level}`);
            parent = `${parent}/deep-${level}`;
        }

        // A sibling of deep-3 with a child, to tell menus rooted at deep-2 from the others
        createPage(`${home}/deep-1/deep-2`, 'deep-3b', 'Deep 3b');

        // On the level-3 page: a five-level navbar from the home page, plus two navbars whose
        // root is set WITHOUT the navbarGlobalSettings mixin ("root" belongs to the navbar itself)
        const deep3 = `${home}/deep-1/deep-2/deep-3`;
        addNavbar(deep3, 'navbar-five', [{name: 'root', value: 'homePage'}, {name: 'maxlevel', value: '5'}], ['bootstrap5mix:navbarGlobalSettings']);
        addNavbar(deep3, 'navbar-current', [{name: 'root', value: 'currentPage'}]);
        addNavbar(deep3, 'navbar-parent', [{name: 'root', value: 'parentPage'}]);

        // A navbar rooted at a page picked by the editor
        createTestPage('navbar-custom-root');
        getNodeByPath(`${home}/deep-1/deep-2`).its('data.jcr.nodeByPath.uuid').then((uuid: string) => {
            addNavbar(`${home}/navbar-custom-root`, 'navbar-custom', [
                {name: 'root', value: 'customRootPage'},
                {name: 'customRootPage', value: uuid, type: 'WEAKREFERENCE'}
            ], ['bootstrap5mix:customRootPage']);
        });

        publish(`${home}/deep-1`);
        publishPage('navbar-custom-root');
        cy.wait(2000);
    });

    after(() => {
        cy.login();
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/deleteNode.graphql',
            variables: {pathOrId: `${home}/deep-1`, workspace: 'EDIT'}
        });
        deleteTestPage('navbar-custom-root');
    });

    context('Five levels (maxlevel = 5)', () => {
        beforeEach(() => {
            cy.visit(livePath(`${home}/deep-1/deep-2/deep-3`));
        });

        it('renders the pages of levels 4 and 5', () => {
            cy.get('nav.navbar').first().within(() => {
                cy.get('a[href$="/deep-4.html"]').should('exist');
                cy.get('a[href$="/deep-5.html"]').should('exist');
            });
        });

        it('nests one submenu per level below the top-level dropdown', () => {
            // Deep-2, deep-3 and deep-4 each open a submenu; deep-5 is a plain item
            // Counted inside the dropdown of deep-1 only: other specs leave their own pages in the menu
            cy.get('nav.navbar').first().find('a[href$="/deep-1.html"]').first().closest('li.dropdown')
                .find('li.dropend > ul.submenu.dropdown-menu').should('have.length', 3);
            cy.get('nav.navbar').first().find('ul.submenu ul.submenu ul.submenu a[href$="/deep-5.html"]').should('exist');
        });

        it('marks the page displayed with .active and aria-current', () => {
            cy.get('nav.navbar').first().find('a[href$="/deep-3.html"][aria-current="page"]')
                .should('exist')
                .and('have.class', 'active');
        });

        it('marks the ancestors of the page displayed with .inpath, not .active', () => {
            cy.get('nav.navbar').first().find('li.dropdown > a.dropdown-toggle')
                .should('have.class', 'inpath')
                .and('not.have.class', 'active');
        });

        it('does not mark the pages below the page displayed', () => {
            cy.get('nav.navbar').first().find('a[href$="/deep-4.html"]').each($link => {
                expect($link).not.to.have.class('active');
                expect($link).not.to.have.class('inpath');
            });
        });
    });

    context('Root of the menu', () => {
        it('root = currentPage (no global settings): the menu lists the children of the page displayed', () => {
            cy.visit(livePath(`${home}/deep-1/deep-2/deep-3`));
            cy.get('nav.navbar').eq(1).within(() => {
                cy.get('ul.navbar-nav a[href$="/deep-4.html"]').should('exist');
                cy.get('ul.navbar-nav a[href$="/deep-1.html"]').should('not.exist');
            });
        });

        it('root = parentPage (no global settings): the menu lists the siblings of the page displayed', () => {
            cy.visit(livePath(`${home}/deep-1/deep-2/deep-3`));
            cy.get('nav.navbar').eq(2).within(() => {
                cy.get('ul.navbar-nav a[href$="/deep-3b.html"]').should('exist');
                cy.get('ul.navbar-nav a[href$="/deep-1.html"]').should('not.exist');
            });
        });

        it('root = customRootPage: the menu lists the children of the chosen page', () => {
            cy.visit(pageUrl('navbar-custom-root'));
            cy.get('nav.navbar').first().within(() => {
                cy.get('ul.navbar-nav a[href$="/deep-3.html"]').should('exist');
                cy.get('ul.navbar-nav a[href$="/deep-3b.html"]').should('exist');
                cy.get('ul.navbar-nav a[href$="/deep-1.html"]').should('not.exist');
            });
        });
    });
});
