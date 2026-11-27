import {createSite, deleteSite} from '@jahia/cypress';
import {
    addNode, addPage, addText, docsRtlSite, docsSite, home, publish, setProperties, sitePath, uploadImage, uuidOf
} from '../support/docs';

/**
 * The site the documentation screenshots are taken on: "Alpine Trails", a mountain guides company.
 *   - /home and the pages below it are the site a visitor sees: navbar, three levels of pages,
 *     two languages;
 *   - /components holds one page per image, showing one component in its documented variants.
 *     It is a sibling of the home page, so it has no header and is not listed in the navbar.
 * Run before the other specs of cypress/docs; 99-teardown deletes both sites.
 */
const demo = `${sitePath}/components`;
const lorem = {
    intro: 'Guided hikes and alpine crossings in small groups, led by certified mountain guides.',
    montBlanc: 'Seven days around the highest summit of the Alps, through France, Italy and Switzerland, from one mountain hut to the next.',
    haute: 'The classic crossing from Chamonix to Zermatt: glaciers, high passes and a view of the Matterhorn to end with.',
    dolomites: 'A week of balcony trails under the pale towers of the Dolomites, with nights in family-run refuges.'
};

/** Polls a live page until it is served and holds the given text. */
const waitForLive = (url: string, text: string, attempts = 30) => {
    cy.request({url, failOnStatusCode: false}).then(response => {
        if (response.status === 200 && String(response.body).includes(text)) {
            return;
        }

        if (attempts <= 0) {
            throw new Error(`${url} is not live (status ${response.status})`);
        }

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000);
        waitForLive(url, text, attempts - 1);
    });
};

/** A demo page under /components, and the path of its main area. */
const demoPage = (name: string, title: string): string => {
    addPage(demo, name, title);
    return `${demo}/${name}/pagecontent`;
};

const linkButton = (parent: string, name: string, title: string, properties: object[] = []) =>
    addNode(parent, name, 'bootstrap5nt:button', [
        {name: 'jcr:title', value: title, language: 'en'},
        {name: 'buttonType', value: 'externalLink'},
        {name: 'externalLink', value: 'https://www.example.com/booking'},
        {name: 'cssClass', value: 'me-2 mb-2'},
        ...properties as []
    ], ['bootstrap5mix:externalLink', 'bootstrap5mix:buttonAdvancedSettings']);

describe('Documentation screenshots: demo site', () => {
    const images: Record<string, string> = {};

    before(() => {
        cy.login();
        deleteSite(docsSite);
        deleteSite(docsRtlSite);
        createSite(docsSite, {templateSet: 'bootstrap5-templates-starter', serverName: 'localhost', locale: 'en', languages: 'en,fr'});
        for (const file of ['docs-slide-1.png', 'docs-slide-2.png', 'docs-slide-3.png', 'docs-card.png', 'docs-card-2.png', 'docs-card-3.png', 'docs-figure.png', 'docs-square.png', 'docs-wide.png']) {
            uploadImage(file).then(uuid => {
                images[file] = uuid;
            });
        }
    });

    it('the site visitors see: navbar, page tree, home page', () => {
        cy.login();
        setProperties(home, [{name: 'jcr:title', value: 'Accueil', language: 'fr'}]);
        addPage(home, 'destinations', 'Destinations', 'Destinations');
        addPage(`${home}/destinations`, 'alps', 'The Alps', 'Les Alpes');
        addPage(`${home}/destinations/alps`, 'chamonix', 'Chamonix', 'Chamonix');
        addPage(`${home}/destinations/alps`, 'zermatt', 'Zermatt', 'Zermatt');
        addPage(`${home}/destinations`, 'pyrenees', 'The Pyrenees', 'Les Pyrénées');
        addPage(`${home}/destinations`, 'dolomites', 'The Dolomites', 'Les Dolomites');
        addPage(home, 'guides', 'Our guides', 'Nos guides');
        addPage(home, 'about', 'About us', 'À propos');

        // The header is shared by every page below the home page
        addNode(home, 'header', 'jnt:contentList');
        addNode(`${home}/header`, 'navbar', 'bootstrap5nt:navbar', [
            {name: 'root', value: 'homePage'},
            {name: 'maxlevel', value: '3'},
            {name: 'addLoginButton', value: 'true', type: 'BOOLEAN'},
            {name: 'addLanguageButton', value: 'true', type: 'BOOLEAN'},
            {name: 'addColorModeButton', value: 'true', type: 'BOOLEAN'},
            {name: 'addContainerWithinTheNavbar', value: 'true', type: 'BOOLEAN'},
            {name: 'brandText', value: 'Alpine Trails', language: 'en'},
            {name: 'brandText', value: 'Alpine Trails', language: 'fr'}
        ], ['bootstrap5mix:navbarGlobalSettings', 'bootstrap5mix:brand']);

        // Home page: introduction, three trips, a progress bar and an alert (also the colour mode images)
        addNode(home, 'pagecontent', 'jnt:contentList');
        addNode(`${home}/pagecontent`, 'intro', 'bootstrap5nt:grid', [{name: 'containerType', value: 'container'}, {name: 'containerCssClass', value: 'py-4'}], ['bootstrap5mix:createContainer']);
        addNode(`${home}/pagecontent/intro`, 'main', 'jnt:contentList');
        addText(`${home}/pagecontent/intro/main`, 'title', `<h1>Walk the Alps with a guide</h1><p class="lead">${lorem.intro}</p>`, [{name: 'text', value: '<h1>Les Alpes à pied, avec un guide</h1><p class="lead">Randonnées et traversées alpines en petits groupes, encadrées par des guides de haute montagne.</p>', language: 'fr'}]);
        linkButton(`${home}/pagecontent/intro/main`, 'book', 'Book a trip');
        linkButton(`${home}/pagecontent/intro/main`, 'catalogue', 'Download the catalogue', [{name: 'style', value: 'secondary'}, {name: 'outline', value: 'true', type: 'BOOLEAN'}]);

        addNode(`${home}/pagecontent`, 'trips', 'bootstrap5nt:grid', [
            {name: 'containerType', value: 'container'}, {name: 'typeOfGrid', value: 'predefinedGrid'}, {name: 'grid', value: '4_4_4'}
        ], ['bootstrap5mix:createContainer', 'bootstrap5mix:createRow', 'bootstrap5mix:predefinedGrid']);
        cy.then(() => {
            const trips: [string, string, string, string, string][] = [
                ['main', 'Tour du Mont Blanc', lorem.montBlanc, '7 days · from € 1,250', 'docs-card.png'],
                ['side', 'Haute Route', lorem.haute, '8 days · from € 1,890', 'docs-card-2.png'],
                ['extra', 'Alta Via 1', lorem.dolomites, '6 days · from € 1,090', 'docs-card-3.png']
            ];
            trips.forEach(([area, title, text, footer, file]) => {
                addNode(`${home}/pagecontent/trips`, area, 'jnt:contentList');
                addNode(`${home}/pagecontent/trips/${area}`, 'card', 'bootstrap5nt:card', [
                    {name: 'jcr:title', value: title, language: 'en'},
                    {name: 'footer', value: footer, language: 'en'},
                    {name: 'image', value: images[file], type: 'WEAKREFERENCE'}
                ]);
                addText(`${home}/pagecontent/trips/${area}/card`, 'text', `<p>${text}</p>`);
            });
        });
        addNode(`${home}/pagecontent`, 'season', 'bootstrap5nt:grid', [{name: 'containerType', value: 'container'}, {name: 'containerCssClass', value: 'py-4'}], ['bootstrap5mix:createContainer']);
        addNode(`${home}/pagecontent/season`, 'main', 'jnt:contentList');
        addText(`${home}/pagecontent/season/main`, 'note', '<p class="mb-0"><strong>Summer season.</strong> The high passes are open from mid-June to the end of September.</p>', [
            {name: 'j:skin', value: 'skins.alert'}, {name: 'backgroundColor', value: 'info'}
        ], ['jmix:skinnable', 'bootstrap5mix:alert']);
        addText(`${home}/pagecontent/season/main`, 'filling', '<p class="mb-1">Places booked for the summer departures</p>');
        addNode(`${home}/pagecontent/season/main`, 'booked', 'bootstrap5nt:progress', [
            {name: 'label', value: 'Places booked for the summer departures', language: 'en'},
            {name: 'value', value: '65', type: 'LONG'},
            {name: 'showValue', value: 'true', type: 'BOOLEAN'}
        ]);

        // A page of the third level: breadcrumb
        addNode(`${home}/destinations/alps/chamonix/pagecontent`, 'page', 'bootstrap5nt:grid', [{name: 'containerType', value: 'container'}, {name: 'containerCssClass', value: 'py-3'}], ['bootstrap5mix:createContainer']);
        addNode(`${home}/destinations/alps/chamonix/pagecontent/page`, 'main', 'jnt:contentList');
        addNode(`${home}/destinations/alps/chamonix/pagecontent/page/main`, 'breadcrumb', 'bootstrap5nt:breadcrumb');
        addText(`${home}/destinations/alps/chamonix/pagecontent/page/main`, 'text', '<h1 class="clearfix">Chamonix</h1><p>At the foot of Mont Blanc, the valley of Chamonix is where most of our alpine trips start.</p>');
    });

    it('one page per component', () => {
        cy.login();
        addPage(sitePath, 'components', 'Components');
        let content: string;

        // Accordion: default and flush
        content = demoPage('accordion', 'Accordion');
        const faq: [string, string][] = [
            ['How fit do I need to be?', 'Our trips are graded from 1 to 5. A grade 3 trip means five to seven hours of walking a day, with up to 1,000 metres of ascent, on good mountain paths. If you walk regularly, you will be fine.'],
            ['What is included in the price?', 'The guide, half board in mountain huts, and luggage transfers where the route allows it.'],
            ['Can I join on my own?', 'Yes. Most of our guests travel alone and groups are limited to eight people.']
        ];
        for (const [name, flush] of [['default', 'false'], ['flush', 'true']]) {
            addNode(content, name, 'bootstrap5nt:accordions', [{name: 'flush', value: flush, type: 'BOOLEAN'}]);
            faq.forEach(([question, answer], i) => {
                addNode(`${content}/${name}`, `item-${i + 1}`, 'bootstrap5nt:accordion', [
                    {name: 'jcr:title', value: question, language: 'en'},
                    {name: 'text', value: `<p>${answer}</p>`, language: 'en'},
                    {name: 'show', value: i === 0 ? 'true' : 'false', type: 'BOOLEAN'}
                ]);
            });
        }

        // Buttons
        content = demoPage('button-style', 'Button styles');
        for (const style of ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'dark', 'light', 'link']) {
            linkButton(content, style, style.charAt(0).toUpperCase() + style.slice(1), [{name: 'style', value: style}]);
        }

        content = demoPage('button-outline', 'Outline buttons');
        for (const style of ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'dark', 'light']) {
            linkButton(content, style, style.charAt(0).toUpperCase() + style.slice(1), [{name: 'style', value: style}, {name: 'outline', value: 'true', type: 'BOOLEAN'}]);
        }

        content = demoPage('button-size', 'Button sizes');
        linkButton(content, 'small', 'Small', [{name: 'size', value: 'btn-sm'}]);
        linkButton(content, 'default', 'Default');
        linkButton(content, 'large', 'Large', [{name: 'size', value: 'btn-lg'}]);

        content = demoPage('button-block', 'Block button');
        linkButton(content, 'default', 'Default');
        linkButton(content, 'block', 'Full width button', [{name: 'block', value: 'true', type: 'BOOLEAN'}]);

        content = demoPage('button-state', 'Button states');
        linkButton(content, 'default', 'Default');
        linkButton(content, 'active', 'Active', [{name: 'state', value: 'active'}]);
        linkButton(content, 'disabled', 'Disabled', [{name: 'state', value: 'disabled'}]);

        content = demoPage('button-group', 'Button group');
        addNode(content, 'group', 'bootstrap5nt:buttonGroup', [{name: 'jcr:title', value: 'Season', language: 'en'}]);
        for (const [name, title] of [['summer', 'Summer'], ['winter', 'Winter'], ['all', 'All year']]) {
            addNode(`${content}/group`, name, 'bootstrap5nt:button', [
                {name: 'jcr:title', value: title, language: 'en'},
                {name: 'buttonType', value: 'externalLink'},
                {name: 'externalLink', value: 'https://www.example.com/trips'},
                {name: 'style', value: 'primary'},
                {name: 'outline', value: name === 'summer' ? 'false' : 'true', type: 'BOOLEAN'}
            ], ['bootstrap5mix:externalLink', 'bootstrap5mix:buttonAdvancedSettings']);
        }

        content = demoPage('tooltip', 'Tooltip');
        linkButton(content, 'book', 'Book a guide', [
            {name: 'tooltip', value: 'Opens the booking form in a new page', language: 'en'}, {name: 'tooltipPlacement', value: 'top'}
        ]);

        content = demoPage('modal', 'Modal');
        addNode(content, 'button', 'bootstrap5nt:button', [
            {name: 'jcr:title', value: 'Trip details', language: 'en'},
            {name: 'buttonType', value: 'modal'},
            {name: 'modalTitle', value: 'Tour du Mont Blanc', language: 'en'},
            {name: 'closeText', value: 'Close', language: 'en'}
        ], ['bootstrap5mix:modal']);
        addText(`${content}/button`, 'text', `<p class="mb-0">${lorem.montBlanc}</p>`);

        content = demoPage('popover', 'Popover');
        addNode(content, 'button', 'bootstrap5nt:button', [
            {name: 'jcr:title', value: 'What does grade 3 mean?', language: 'en'},
            {name: 'buttonType', value: 'popover'},
            {name: 'popoverTitle', value: 'Grade 3: moderate', language: 'en'},
            {name: 'popoverContent', value: 'Five to seven hours of walking a day, up to 1,000 m of ascent.', language: 'en'},
            {name: 'direction', value: 'right'},
            {name: 'style', value: 'danger'}
        ], ['bootstrap5mix:popover', 'bootstrap5mix:buttonAdvancedSettings']);

        content = demoPage('offcanvas', 'Offcanvas');
        addNode(content, 'page', 'bootstrap5nt:grid', [{name: 'containerType', value: 'container'}, {name: 'containerCssClass', value: 'py-4'}], ['bootstrap5mix:createContainer']);
        addNode(`${content}/page`, 'main', 'jnt:contentList');
        addText(`${content}/page/main`, 'text', `<h1>Tour du Mont Blanc</h1><p>${lorem.montBlanc}</p>`);
        addNode(`${content}/page/main`, 'button', 'bootstrap5nt:button', [
            {name: 'jcr:title', value: 'Practical information', language: 'en'},
            {name: 'buttonType', value: 'Offcanvas'},
            {name: 'OffcanvasTitle', value: 'Practical information', language: 'en'},
            {name: 'placement', value: 'end'},
            {name: 'enableBackdrop', value: 'true', type: 'BOOLEAN'}
        ], ['bootstrap5mix:Offcanvas']);
        addText(`${content}/page/main/button`, 'text', '<p><strong>Meeting point:</strong> Chamonix railway station, Sunday at 5 pm.</p><p><strong>Luggage:</strong> one bag of 12 kg, carried from hut to hut.</p><p><strong>Group:</strong> 4 to 8 people.</p>');

        // Card
        const cardPage = demoPage('card', 'Card');
        cy.then(() => {
            addNode(cardPage, 'card', 'bootstrap5nt:card', [
                {name: 'jcr:title', value: 'Tour du Mont Blanc', language: 'en'},
                {name: 'footer', value: '7 days · from € 1,250', language: 'en'},
                {name: 'image', value: images['docs-card.png'], type: 'WEAKREFERENCE'}
            ]);
            addText(`${demo}/card/pagecontent/card`, 'text', `<p>${lorem.montBlanc}</p>`);
            addNode(`${demo}/card/pagecontent/card`, 'button', 'bootstrap5nt:button', [
                {name: 'jcr:title', value: 'See the itinerary', language: 'en'},
                {name: 'buttonType', value: 'externalLink'},
                {name: 'externalLink', value: 'https://www.example.com/tmb'}
            ], ['bootstrap5mix:externalLink']);
        });

        // Carousel: without and with indicators and controls
        const slides: [string, string, string][] = [
            ['Tour du Mont Blanc', 'Seven days around the roof of the Alps.', 'docs-slide-1.png'],
            ['Haute Route', 'From Chamonix to Zermatt, on foot.', 'docs-slide-2.png'],
            ['Alta Via 1', 'The balcony trail of the Dolomites.', 'docs-slide-3.png']
        ];
        for (const [page, on] of [['carousel', 'false'], ['carousel-controls', 'true']]) {
            const parent = demoPage(page, 'Carousel');
            addNode(parent, 'carousel', 'bootstrap5nt:carousel', [
                {name: 'useIndicators', value: on, type: 'BOOLEAN'},
                {name: 'useLeftAndRightControls', value: on, type: 'BOOLEAN'},
                {name: 'ride', value: 'false', type: 'BOOLEAN'},
                {name: 'fade', value: 'false', type: 'BOOLEAN'}
            ], ['bootstrap5mix:carouselAdvancedSettings']);
            cy.then(() => {
                slides.forEach(([title, caption, file], i) => {
                    addNode(`${parent}/carousel`, `slide-${i + 1}`, 'bootstrap5nt:carouselItem', [
                        {name: 'jcr:title', value: title, language: 'en'},
                        {name: 'caption', value: caption, language: 'en'},
                        {name: 'image', value: images[file], type: 'WEAKREFERENCE'}
                    ]);
                });
            });
        }

        // Figure and image options
        cy.then(() => {
            const figure = (parent: string, name: string, file: string, properties: object[], title?: string) =>
                addNode(parent, name, 'bootstrap5nt:figure', [
                    {name: 'image', value: images[file], type: 'WEAKREFERENCE'},
                    ...(title ? [{name: 'jcr:title', value: title, language: 'en'}] : []),
                    ...properties as []
                ], properties.length > 0 ? ['bootstrap5mix:imageAdvancedSettings'] : []);

            figure(demoPage('figure', 'Figure'), 'figure', 'docs-figure.png', [
                {name: 'responsive', value: 'true', type: 'BOOLEAN'},
                {name: 'imageStyle', value: 'width: 400px'},
                {name: 'alt', value: 'Mountain ridges at sunrise', language: 'en'}
            ], 'The Aiguilles Rouges seen from the Lac Blanc.');
            figure(demoPage('image-thumbnail', 'Thumbnail'), 'figure', 'docs-wide.png', [
                {name: 'thumbnails', value: 'true', type: 'BOOLEAN'},
                {name: 'responsive', value: 'true', type: 'BOOLEAN'},
                {name: 'imageStyle', value: 'width: 200px'}
            ]);

            const shapes = demoPage('border-radius', 'Border radius');
            for (const shape of ['rounded', 'rounded-top', 'rounded-end', 'rounded-bottom', 'rounded-start', 'rounded-circle', 'rounded-pill']) {
                figure(shapes, shape, shape === 'rounded-pill' ? 'docs-wide.png' : 'docs-square.png', [
                    {name: 'borderRadius', value: shape},
                    {name: 'responsive', value: 'true', type: 'BOOLEAN'},
                    {name: 'imageStyle', value: shape === 'rounded-pill' ? 'width: 150px' : 'width: 75px'},
                    {name: 'imageClass', value: 'me-2'}
                ]);
            }

            const sizes = demoPage('border-radius-size', 'Border radius sizes');
            for (const size of ['rounded-1', 'rounded-2', 'rounded-3', 'rounded-4', 'rounded-5']) {
                figure(sizes, size, 'docs-square.png', [
                    {name: 'borderRadius', value: 'rounded'},
                    {name: 'borderRadiusSize', value: size},
                    {name: 'responsive', value: 'true', type: 'BOOLEAN'},
                    {name: 'imageStyle', value: 'width: 75px'},
                    {name: 'imageClass', value: 'me-2'}
                ]);
            }
        });

        // Pagination: a first pager, hidden, before the list; the visible one after it
        const pagedList = (parent: string) => {
            addNode(parent, 'pagination', 'bootstrap5nt:pagination', [
                {name: 'displayPager', value: 'false', type: 'BOOLEAN'},
                {name: 'pageSize', value: '2', type: 'LONG'},
                {name: 'nbOfPages', value: '10', type: 'LONG'},
                {name: 'nbOfPagesInEdit', value: '100', type: 'LONG'}
            ], ['bootstrap5mix:advancedPagination']);
            addNode(parent, 'departures', 'jnt:contentList');
            const departures = ['15 June: Tour du Mont Blanc', '22 June: Haute Route', '29 June: Alta Via 1', '6 July: Tour du Mont Blanc', '13 July: Tour of Monte Rosa', '20 July: Haute Route', '27 July: Alta Via 1'];
            departures.forEach((departure, i) => addText(`${parent}/departures`, `departure-${i + 1}`, `<p>${departure}</p>`));
        };

        const pager = (parent: string, name: string, layout: string) => {
            addNode(parent, name, 'bootstrap5nt:pagination', [
                {name: 'displayPager', value: 'true', type: 'BOOLEAN'},
                {name: 'pageSize', value: '2', type: 'LONG'},
                {name: 'nbOfPages', value: '10', type: 'LONG'},
                {name: 'nbOfPagesInEdit', value: '100', type: 'LONG'},
                {name: 'layout', value: layout},
                {name: 'align', value: 'justify-content-start'}
            ], ['bootstrap5mix:advancedPagination']);
        };

        const bind = (parent: string, names: string[]) => {
            uuidOf(`${parent}/departures`).then(list => {
                names.forEach(name => setProperties(`${parent}/${name}`, [{name: 'j:bindedComponent', value: list, type: 'WEAKREFERENCE'}]));
            });
        };

        content = demoPage('pagination', 'Pagination');
        pagedList(content);
        pager(content, 'pagination-1', 'default');
        bind(content, ['pagination', 'pagination-1']);

        content = demoPage('pagination-size', 'Pagination sizes');
        pagedList(content);
        pager(content, 'large', 'pagination-lg');
        pager(content, 'default', 'default');
        pager(content, 'small', 'pagination-sm');
        bind(content, ['pagination', 'large', 'default', 'small']);

        // Tabs
        content = demoPage('tabs', 'Tabs');
        addNode(content, 'tabs', 'bootstrap5nt:tabs', [
            {name: 'type', value: 'tab'}, {name: 'fade', value: 'true', type: 'BOOLEAN'}, {name: 'useListNameAsAnchor', value: 'true', type: 'BOOLEAN'}
        ], [], [
            {name: 'itinerary', primaryNodeType: 'jnt:contentList', properties: [{name: 'jcr:title', value: 'Itinerary', language: 'en'}]},
            {name: 'equipment', primaryNodeType: 'jnt:contentList', properties: [{name: 'jcr:title', value: 'Equipment', language: 'en'}]},
            {name: 'dates-and-prices', primaryNodeType: 'jnt:contentList', properties: [{name: 'jcr:title', value: 'Dates and prices', language: 'en'}]}
        ]);
        addText(`${content}/tabs/itinerary`, 'text', '<p class="mt-3">Day 1: Les Houches to Les Contamines, over the Col de Voza. Day 2: up to the Col du Bonhomme and down to Les Chapieux.</p>');
        addText(`${content}/tabs/equipment`, 'text', '<p class="mt-3">Walking boots, waterproof jacket, a 30-litre rucksack and a sheet sleeping bag for the huts.</p>');
        addText(`${content}/tabs/dates-and-prices`, 'text', '<p class="mt-3">Departures every Sunday from 15 June to 14 September, from € 1,250 per person.</p>');

        // Text
        content = demoPage('text', 'Text');
        addText(content, 'text', `<h2>Tour du Mont Blanc</h2><p class="lead">${lorem.intro}</p><p>${lorem.montBlanc}</p>`);

        // Progress bars: plain, striped, with the value shown
        content = demoPage('progress', 'Progress');
        addNode(content, 'plain', 'bootstrap5nt:progress', [{name: 'label', value: 'Places booked', language: 'en'}, {name: 'value', value: '40', type: 'LONG'}]);
        addText(content, 'gap-1', '<p class="mb-3"></p>');
        addNode(content, 'striped', 'bootstrap5nt:progress', [
            {name: 'label', value: 'Route open', language: 'en'},
            {name: 'value', value: '65', type: 'LONG'},
            {name: 'color', value: 'success'},
            {name: 'striped', value: 'true', type: 'BOOLEAN'}
        ]);
        addText(content, 'gap-2', '<p class="mb-3"></p>');
        addNode(content, 'value', 'bootstrap5nt:progress', [
            {name: 'label', value: 'Funds raised', language: 'en'},
            {name: 'value', value: '30', type: 'LONG'},
            {name: 'max', value: '120', type: 'LONG'},
            {name: 'color', value: 'warning'},
            {name: 'showValue', value: 'true', type: 'BOOLEAN'}
        ]);

        // Alert skin
        content = demoPage('alert', 'Alert');
        const alerts: [string, string, string][] = [
            ['primary', 'Booking for next summer opens on 1 December.', 'false'],
            ['success', 'Your place on the Tour du Mont Blanc is confirmed.', 'false'],
            ['warning', 'The Col du Bonhomme is still under snow: crampons required.', 'false'],
            ['danger', 'The Bovine path is closed after a rockfall.', 'true']
        ];
        alerts.forEach(([color, text, dismiss]) => {
            addText(content, color, `<p class="mb-0">${text}</p>`, [
                {name: 'j:skin', value: 'skins.alert'},
                {name: 'backgroundColor', value: color},
                {name: 'addDismissButton', value: dismiss, type: 'BOOLEAN'}
            ], ['jmix:skinnable', 'bootstrap5mix:alert']);
        });

        // Grid: two columns, the second one empty, three items at most per column
        content = demoPage('grid', 'Grid');
        addNode(content, 'grid', 'bootstrap5nt:grid', [
            {name: 'typeOfGrid', value: 'predefinedGrid'}, {name: 'grid', value: '8_4'}, {name: 'listLimit', value: '3'}
        ], ['bootstrap5mix:createRow', 'bootstrap5mix:predefinedGrid', 'bootstrap5mix:listLimit']);
        addNode(`${content}/grid`, 'main', 'jnt:contentList');
        addText(`${content}/grid/main`, 'text', `<p>${lorem.montBlanc}</p>`);
        // A grid as it is created, before any option is switched on (content editor image)
        addNode(content, 'new-grid', 'bootstrap5nt:grid');
    });

    it('a right-to-left site', () => {
        cy.login();
        const rtlHome = `/sites/${docsRtlSite}/home`;
        createSite(docsRtlSite, {templateSet: 'bootstrap5-templates-starter', serverName: 'localhost', locale: 'ar', languages: 'ar,en'});
        setProperties(rtlHome, [{name: 'jcr:title', value: 'الرئيسية', language: 'ar'}]);
        const page = (name: string, title: string) => addNode(rtlHome, name, 'jnt:page', [
            {name: 'jcr:title', value: title, language: 'ar'}, {name: 'jcr:title', value: name, language: 'en'}, {name: 'j:templateName', value: 'starter'}
        ], [], [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}]);
        page('destinations', 'الوجهات');
        page('guides', 'المرشدون');
        page('about', 'من نحن');
        addNode(rtlHome, 'header', 'jnt:contentList');
        addNode(`${rtlHome}/header`, 'navbar', 'bootstrap5nt:navbar', [
            {name: 'root', value: 'homePage'},
            {name: 'brandText', value: 'مسارات الألب', language: 'ar'},
            {name: 'brandText', value: 'Alpine Trails', language: 'en'}
        ], ['bootstrap5mix:navbarGlobalSettings', 'bootstrap5mix:brand']);
        addNode(rtlHome, 'pagecontent', 'jnt:contentList');
        addNode(`${rtlHome}/pagecontent`, 'intro', 'bootstrap5nt:grid', [{name: 'containerType', value: 'container'}, {name: 'containerCssClass', value: 'py-4'}], ['bootstrap5mix:createContainer']);
        addNode(`${rtlHome}/pagecontent/intro`, 'main', 'jnt:contentList');
        const main = `${rtlHome}/pagecontent/intro/main`;
        addNode(main, 'text', 'bootstrap5nt:text', [{
            name: 'text', language: 'ar',
            value: '<h1>اكتشف جبال الألب مع مرشد</h1><p class="lead">رحلات مشي في مجموعات صغيرة برفقة مرشدين جبليين معتمدين.</p>'
        }]);
        const button = (name: string, title: string, properties: object[] = []) => addNode(main, name, 'bootstrap5nt:button', [
            {name: 'jcr:title', value: title, language: 'ar'},
            {name: 'buttonType', value: 'externalLink'},
            {name: 'externalLink', value: 'https://www.example.com/booking'},
            {name: 'cssClass', value: 'me-2 mb-3'},
            ...properties as []
        ], ['bootstrap5mix:externalLink', 'bootstrap5mix:buttonAdvancedSettings']);
        button('book', 'احجز رحلتك');
        button('more', 'اكتشف المزيد', [{name: 'style', value: 'secondary'}, {name: 'outline', value: 'true', type: 'BOOLEAN'}]);
        addNode(main, 'progress', 'bootstrap5nt:progress', [
            {name: 'label', value: 'الأماكن المحجوزة', language: 'ar'}, {name: 'value', value: '65', type: 'LONG'}, {name: 'showValue', value: 'true', type: 'BOOLEAN'}
        ]);
    });

    it('publishes both sites', () => {
        cy.login();
        publish(sitePath, ['en', 'fr']);
        publish(`/sites/${docsRtlSite}`, ['ar', 'en']);
        // Publication is a background job: wait for the last pages created to be live
        waitForLive(`/cms/render/live/en${home}.html`, 'Alpine Trails');
        waitForLive(`/cms/render/live/en${sitePath}/components/grid.html`, 'row');
        waitForLive(`/cms/render/live/ar/sites/${docsRtlSite}/home.html`, 'progress');
    });
});
