/**
 * Helpers of the documentation screenshots (cypress/docs): a demo site, and captures of one region
 * of the page, plain or annotated with red arrows and labels like the images of /images.
 *
 * An annotated capture is made of three rectangles, all inside the viewport:
 *   - the subject: the element(s) shown, plus `pad` pixels of their surroundings;
 *   - the margins around it: white space reserved for the labels, whatever the page shows there;
 *   - the capture: subject + margins, which is what cy.screenshot clips.
 * A label that leaves the capture, covers the subject or another label fails the test: a wrong
 * image is worse than a missing one.
 */
import {getNodeByPath} from '@jahia/cypress';

export const docsSite = 'bootstrap5docs';
export const docsRtlSite = 'bootstrap5docsrtl';
export const sitePath = `/sites/${docsSite}`;
export const home = `${sitePath}/home`;

/** Fixed viewport of the captures (the Electron window of `cypress run` is 1280x720). */
export const DESKTOP: [number, number] = [1280, 720];
/** Below Bootstrap's lg breakpoint: the navbar collapses behind its toggler. */
export const MOBILE: [number, number] = [760, 640];

const RED = '#ff0000';
const OVERLAY_ID = 'docs-overlay';
const STAGE_ID = 'docs-stage';

export const liveUrl = (path: string, lang = 'en') => `/cms/render/live/${lang}${path}.html`;

type Side = 'top' | 'bottom' | 'left' | 'right'

interface Box {
    top: number
    right: number
    bottom: number
    left: number
}

interface Rect {
    left: number
    top: number
    right: number
    bottom: number
}

export interface Callout {
    /** CSS selector of the element pointed at (looked up in the frame when the shot has one). */
    target: string
    /** Which displayed match of the selector (default 0). */
    index?: number
    /** Text of the label; "\n" starts a new line. */
    label: string
    /** The margin the label sits in. */
    side: Side
    /** Moves the label along its margin, from the centre of the target (px). */
    shift?: number
    /** Space between the subject and the label (px, default 46). */
    distance?: number
    /** Where the arrow points on the target, as fractions of its width and height. */
    at?: [number, number]
    /** Draws a red frame around the target. */
    box?: boolean
    /** Enlarges the frame around the target (px, default 4). */
    boxPad?: number
    /** No arrow: the label only (to name a framed zone it touches). */
    noArrow?: boolean
}

export interface ShotOptions {
    /** Selector(s) of what is captured: the union of every displayed element they match. */
    subject: string | string[]
    /** Selector of the iframe holding the subject and the targets (page builder). */
    frame?: string
    /** Surroundings kept around the subject (px, default 12). */
    pad?: number | Partial<Box>
    /** White space reserved around the subject for the labels (px per side, default 0). */
    margin?: Partial<Box>
    callouts?: Callout[]
    /** Colour of the reserved margins (default white). */
    background?: string
    /** Selectors of elements framed in red without a label. */
    frames?: string[]
}

const toBox = (value: number | Partial<Box> | undefined, fallback: number): Box => {
    if (typeof value === 'number') {
        return {top: value, right: value, bottom: value, left: value};
    }

    return {top: fallback, right: fallback, bottom: fallback, left: fallback, ...value};
};

const intersects = (a: Rect, b: Rect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

const svgEl = (doc: Document, name: string, attributes: Record<string, string | number>) => {
    const el = doc.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, String(value)));
    return el;
};

/** Removes what a previous capture drew on the page. */
export const clearAnnotations = () => {
    cy.document({log: false}).then(doc => doc.getElementById(OVERLAY_ID)?.remove());
};

/**
 * Shows the page in a box of the given width placed at (left, top) of a wider white viewport:
 * the white around it is where the labels go. Fixed elements (modal, offcanvas, backdrop) stay
 * inside the box. Media queries still follow the real viewport: pick the viewport for the
 * breakpoint, and the stage for the size of the image.
 */
export const stage = (options: {width: number, height?: number, top?: number, left?: number, css?: string}) => {
    const {width, height, top = 0, left = 0, css = ''} = options;
    cy.document({log: false}).then(doc => {
        doc.getElementById(STAGE_ID)?.remove();
        const style = doc.createElement('style');
        style.id = STAGE_ID;
        style.textContent = `
            html { background: #fff !important; overflow: auto !important; }
            body {
                width: ${width}px !important; ${height ? `height: ${height}px !important;` : ''}
                margin: ${top}px 0 0 ${left}px !important;
                position: relative !important; transform: translate(0, 0); overflow: hidden !important;
                padding-right: 0 !important;
            }
            .modal-backdrop, .offcanvas-backdrop { width: 100% !important; height: 100% !important; }
            ${css}`;
        doc.head.appendChild(style);
    });
};

/** Extra CSS for one capture (hide an unrelated element, give room to a component...). */
export const pageCss = (css: string) => {
    cy.document({log: false}).then(doc => {
        const style = doc.createElement('style');
        style.textContent = css;
        doc.head.appendChild(style);
    });
};

/** The page is styled by Bootstrap and its images are loaded: an unstyled capture must fail. */
export const pageReady = () => {
    cy.document().should(doc => {
        const win = doc.defaultView as Window;
        const fontSize = win.getComputedStyle(doc.documentElement).getPropertyValue('--bs-body-font-size');
        expect(fontSize, 'Bootstrap stylesheet').to.not.eq('');
        Array.from(doc.images).forEach(image => {
            expect(image.complete && image.naturalWidth > 0, `image ${image.src} loaded`).to.eq(true);
        });
    });
    cy.document().then(doc => (doc as Document & {fonts?: {ready: Promise<unknown>}}).fonts?.ready);
    // No scrollbar, text caret nor focus ring in the images: they are not part of the component
    pageCss(`
        ::-webkit-scrollbar { display: none; }
        *, *::before, *::after { caret-color: transparent !important; }
        :focus, :focus-visible { outline: 0 !important; box-shadow: none !important; }`);
};

/** Opens a live page as a visitor would see it, at a fixed viewport. */
export const visitLive = (path: string, options: {lang?: string, viewport?: [number, number], site?: string} = {}) => {
    const {lang = 'en', viewport = DESKTOP} = options;
    cy.viewport(viewport[0], viewport[1]);
    cy.visit(liveUrl(path, lang));
    pageReady();
};

const fail = (name: string, message: string): never => {
    throw new Error(`Screenshot "${name}": ${message}`);
};

/**
 * Draws the annotations of a shot in the page and returns the rectangle to capture.
 * Exported for tests of the helper; `docShot` is what specs call.
 */
export const annotate = (doc: Document, name: string, options: ShotOptions): {x: number, y: number, width: number, height: number} => {
    doc.getElementById(OVERLAY_ID)?.remove();
    const win = doc.defaultView as Window;
    const viewport = {left: 0, top: 0, right: win.innerWidth, bottom: win.innerHeight};

    // Where the elements are looked up, and the offset of that document in the viewport
    let scope: Document = doc;
    let offset = {x: 0, y: 0};
    if (options.frame) {
        const iframe = doc.querySelector<HTMLIFrameElement>(options.frame);
        if (!iframe?.contentDocument) {
            return fail(name, `frame ${options.frame} not found`);
        }

        scope = iframe.contentDocument;
        const frameRect = iframe.getBoundingClientRect();
        offset = {x: frameRect.left + iframe.clientLeft, y: frameRect.top + iframe.clientTop};
    }

    const toRect = (el: Element): Rect => {
        const r = el.getBoundingClientRect();
        return {left: r.left + offset.x, top: r.top + offset.y, right: r.right + offset.x, bottom: r.bottom + offset.y};
    };

    /** The displayed elements matching a selector. */
    const rectsOf = (selector: string): Rect[] => {
        const rects = Array.from(scope.querySelectorAll(selector)).map(toRect).filter(r => r.right > r.left && r.bottom > r.top);
        if (rects.length === 0) {
            return fail(name, `no displayed element matches ${selector}`);
        }

        return rects;
    };

    const rectOf = (selector: string, index = 0): Rect => {
        const rects = rectsOf(selector);
        return rects[index] ?? fail(name, `${selector} has no displayed match of index ${index}`);
    };

    // The subject: the union of every displayed element matching its selector(s)
    const subjects = Array.isArray(options.subject) ? options.subject : [options.subject];
    const pad = toBox(options.pad, 12);
    const margin = toBox(options.margin, 0);
    const measure = () => {
        const rects = subjects.flatMap(selector => rectsOf(selector));
        return {
            left: Math.floor(Math.min(...rects.map(r => r.left)) - pad.left),
            top: Math.floor(Math.min(...rects.map(r => r.top)) - pad.top),
            right: Math.ceil(Math.max(...rects.map(r => r.right)) + pad.right),
            bottom: Math.ceil(Math.max(...rects.map(r => r.bottom)) + pad.bottom)
        };
    };

    const captureOf = (s: Rect) => ({
        left: s.left - margin.left, top: s.top - margin.top, right: s.right + margin.right, bottom: s.bottom + margin.bottom
    });

    // Bring the capture inside the viewport when the page can scroll there
    let subject = measure();
    let capture = captureOf(subject);
    const scroller = scope.defaultView as Window;
    if (capture.top < 0 || capture.bottom > viewport.bottom) {
        const wanted = capture.top < 0 ? capture.top : Math.min(capture.top, capture.bottom - viewport.bottom);
        scroller.scrollBy(0, wanted);
        subject = measure();
        capture = captureOf(subject);
    }

    if (capture.left < 0 || capture.top < 0 || capture.right > viewport.right || capture.bottom > viewport.bottom) {
        return fail(name, `the capture ${JSON.stringify(capture)} does not fit in the viewport ${viewport.right}x${viewport.bottom}`);
    }

    const overlay = doc.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('style', 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:2147483647;pointer-events:none;margin:0;padding:0');
    const svg = svgEl(doc, 'svg', {width: viewport.right, height: viewport.bottom, viewBox: `0 0 ${viewport.right} ${viewport.bottom}`});
    svg.setAttribute('style', 'display:block;position:absolute;left:0;top:0');
    overlay.appendChild(svg);
    // The overlay hangs under <html>, not <body>: the stage transforms the body
    doc.documentElement.appendChild(overlay);

    const defs = svgEl(doc, 'defs', {});
    const marker = svgEl(doc, 'marker', {
        id: 'docs-arrowhead', viewBox: '0 0 12 10', refX: 11, refY: 5, markerWidth: 12, markerHeight: 10,
        markerUnits: 'userSpaceOnUse', orient: 'auto'
    });
    marker.appendChild(svgEl(doc, 'path', {d: 'M0,0 L12,5 L0,10 L2.5,5 Z', fill: RED}));
    defs.appendChild(marker);
    svg.appendChild(defs);

    // The reserved margins: everything of the capture that is not the subject
    const hasMargin = margin.top + margin.right + margin.bottom + margin.left > 0;
    if (hasMargin) {
        const outer = `M${capture.left},${capture.top} H${capture.right} V${capture.bottom} H${capture.left} Z`;
        const inner = `M${subject.left},${subject.top} H${subject.right} V${subject.bottom} H${subject.left} Z`;
        svg.appendChild(svgEl(doc, 'path', {d: `${outer} ${inner}`, fill: options.background ?? '#ffffff', 'fill-rule': 'evenodd'}));
    }

    const frame = (r: Rect, grow: number) => svg.appendChild(svgEl(doc, 'rect', {
        x: r.left - grow, y: r.top - grow, width: r.right - r.left + (2 * grow), height: r.bottom - r.top + (2 * grow),
        fill: 'none', stroke: RED, 'stroke-width': 2
    }));
    (options.frames ?? []).forEach(selector => frame(rectOf(selector), 4));

    const labels: {rect: Rect, label: string}[] = [];
    (options.callouts ?? []).forEach(callout => {
        const target = rectOf(callout.target, callout.index);
        const grow = callout.box ? (callout.boxPad ?? 4) : 0;
        if (callout.box) {
            frame(target, grow);
        }

        // The label, measured before it is placed
        const lines = callout.label.split('\n');
        const fontSize = 17;
        const lineHeight = 21;
        const text = svgEl(doc, 'text', {
            fill: RED, 'font-family': 'Helvetica, Arial, sans-serif', 'font-size': fontSize, 'text-anchor': 'middle'
        });
        lines.forEach((line, i) => {
            const tspan = svgEl(doc, 'tspan', {x: 0, dy: i === 0 ? 0 : lineHeight});
            tspan.textContent = line;
            text.appendChild(tspan);
        });
        svg.appendChild(text);
        const width = Math.ceil(Math.max(...Array.from(text.querySelectorAll('tspan')).map(t => (t as SVGTSpanElement).getComputedTextLength())));
        const height = lines.length * lineHeight;

        const distance = callout.distance ?? 46;
        const shift = callout.shift ?? 0;
        const cx = (target.left + target.right) / 2;
        const cy = (target.top + target.bottom) / 2;
        let rect: Rect;
        if (callout.side === 'bottom') {
            rect = {left: cx + shift - (width / 2), top: subject.bottom + distance, right: 0, bottom: 0};
        } else if (callout.side === 'top') {
            rect = {left: cx + shift - (width / 2), top: subject.top - distance - height, right: 0, bottom: 0};
        } else if (callout.side === 'left') {
            rect = {left: subject.left - distance - width, top: cy + shift - (height / 2), right: 0, bottom: 0};
        } else {
            rect = {left: subject.right + distance, top: cy + shift - (height / 2), right: 0, bottom: 0};
        }

        rect.right = rect.left + width;
        rect.bottom = rect.top + height;
        text.setAttribute('transform', `translate(${rect.left + (width / 2)}, ${rect.top + fontSize - 1})`);

        const guard = {left: rect.left - 4, top: rect.top - 2, right: rect.right + 4, bottom: rect.bottom + 2};
        if (guard.left < capture.left || guard.top < capture.top || guard.right > capture.right || guard.bottom > capture.bottom) {
            fail(name, `the label "${callout.label}" leaves the capture: widen the ${callout.side} margin or change its shift`);
        }

        if (intersects(guard, subject)) {
            fail(name, `the label "${callout.label}" covers the subject`);
        }

        labels.forEach(other => {
            if (intersects(guard, other.rect)) {
                fail(name, `the labels "${callout.label}" and "${other.label}" overlap`);
            }
        });
        labels.push({rect: guard, label: callout.label});

        if (callout.noArrow) {
            return;
        }

        // The arrow: from the edge of the label that faces the target, to the target
        const defaults: Record<Side, [number, number]> = {bottom: [0.5, 1], top: [0.5, 0], left: [0, 0.5], right: [1, 0.5]};
        const at = callout.at ?? defaults[callout.side];
        const gap = 5;
        const tip = {
            x: target.left + (at[0] * (target.right - target.left)),
            y: target.top + (at[1] * (target.bottom - target.top))
        };
        const start = {x: rect.left + (width / 2), y: rect.top + (height / 2)};
        if (callout.side === 'bottom') {
            start.y = rect.top - gap;
            tip.y += callout.at ? 0 : grow + gap;
        } else if (callout.side === 'top') {
            start.y = rect.bottom + gap;
            tip.y -= callout.at ? 0 : grow + gap;
        } else if (callout.side === 'left') {
            start.x = rect.right + gap + 2;
            tip.x -= callout.at ? 0 : grow + gap;
        } else {
            start.x = rect.left - gap - 2;
            tip.x += callout.at ? 0 : grow + gap;
        }

        svg.appendChild(svgEl(doc, 'line', {
            x1: start.x, y1: start.y, x2: tip.x, y2: tip.y, stroke: RED, 'stroke-width': 2.5, 'stroke-linecap': 'round',
            'marker-end': 'url(#docs-arrowhead)'
        }));
    });

    return {x: capture.left, y: capture.top, width: capture.right - capture.left, height: capture.bottom - capture.top};
};

/**
 * Captures a region of the page to results/screenshots/…/docs/<name>.png: annotated when the
 * options hold callouts, plain otherwise.
 */
export const docShot = (name: string, options: ShotOptions) => {
    // Lets transitions (dropdown, modal, collapse) end before measuring
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(600);
    cy.document({log: false}).then(doc => annotate(doc, name, options)).then(clip => {
        cy.screenshot(`docs/${name}`, {capture: 'viewport', clip, overwrite: true, scale: false, log: true});
    });
    clearAnnotations();
};

/** A plain capture: the subject and `pad` pixels around it. */
export const plainShot = (name: string, subject: string | string[], pad: number | Partial<Box> = 12) =>
    docShot(name, {subject, pad});

/** A plain capture of a rectangle of the viewport (the top of a page, for instance). */
export const regionShot = (name: string, region: {x: number, y: number, width: number, height: number}) => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(600);
    cy.screenshot(`docs/${name}`, {capture: 'viewport', clip: region, overwrite: true, scale: false});
};

// ─── Content helpers ────────────────────────────────────────────────────────

type Property = {name: string, value?: string, values?: string[], language?: string, type?: string}
type Child = {name: string, primaryNodeType: string, properties?: Property[], mixins?: string[], children?: Child[]}

/** Adds a node anywhere in the edit workspace. */
export const addNode = (parentPathOrId: string, name: string, primaryNodeType: string, properties: Property[] = [], mixins: string[] = [], children: Child[] = []) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/addNode.graphql',
        variables: {parentPathOrId, name, primaryNodeType, properties, mixins, children}
    });
};

/** A rich text. */
export const addText = (parent: string, name: string, html: string, extra: Property[] = [], mixins: string[] = []) =>
    addNode(parent, name, 'bootstrap5nt:text', [{name: 'text', value: html, language: 'en'}, ...extra], mixins);

/** A page of the starter template, with its main area, titled in English and optionally in French. */
export const addPage = (parent: string, name: string, title: string, titleFr?: string) => {
    const properties: Property[] = [
        {name: 'jcr:title', value: title, language: 'en'},
        {name: 'j:templateName', value: 'starter'}
    ];
    if (titleFr) {
        properties.push({name: 'jcr:title', value: titleFr, language: 'fr'});
    }

    addNode(parent, name, 'jnt:page', properties, [], [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}]);
};

export const setProperties = (pathOrId: string, properties: Property[]) => {
    cy.apollo({mutationFile: 'graphql/jcr/mutation/mutateNode.graphql', variables: {pathOrId, properties}});
};

export const publish = (pathOrId: string, languages: string[] = ['en']) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/publishNode.graphql',
        variables: {pathOrId, languages, publishSubNodes: true, includeSubTree: true}
    });
};

/** Uploads a fixture image to the files of the docs site and yields its identifier. */
export const uploadImage = (fileName: string, site = docsSite): Cypress.Chainable<string> => {
    cy.fixture(`images/${fileName}`, 'binary').then((image: string) => {
        const blob = Cypress.Blob.binaryStringToBlob(image, 'image/png');
        const file = new File([blob], fileName, {type: blob.type});
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/uploadFile.graphql',
            variables: {parentPathOrId: `/sites/${site}/files`, name: fileName, mimeType: 'image/png', file}
        });
    });
    return getNodeByPath(`/sites/${site}/files/${fileName}`).its('data.jcr.nodeByPath.uuid') as Cypress.Chainable<string>;
};

export const uuidOf = (path: string): Cypress.Chainable<string> =>
    getNodeByPath(path).its('data.jcr.nodeByPath.uuid') as Cypress.Chainable<string>;

/** Opens the jContent content editor on a node, full screen. */
export const openContentEditor = (nodePath: string, pagePath = 'home', site = docsSite) => {
    uuidOf(nodePath).then(uuid => {
        cy.visit(`/jahia/jcontent/${site}/en/pages/${pagePath}#(contentEditor:!((formKey:modal_0,isFullscreen:!t,lang:en,mode:edit,site:${site},uilang:en,uuid:'${uuid}')))`);
    });
};
