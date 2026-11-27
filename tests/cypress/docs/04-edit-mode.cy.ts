import {docShot, liveUrl, pageReady, sitePath} from '../support/docs';

const demo = `${sitePath}/components`;
// jContent swaps two frames when the page reloads: the displayed one is the active one
const FRAME = 'iframe[data-sel-role="page-builder-frame-active"]';
const BOX = '[data-sel-role="page-builder-box"]';
const CAPTION_ID = 'docs-caption';

/** The body of the page builder's frame (the page as jContent renders it in edit mode). */
const frame = () => cy.get(FRAME, {timeout: 90000}).its('0.contentDocument.body').should('not.be.empty').then(cy.wrap);

/** The page builder box whose header shows this title: gives ids to the box and its Edit button. */
const tagBox = (title: string, id: string) => {
    cy.get(FRAME).then($frame => {
        const doc = ($frame[0] as HTMLIFrameElement).contentDocument as Document;
        const header = Array.from(doc.querySelectorAll(`${BOX} header`)).find(h => h.textContent?.includes(title));
        expect(header, `box header "${title}"`).to.not.eq(undefined);
        (header as Element).closest(BOX)?.setAttribute('id', `${id}-box`);
        (header as Element).querySelector('button[data-sel-role="edit"]')?.setAttribute('id', `${id}-edit`);
    });
};

/** Opens a demo page in the page builder and waits until its boxes are drawn. */
const openPageBuilder = (page: string) => {
    cy.visit(`/jahia/jcontent/bootstrap5docs/en/pages/components/${page}`);
    frame().find('[jahiatype="module"]', {timeout: 60000}).should('exist');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
};

/** Selects a component of the page builder by clicking it (its header, with Edit, then shows). */
const select = (selector: string, title: string) => {
    frame().find(selector).first().click();
    frame().find(`${BOX} header`).should($h => expect($h.text()).to.contain(title));
};

// ─── Animations ─────────────────────────────────────────────────────────────
// An animation is a sequence of captures in results/screenshots/<spec>/frames/<name>/NN.png (or
// NN-d<ms>.png to hold a frame for that long); ci.screenshots.sh turns each sequence into a GIF.

/** A caption bar at the top of the page, over what the capture shows. */
const caption = (text: string, width?: number) => {
    cy.document({log: false}).then(doc => {
        doc.getElementById(CAPTION_ID)?.remove();
        const bar = doc.createElement('div');
        bar.id = CAPTION_ID;
        bar.textContent = text;
        bar.setAttribute('style', `position:fixed;left:0;${width ? `width:${width}px` : 'right:0'};top:0;height:48px;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#1d2b3a;color:#fff;font:600 21px Helvetica,Arial,sans-serif;pointer-events:none`);
        doc.documentElement.appendChild(bar);
    });
};

type Clip = {x: number, y: number, width: number, height: number}

const frames = (name: string) => (n: string, clip?: () => Clip) => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(800);
    cy.then(() => cy.screenshot(`frames/${name}/${n}`, {capture: 'viewport', overwrite: true, scale: false, log: false, ...(clip ? {clip: clip()} : {})}));
};

/** Saves the form; the page builder then reloads its frame. */
const confirm = () => {
    cy.contains('button', /^save$/i).click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
};

/** The edit mode of jContent (page builder), signed in as root. Needs the sites of 01-seed. */
describe('Documentation screenshots: edit mode', {scrollBehavior: false}, () => {
    beforeEach(() => {
        cy.login();
        cy.viewport(1400, 900);
    });

    it('edit-tabs: the main tabs component', () => {
        openPageBuilder('tabs');
        select('.nav-tabs', 'tabs');
        tagBox('tabs', 'docs-tabs');
        cy.get(FRAME).its('0.contentDocument').then(doc => cy.wrap(doc).find('#docs-tabs-edit').should('be.visible'));
        docShot('edit-tabs', {
            frame: FRAME,
            subject: '#docs-tabs-box',
            pad: {top: 36, bottom: 36, left: 0, right: 0},
            margin: {top: 80},
            callouts: [
                {target: '#docs-tabs-edit', label: 'Click the tabs, then Edit (or right click)\nto change the style, alignment, etc.', side: 'top', distance: 30, shift: -140, at: [0.5, 0]}
            ]
        });
    });

    it('edit-tab: the content list of one tab', () => {
        openPageBuilder('tabs');
        // The header of a list offers Edit without selecting it (selecting it adds insertion buttons over the text)
        tagBox('Itinerary', 'docs-tab');
        cy.get(FRAME).its('0.contentDocument').then(doc => cy.wrap(doc).find('#docs-tab-edit').should('be.visible'));
        docShot('edit-tab', {
            frame: FRAME,
            subject: ['.nav-tabs', '#docs-tab-box'],
            pad: {top: 0, bottom: 0, left: 0, right: 0},
            margin: {top: 80},
            callouts: [
                {target: '#docs-tab-edit', label: 'Click Edit (or right click the list)\nto change the label of the tab', side: 'top', distance: 30, shift: -140, at: [0.5, 0]}
            ]
        });
    });

    it('grid-limit: a column that has reached the limit', () => {
        openPageBuilder('grid-limit');
        docShot('grid-limit', {
            frame: FRAME,
            subject: ['[jahiatype="module"][path$="/grid/main"]', '[jahiatype="module"][path$="/grid/side"]'],
            pad: {top: 38, bottom: 6, left: 6, right: 6},
            margin: {bottom: 110},
            callouts: [
                {target: '[jahiatype="module"][path$="/grid/main"]', label: 'Two items, the limit: no New content\nbutton, nothing more can be added', side: 'bottom', distance: 40, shift: 0},
                {target: '[jahiatype="module"][path$="/grid/side"] [type="placeholder"]', label: 'One item: there is room for another', side: 'bottom', distance: 40, shift: 0}
            ]
        });
    });

    it('pagination-init: the two pagers around the list', () => {
        openPageBuilder('pagination');
        docShot('pagination-init', {
            frame: FRAME,
            subject: ['[jahiatype="module"][path$="/pagecontent/pagination"]', '[jahiatype="module"][path$="/departures"]', '[jahiatype="module"][path$="/pagecontent/pagination-1"]'],
            pad: {top: 6, bottom: 6, left: 6, right: 6},
            margin: {left: 300},
            frames: ['[jahiatype="module"][path$="/departures"]'],
            callouts: [
                {target: '[jahiatype="module"][path$="/pagecontent/pagination"]', label: 'Pager 1, before the list:\nthe bar is hidden, it only\ncuts the list into pages', side: 'left', distance: 24, at: [0, 0.5], shift: 30},
                {target: '[jahiatype="module"][path$="/departures"]', label: 'The list to paginate', side: 'left', distance: 24, noArrow: true},
                {target: '[jahiatype="module"][path$="/pagecontent/pagination-1"]', label: 'Pager 2, after the list:\nit displays the bar', side: 'left', distance: 24}
            ]
        });
    });

    it('tabs-add: adding a tab', () => {
        const snap = frames('tabs-add');
        cy.viewport(1280, 720);
        openPageBuilder('tabs-new');
        caption('1. In the page, click New content');
        snap('01');
        frame().contains('button', 'New content').click();
        cy.get('input[type="text"], input[type="search"]').first().type('Tabs');
        caption('2. Choose Tabs and pills, then Create');
        cy.contains('Tabs and pills').click();
        snap('02');
        cy.contains('button', /^create$/i).click();
        caption('3. Set the style and alignment, then Save');
        snap('03');
        confirm();
        caption('4. Each tab is a list: click New List of content items');
        frame().contains(/List of content items/, {timeout: 30000}).should('exist');
        snap('04');
        frame().contains(/List of content items/).click();
        cy.get('input[type="text"]:visible').first().type('Tab 1');
        caption('5. Its title is the text of the tab');
        snap('05');
        confirm();
        caption('6. The tab is there: add the next one the same way');
        frame().contains('header', 'Tab 1', {timeout: 30000}).should('exist');
        snap('06');
        frame().contains(/List of content items/).click();
        cy.get('input[type="text"]:visible').first().type('Tab 2');
        caption('7. Title of the second tab');
        snap('07');
        confirm();
        caption('8. Two tabs. Add content inside each tab with New content');
        frame().find('.nav-tabs .nav-link', {timeout: 30000}).should('have.length', 2);
        snap('08-d2800');
    });
});

/** The live pages of the pagination animations: a narrow crop of the list, under a caption. */
describe('Documentation screenshots: pagination animations', {scrollBehavior: false}, () => {
    const WIDTH = 440;

    /** Room for the caption and the sides of the page. */
    const prepare = (text: string) => {
        cy.document({log: false}).then(doc => {
            const style = doc.createElement('style');
            style.textContent = 'body { padding: 64px 20px 0 !important; margin: 0 !important; } ::-webkit-scrollbar { display: none; }';
            doc.head.appendChild(style);
        });
        caption(text, WIDTH);
    };

    /** The crop: from the top of the page to 24 px under the lowest element matching the selector. */
    const regionBelow = (last: string): Cypress.Chainable<Clip> => cy.document({log: false}).then(doc => {
        const bottom = Math.max(...Array.from(doc.querySelectorAll(last)).map(e => e.getBoundingClientRect().bottom));
        return {x: 0, y: 0, width: WIDTH, height: Math.ceil(bottom) + 24};
    });

    beforeEach(() => {
        cy.clearAllLocalStorage();
        cy.viewport(1280, 720);
    });

    it('pagination-before: the whole list on one page', () => {
        const snap = frames('pagination-before');
        cy.visit(liveUrl(`${demo}/pagination-none`));
        pageReady();
        prepare('Before: all 7 items on one page');
        const items = 'main p';
        cy.get(items).its('length').should('be.gte', 7);
        regionBelow(items).then(region => {
            for (let i = 0; i < 7; i++) {
                cy.get(items).then($p => {
                    $p.css('background', '');
                    $p.eq(i).css('background', '#fff3cd');
                });
                snap(`${String(i + 1).padStart(2, '0')}-d${i === 6 ? 2600 : 700}`, () => region);
            }
        });
    });

    it('pagination-after: two items per page, with the bar', () => {
        const snap = frames('pagination-after');
        cy.visit(liveUrl(`${demo}/pagination`));
        pageReady();
        cy.get('ul.pagination').should('be.visible');
        prepare('After: 2 items per page, with a bar');
        regionBelow('ul.pagination').then(region => {
            snap('01-d1800', () => region);
            ['2', '3', '4', '1'].forEach((label, i) => {
                cy.contains('ul.pagination a', new RegExp(`^${label}$`)).click();
                // The page reloads: let it finish before looking at it
                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(2500);
                cy.get('ul.pagination .page-item.active', {timeout: 30000}).should('contain.text', label);
                pageReady();
                prepare('After: 2 items per page, with a bar');
                snap(`${String(i + 2).padStart(2, '0')}-d1800`, () => region);
            });
        });
    });
});
