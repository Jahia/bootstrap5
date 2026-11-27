import {docShot, home, openContentEditor, plainShot, sitePath} from '../support/docs';

const demo = `${sitePath}/components`;
const field = (name: string) => `[data-sel-content-editor-field="${name}"]`;
const group = (name: string) => `[data-sel-content-editor-fields-group="${name}"]`;
const toggle = (mixin: string) => `[data-sel-role-dynamic-fieldset="${mixin}"]`;

/** Gives an id to the block of options a mixin toggle switches on, so that it can be captured. */
const tagFieldset = (mixin: string, id: string) => {
    cy.get(toggle(mixin)).closest('article').invoke('attr', 'id', id);
};

/**
 * The forms of the jContent content editor (edit workspace, signed in as root).
 * Needs the sites of 01-seed.
 */
describe('Documentation screenshots: content editor', {scrollBehavior: false}, () => {
    beforeEach(() => {
        cy.login();
        cy.viewport(1400, 1000);
    });

    it('navigation-options: starting point and global settings of the navbar', () => {
        openContentEditor(`${home}/header/navbar`);
        cy.get(field('bootstrap5nt:navbar_root'), {timeout: 60000}).should('be.visible');
        tagFieldset('bootstrap5mix:navbarGlobalSettings', 'docs-global');
        cy.get(field('bootstrap5mix:navbarGlobalSettings_addContainerWithinTheNavbar')).should('be.visible');
        docShot('navigation-options', {
            subject: [field('bootstrap5nt:navbar_root'), '#docs-global'],
            pad: {top: 8, left: 8, right: 8, bottom: 8},
            margin: {right: 170},
            callouts: [
                {target: '#docs-global', label: 'Switch on to set\nthese options', side: 'right', distance: 20, at: [0.3, 0.035], shift: -230}
            ]
        });
    });

    it('grid-layout: the options of a grid', () => {
        openContentEditor(`${demo}/grid/pagecontent/new-grid`);
        cy.get(toggle('bootstrap5mix:createRow'), {timeout: 60000}).should('exist');
        plainShot('grid-layout', group('content'), 0);
    });

    it('text: the rich text toolbar', () => {
        openContentEditor(`${demo}/text/pagecontent/text`);
        cy.get('.cke_toolbox', {timeout: 60000}).should('be.visible');
        // The editor loads its content after the toolbar
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000);
        docShot('text', {
            subject: '.cke_top',
            pad: 6,
            margin: {top: 110, bottom: 110, left: 30, right: 30},
            callouts: [
                {target: '.cke_button__source', label: 'HTML source', side: 'top', shift: -10, distance: 70},
                {target: '.cke_button__pastetext', label: 'Paste as plain text', side: 'top', shift: 40, distance: 30},
                {target: '.cke_combo__styles', label: 'Bootstrap styles', side: 'top', shift: 30, distance: 70},
                {target: '.cke_button__numberedlist', label: 'Bold, italic, lists, indentation', side: 'top', shift: 60, distance: 30},
                {target: '.cke_button__justifycenter', label: 'Alignment', side: 'bottom', shift: -20, distance: 30},
                {target: '.cke_button__image', label: 'Link, anchor, image,\ntable, line', side: 'bottom', shift: -20, distance: 60},
                {target: '.cke_button__maximize', label: 'Full screen', side: 'bottom', shift: 10, distance: 24},
                {target: '.cke_button__wash', label: 'Remove format, clean up HTML', side: 'bottom', shift: 130, distance: 66}
            ]
        });
    });
});
