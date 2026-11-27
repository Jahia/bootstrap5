import {MOBILE, docShot, docsRtlSite, home, pageReady, plainShot, regionShot, sitePath, stage, visitLive} from '../support/docs';

const demo = `${sitePath}/components`;

/**
 * The components as a visitor sees them (live workspace, anonymous unless stated).
 * Every image is named after the file of /images it replaces; ci.screenshots.sh copies them there.
 * Needs the sites of 01-seed.
 */
describe('Documentation screenshots: rendered components', {scrollBehavior: false}, () => {
    beforeEach(() => {
        // The colour mode chosen in a previous test is kept in the local storage
        cy.clearAllLocalStorage();
        cy.clearCookies();
    });

    context('Navbar', () => {
        // The menus are shown over a blank page: the content under them is not the subject
        const navbarStage = (css = '') => stage({width: 940, top: 24, left: 170, css});
        const blankPage = 'main { visibility: hidden; }';

        it('navigation: the zones of the navbar', () => {
            visitLive(home);
            navbarStage();
            docShot('navigation', {
                subject: 'nav.navbar',
                pad: 0,
                margin: {bottom: 130, left: 20, right: 20},
                callouts: [
                    {target: '.navbar-brand', label: 'Brand', side: 'bottom', shift: 10, distance: 50},
                    {target: '.navbar-nav.me-auto', label: 'Navigation list', side: 'bottom', shift: 40, distance: 50},
                    {target: '.navbar .login', label: 'Sign in', side: 'bottom', shift: -90, distance: 40},
                    {target: '.color-mode-nav .dropdown-toggle', label: 'Colour mode switcher', side: 'bottom', shift: -40, distance: 90},
                    {target: '.language-nav .dropdown-toggle', label: 'Language\nswitcher', side: 'bottom', shift: 10, distance: 34}
                ]
            });
        });

        it('navigation-toggleable: what collapses on small screens', () => {
            visitLive(home);
            navbarStage();
            docShot('navigation-toggleable', {
                subject: 'nav.navbar',
                pad: 0,
                margin: {bottom: 100, left: 20, right: 20},
                callouts: [
                    {target: '.navbar-collapse', label: 'toggleable section', side: 'bottom', shift: -180, at: [0.2, 1], box: true, boxPad: 2}
                ]
            });
        });

        it('navigation-toggler and navigation-mobile: the collapsed navbar', () => {
            visitLive(home, {viewport: MOBILE});
            stage({width: 560, top: 24, left: 100, css: 'main { visibility: hidden; }'});
            docShot('navigation-toggler', {
                subject: 'nav.navbar',
                pad: 0,
                margin: {bottom: 100, left: 20, right: 20},
                callouts: [
                    {target: '.navbar-toggler', label: 'toggler', side: 'bottom', shift: -60, box: true}
                ]
            });
            cy.get('.navbar-toggler').click();
            cy.get('.navbar-collapse.show').should('be.visible');
            plainShot('navigation-mobile', 'nav.navbar', 0);
        });

        it('navigation-recursive: three levels of pages', () => {
            visitLive(`${home}/destinations/alps/chamonix`);
            navbarStage(blankPage);
            cy.contains('.navbar .nav-link.dropdown-toggle', 'Destinations').click();
            cy.contains('.navbar .dropend > .dropdown-toggle', 'The Alps').click();
            cy.get('.navbar .submenu.dropdown-menu').should('be.visible');
            plainShot('navigation-recursive', ['.navbar-brand', '.navbar-nav.me-auto', '.navbar .navbar-nav.me-auto .dropdown-menu'], {top: 12, left: 16, right: 24, bottom: 16});
        });

        it('navigation-signin: the login form', () => {
            visitLive(home);
            stage({width: 460, height: 400, top: 20, left: 100, css: `${blankPage} nav.navbar { visibility: hidden; } .modal { visibility: visible; }`});
            cy.get('.navbar .login').click({force: true});
            cy.get('.modal.show form[name="loginForm"]').should('be.visible');
            cy.focused().should('have.attr', 'name', 'username');
            plainShot('navigation-signin', '.modal.show .modal-content', 20);
        });

        it('navigation-language: the language switcher', () => {
            visitLive(home);
            navbarStage(blankPage);
            cy.get('#languageSwitchButton').click();
            cy.get('#language-menu').should('be.visible');
            plainShot('navigation-language', ['.navbar .navbar-nav.ms-auto', '.color-mode-nav', '.language-nav', '#language-menu'], {top: 10, left: 16, right: 16, bottom: 14});
        });

        it('color-mode-switcher: the colour mode menu', () => {
            visitLive(home);
            navbarStage(blankPage);
            cy.get('.color-mode-nav [data-bs-toggle="dropdown"]').click();
            cy.get('.color-mode-nav .dropdown-menu').should('be.visible');
            plainShot('color-mode-switcher', ['.navbar .navbar-nav.ms-auto', '.color-mode-nav', '.language-nav', '.color-mode-nav .dropdown-menu'], {top: 10, left: 16, right: 16, bottom: 14});
        });

        it('navigation-edit: the menu of a signed-in editor', () => {
            cy.login();
            visitLive(home);
            navbarStage(blankPage);
            cy.contains('.navbar .dropdown-toggle', 'root').click();
            cy.get('.navbar a.logout').should('be.visible');
            plainShot('navigation-edit', ['.navbar .navbar-nav.ms-auto', '.color-mode-nav', '.language-nav', '.navbar .navbar-nav.ms-auto .dropdown-menu'], {top: 10, left: 16, right: 16, bottom: 14});
            cy.logout();
        });
    });

    context('Colour mode and right-to-left', () => {
        const region = {x: 0, y: 0, width: 1000, height: 644};

        it('color-mode-light and color-mode-dark: the same page in both modes', () => {
            visitLive(home, {viewport: [1000, 680]});
            cy.get('html').should('have.attr', 'data-bs-theme', 'light');
            regionShot('color-mode-light', region);
            cy.get('.color-mode-nav [data-bs-toggle="dropdown"]').click();
            cy.get('[data-bs-theme-value="dark"]').click();
            cy.get('html').should('have.attr', 'data-bs-theme', 'dark');
            cy.get('body').should('have.css', 'background-color', 'rgb(33, 37, 41)');
            // The focus goes back to the switcher: no focus ring in the image
            cy.focused().blur();
            regionShot('color-mode-dark', region);
        });

        it('rtl: a page in a right-to-left language', () => {
            cy.viewport(1000, 600);
            cy.visit(`/cms/render/live/ar/sites/${docsRtlSite}/home.html`);
            pageReady();
            cy.get('html').should('have.attr', 'dir', 'rtl');
            plainShot('rtl', ['nav.navbar', 'main .container'], 0);
        });
    });

    context('Accordion, breadcrumb, tabs, text', () => {
        it('accordion_default and accordion_flush', () => {
            visitLive(`${demo}/accordion`);
            stage({width: 820, top: 20, left: 100, css: '.accordion { margin-bottom: 60px; }'});
            plainShot('accordion_default', '.accordion:not(.accordion-flush)', 8);
            plainShot('accordion_flush', '.accordion.accordion-flush', 8);
        });

        it('breadcrumb', () => {
            visitLive(`${home}/destinations/alps/chamonix`);
            plainShot('breadcrumb', 'ol.breadcrumb li', {top: 10, left: 12, right: 16, bottom: 10});
        });

        it('tabs', () => {
            visitLive(`${demo}/tabs`);
            stage({width: 700, top: 20, left: 100});
            cy.get('.nav-tabs .nav-link').should('have.length', 3);
            plainShot('tabs', ['.nav-tabs', '.tab-content'], {top: 10, left: 10, right: 10, bottom: 4});
        });
    });

    context('Buttons', () => {
        const buttons = (name: string, width = 760) => {
            visitLive(`${demo}/${name}`);
            stage({width, top: 30, left: 60});
            plainShot(name, 'main .btn', {top: 8, left: 8, right: 0, bottom: 0});
        };

        it('button-style', () => buttons('button-style', 860));
        it('button-outline', () => buttons('button-outline', 860));
        it('button-size', () => buttons('button-size'));
        it('button-block', () => buttons('button-block', 640));
        it('button-state', () => buttons('button-state'));

        it('button-group', () => {
            visitLive(`${demo}/button-group`);
            stage({width: 600, top: 30, left: 60});
            plainShot('button-group', '.btn-group', 8);
        });

        it('tooltip', () => {
            visitLive(`${demo}/tooltip`);
            stage({width: 600, top: 30, left: 60, css: 'main { padding: 110px 120px 20px; }'});
            cy.get('a[data-b5-tooltip-ready]').trigger('mouseenter');
            cy.get('.tooltip.show').should('be.visible');
            plainShot('tooltip', ['main .btn', '.tooltip.show'], {top: 10, left: 10, right: 2, bottom: 2});
        });

        it('modal', () => {
            visitLive(`${demo}/modal`);
            // The button that opens the modal is kept out of the picture
            stage({width: 600, height: 420, top: 110, left: 240, css: 'main { padding: 330px 0 0 24px; }'});
            cy.get('[data-bs-toggle="modal"]').click();
            cy.get('.modal.show .modal-content').should('be.visible');
            docShot('modal', {
                subject: '.modal.show .modal-content',
                pad: 24,
                margin: {top: 70, bottom: 70, left: 10, right: 110},
                callouts: [
                    {target: '.modal.show .modal-title', label: 'Title', side: 'top', shift: 30},
                    {target: '.modal.show .btn-close', label: 'Close button', side: 'top', shift: 30},
                    {target: '.modal.show .modal-body', label: 'Body', side: 'right', distance: 40},
                    {target: '.modal.show .modal-footer .btn', label: 'Close text', side: 'bottom', shift: -60}
                ]
            });
        });

        it('popover', () => {
            visitLive(`${demo}/popover`);
            stage({width: 700, top: 30, left: 60, css: 'main { padding: 50px 30px; }'});
            cy.get('[data-bs-toggle="popover"]').focus();
            cy.get('.popover.show').should('be.visible');
            plainShot('popover', ['main .btn', '.popover.show'], 10);
        });

        it('offcanvas', () => {
            visitLive(`${demo}/offcanvas`);
            stage({width: 860, height: 400, top: 100, left: 40});
            cy.get('[data-bs-toggle="offcanvas"]').click();
            cy.get('.offcanvas.show').should('be.visible');
            docShot('offcanvas', {
                subject: 'body',
                pad: 0,
                margin: {top: 80, bottom: 80, left: 10, right: 150},
                callouts: [
                    {target: '.offcanvas.show .offcanvas-title', label: 'Title', side: 'top'},
                    {target: '.offcanvas.show .btn-close', label: 'Close button', side: 'top', shift: 30},
                    {target: '.offcanvas.show .offcanvas-body', label: 'Content of\nthe panel', side: 'right', at: [0.9, 0.3], distance: 30},
                    {target: 'main [data-bs-toggle="offcanvas"]', label: 'The button that opens the panel', side: 'bottom', shift: 60}
                ]
            });
        });
    });

    context('Card and carousel', () => {
        it('card', () => {
            visitLive(`${demo}/card`);
            stage({width: 360, top: 30, left: 400});
            docShot('card', {
                subject: '.card',
                margin: {left: 130, right: 130},
                callouts: [
                    {target: '.card-img-top', label: 'Image', side: 'right'},
                    {target: '.card-header', label: 'Header', side: 'left'},
                    {target: '.card-body', label: 'Body', side: 'left'},
                    {target: '.card-footer', label: 'Footer', side: 'right'}
                ]
            });
        });

        it('carousel: slides only', () => {
            visitLive(`${demo}/carousel`);
            stage({width: 720, top: 30, left: 60});
            cy.get('.carousel-item.active img').should('be.visible');
            plainShot('carousel', '.carousel', 0);
        });

        it('carousel_controls: indicators and controls', () => {
            visitLive(`${demo}/carousel-controls`);
            stage({width: 720, top: 90, left: 200});
            cy.get('.carousel-item.active img').should('be.visible');
            docShot('carousel_controls', {
                subject: '.carousel',
                pad: 0,
                margin: {top: 80, bottom: 80, left: 110, right: 110},
                callouts: [
                    {target: '.carousel-control-prev-icon', label: 'Previous', side: 'left', box: true, distance: 30},
                    {target: '.carousel-control-next-icon', label: 'Next', side: 'right', box: true, distance: 30},
                    {target: '.carousel-item.active .carousel-caption h3', label: 'Title and caption', side: 'top', shift: -120},
                    {target: '.carousel-indicators', label: 'Indicators', side: 'bottom', shift: -120, box: true}
                ]
            });
        });
    });

    context('Figure and image options', () => {
        it('figure', () => {
            visitLive(`${demo}/figure`);
            stage({width: 480, top: 30, left: 60});
            plainShot('figure', 'figure.figure', 8);
        });

        it('image-thumbnail', () => {
            visitLive(`${demo}/image-thumbnail`);
            stage({width: 480, top: 30, left: 60});
            plainShot('image-thumbnail', 'figure.figure img', 8);
        });

        // One label under each image: the shape, or the size, it was given
        const named = (name: string, labels: string[]) => {
            visitLive(`${demo}/${name}`);
            stage({width: 760, top: 30, left: 60});
            docShot(name, {
                subject: 'figure.figure img',
                pad: 8,
                margin: {bottom: 34},
                callouts: labels.map((label, index) => ({target: 'figure.figure img', index, label, side: 'bottom' as const, distance: 6, noArrow: true}))
            });
        };

        it('border-radius', () => named('border-radius', ['Rounded', 'Top', 'End', 'Bottom', 'Start', 'Circle', 'Pill']));
        it('border-radius-size', () => named('border-radius-size', ['1', '2', '3', '4', '5']));
    });

    context('Pagination, progress, alert', () => {
        it('pagination', () => {
            visitLive(`${demo}/pagination`);
            stage({width: 400, top: 60, left: 300});
            docShot('pagination', {
                subject: 'ul.pagination li',
                pad: 6,
                margin: {top: 80, bottom: 80, left: 120, right: 120},
                callouts: [
                    {target: 'ul.pagination .page-item', index: 0, label: 'Previous page', side: 'top', shift: -70},
                    {target: 'ul.pagination .page-item.active', label: 'Current page', side: 'bottom', shift: -30},
                    {target: 'ul.pagination .page-item:last-child', label: 'Next page', side: 'top', shift: 70}
                ]
            });
        });

        it('pagination-size', () => {
            visitLive(`${demo}/pagination-size`);
            stage({width: 400, top: 60, left: 300});
            docShot('pagination-size', {
                subject: 'ul.pagination li',
                pad: 6,
                margin: {right: 140},
                callouts: [
                    {target: 'ul.pagination-lg li:last-child', label: 'Large', side: 'right', distance: 50},
                    {target: 'ul.pagination:not(.pagination-lg):not(.pagination-sm) li:last-child', label: 'Default', side: 'right', distance: 50},
                    {target: 'ul.pagination-sm li:last-child', label: 'Small', side: 'right', distance: 50}
                ]
            });
        });

        it('progress', () => {
            visitLive(`${demo}/progress`);
            stage({width: 520, top: 30, left: 60});
            docShot('progress', {
                subject: '.progress',
                pad: 10,
                margin: {right: 190},
                callouts: [
                    {target: '.progress', index: 0, label: 'Default', side: 'right', distance: 40},
                    {target: '.progress', index: 1, label: 'Striped, "success"', side: 'right', distance: 40},
                    {target: '.progress', index: 2, label: 'Value shown', side: 'right', distance: 40}
                ]
            });
        });

        it('alert', () => {
            visitLive(`${demo}/alert`);
            stage({width: 640, top: 30, left: 60});
            plainShot('alert', '.alert', 8);
        });
    });
});
