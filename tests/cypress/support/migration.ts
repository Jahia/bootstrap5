// Shared by the two migration specs: the pages a 2.x site is made of, and the picture taken of
// each of them, first rendered by 2.x, then by 3.x on the same repository.

export const migrationSite = 'bootstrap5migration'
export const migrationHome = `/sites/${migrationSite}/home`
export const baselineFile = 'results/migration-baseline.json'

const live = (path: string, query = '') => `/cms/render/live/en${path}.html${query}`

/** Pages compared, by name. */
export const migrationPages: Record<string, string> = {
    components: live(`${migrationHome}/mig-components`),
    layout: live(`${migrationHome}/mig-layout`),
    deep: live(`${migrationHome}/mig-section/mig-sub`)
}

/** Structures counted on every page: a difference means a component lost or gained markup. */
const countedSelectors = [
    'nav.navbar', 'nav.navbar .navbar-brand', 'nav.navbar a.nav-link', 'nav.navbar .dropdown-menu',
    'nav.navbar .dropdown-item', 'nav.navbar li.dropend',
    'ol.breadcrumb', 'ol.breadcrumb .breadcrumb-item', 'ol.breadcrumb .breadcrumb-item a',
    '.accordion', '.accordion-item', '.accordion-collapse.show', '.accordion-button.collapsed',
    'ul.nav[role="tablist"]', 'ul.nav[role="tablist"] .nav-link', '.tab-content > .tab-pane', '.tab-pane.active',
    '.carousel', '.carousel-item', '.carousel-item.active', '.carousel-indicators button', '.carousel-caption',
    '.carousel-control-prev', '.carousel-control-next',
    '.card', '.card-header', '.card-body', '.card-footer', '.card img',
    'figure.figure', 'figure.figure img', '.figure-caption',
    '.modal', '.modal .modal-title', '.collapse', '.offcanvas', '[data-bs-toggle="popover"]',
    '[data-bs-toggle="modal"]', '[data-bs-toggle="collapse"]', '[data-bs-toggle="offcanvas"]',
    '.alert', '.alert .btn-close',
    'ul.pagination', 'ul.pagination .page-item', 'ul.pagination .page-item.active',
    '.container', '.row', '.col', '[class*="col-md-"]', 'section', 'img', 'a.btn', 'button.btn'
]

/** Containers a piece of content is expected to stay in. */
const containerSelector = [
    '.accordion-body', '.tab-pane', '.card-body', '.card-footer', '.card-header', '.modal-body', '.collapse',
    '.offcanvas-body', '.alert', '.carousel-caption', '.figure-caption', '[class*="col-"]', '.col', 'section'
].join(', ')

const tokens = (element: Element | null) =>
    element ? Array.from(element.classList).filter(token => !token.startsWith('mig-')).sort().join(' ') : ''

export interface PageSnapshot {
    /** For every content marker (a class starting with "mig-"): its text and the container it is in */
    markers: Record<string, {text: string; container: string}>;
    counts: Record<string, number>;
    title: string;
}

/**
 * The picture of a page: where each marked piece of content is, and how many of each structure the
 * page holds. Every piece of test content carries a unique "mig-…" class.
 */
export const takeSnapshot = (doc: Document): PageSnapshot => {
    const markers: PageSnapshot['markers'] = {}
    doc.querySelectorAll('[class*="mig-"]').forEach(element => {
        Array.from(element.classList).filter(token => token.startsWith('mig-')).forEach(marker => {
            const container = element.parentElement ? element.parentElement.closest(containerSelector) : null
            markers[marker] = {
                text: (element.textContent || '').replace(/\s+/g, ' ').trim(),
                container: container ? `${container.tagName.toLowerCase()}|${tokens(container)}` : ''
            }
        })
    })
    const counts: Record<string, number> = {}
    countedSelectors.forEach(selector => {
        counts[selector] = doc.querySelectorAll(selector).length
    })
    return {markers, counts, title: doc.title}
}
