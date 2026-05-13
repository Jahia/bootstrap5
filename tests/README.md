# Bootstrap5 Components — Cypress Test Suite

End-to-end tests for the [bootstrap5-components](https://github.com/Jahia/bootstrap5) Jahia module.
Tests run against a live Jahia instance and cover rendering, Bootstrap 5 class output, and interactive
JavaScript behaviour for every shipped component.

---

## Requirements

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Node.js | **18.x** | 20.x also supported |
| Yarn | 1.22.x | Classic (v1) |
| Jahia | 8.2.3.0 | EE, with `bootstrap5-components` deployed |

> The `bootstrap5-templates-starter` template set must be deployed alongside the module — it is
> required to create the test site and render pages.

---

## Environment variables

Copy `.env.example` to `.env` and adjust the values for your environment:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `JAHIA_URL` | `http://localhost:8080` | Base URL of the Jahia instance |
| `SUPER_USER_PASSWORD` | `root1234` | Password for the `root` superuser account |
| `JAHIA_IMAGE` | `ghcr.io/jahia/jahia-ee-dev:8.2.3.0` | Docker image used by the CI pipeline |
| `JAHIA_VERSION` | `8.2.3.0` | Jahia version (used for version-gated assertions) |
| `MODULE_ID` | `bootstrap5-components` | Module identifier |
| `MANIFEST` | `provisioning-manifest-snapshot.yml` | Provisioning manifest for CI |
| `JAHIA_HOST` | `jahia` | Internal Docker hostname (CI only) |

The `baseUrl` in `cypress.config.ts` defaults to `http://localhost:8080`. Override it via
`CYPRESS_BASE_URL` or by editing the config directly.

---

## Installation

```bash
cd tests
yarn install
```

---

## Running the tests

Before running, export the environment variables from your `.env` file:

```bash
source set-env.sh
```

### Interactive mode (headed, with Cypress UI)

```bash
./env.debug.sh   # sets up the Cypress environment via @jahia/cypress, then opens the UI
# or, once env vars are exported:
yarn e2e:debug
```

### Headless / CI mode

```bash
./env.run.sh     # sets up the Cypress environment via @jahia/cypress, then runs headless
# or, once env vars are exported:
yarn e2e:ci
```

`env.run.sh` and `env.debug.sh` read the `@jahia/cypress` version declared in `package.json`
and delegate to the matching `env.run` / `env.debug` binary from that package, which takes care
of Cypress environment wiring (base URL, credentials, etc.) before handing off to Cypress itself.

Cypress will execute all spec files in alphabetical order. Specs are numbered to enforce a
deterministic run order — **01** sets up the site, **99** tears it down.

> **Important:** `01-Tests.cy.ts` must have run at least once before executing any individual
> spec in isolation. It creates the `bootstrap5test` site that every other test depends on.
> If you run a single spec directly (e.g. `--spec cypress/e2e/06-carousel.cy.ts`) without the
> site already in place, the `before` hooks will fail. Run the full suite first, or re-run
> `01-Tests.cy.ts` manually after a teardown.

### Generating the HTML report

After a headless run:

```bash
yarn report:merge   # merge per-spec JSON files into a single report.json
yarn report:html    # render report.json into an HTML page
```

Reports, screenshots and videos are written to `./results/`.

---

## Project structure

```
tests/
├── cypress/
│   ├── e2e/              # Spec files (numbered, run in order)
│   ├── fixtures/
│   │   ├── graphql/      # GraphQL mutation / query files
│   │   └── images/       # Binary fixtures (placeholder.png for image tests)
│   ├── plugins/          # Cypress plugin registration
│   └── support/
│       ├── bootstrap5.ts # Shared helpers (createTestPage, addComponent, …)
│       └── index.ts      # cy.login() and @jahia/cypress setup
├── cypress.config.ts
├── .env.example
└── reporter-config.json
```

### Shared helpers (`support/bootstrap5.ts`)

| Helper | Purpose |
|--------|---------|
| `pageUrl(name, lang?)` | Build the live render URL for a test page |
| `createTestPage(name)` | Create a `jnt:page` with a `pagecontent` list under `/home` |
| `addComponent(page, name, type, props?, mixins?)` | Add a component node to a page's content list |
| `publishPage(name)` | Publish a page and its subtree (includes a 2 s propagation wait) |
| `uploadPlaceholderImage(fileName?)` | Upload `fixtures/images/placeholder.png` to the site files folder and return its JCR UUID as a `Cypress.Chainable<string>` |
| `deleteTestPage(name)` | Delete a test page from the EDIT workspace |

---

## Test coverage

### 01 — Infrastructure (`01-Tests.cy.ts`)
Sets up the `bootstrap5test` site using the `bootstrap5-templates-starter` template set.

- Site pages return HTTP 200
- Bootstrap 5 CSS is loaded on every rendered page

### 02 — Button (`02-button.cy.ts`)
Covers all `buttonType` variants and styling options of `bootstrap5nt:button`.

| Context | What is verified |
|---------|-----------------|
| External link | `.btn` rendered as `<a>`, `href` points to the configured URL |
| Modal | `data-bs-toggle="modal"`, modal present in DOM, click opens it (`.modal.show`), droppable child content renders inside `.modal-body` |
| Collapse | `data-bs-toggle="collapse"`, area hidden by default, click expands it, droppable child content renders |
| Offcanvas | `data-bs-toggle="offcanvas"`, click opens panel (`.offcanvas.show`), droppable child content renders |
| Styles | `style` → `btn-{color}`, `size` → `btn-lg`, `outline=true` → `btn-outline-{color}` instead of `btn-{color}` |
| Modal advanced | `verticallyCentered=true` → `.modal-dialog-centered` |

### 03 — Accordion (`03-accordion.cy.ts`)
Covers `bootstrap5nt:accordions` + `bootstrap5nt:accordion` items.

- Bootstrap JS bundle is present on the page (`window.bootstrap`)
- Accordion wrapper (`.accordion`) renders
- Items render with `.accordion-item`, header with `.accordion-header`, body with `.accordion-collapse`
- `show=true` → first panel open (`.show` class), second panel closed
- Clicking a closed header opens it
- `flush=true` → `.accordion-flush` class on the wrapper
- Droppable child content renders inside the panel body

### 04 — Tabs (`04-tabs.cy.ts`)
Covers `bootstrap5nt:tabs` with `jnt:contentList` tab items.

- Tab navigation (`.nav-tabs`) and pane container (`.tab-content`) render
- First tab is active by default
- `fade=true` → each `.tab-pane` has `.fade`
- `type=pill` → `.nav-pills` instead of `.nav-tabs`
- Clicking an inactive tab activates its pane
- Droppable child content renders inside the active tab pane

### 05 — Card (`05-card.cy.ts`)
Covers `bootstrap5nt:card`.

- Card wrapper (`.card`), body (`.card-body`), title (`.card-title`) render
- Image above the card body renders with `.card-img-top`
- `footer` text renders in `.card-footer`

### 06 — Carousel (`06-carousel.cy.ts`)
Covers `bootstrap5nt:carousel` + `bootstrap5nt:carouselItem`.

- Carousel wrapper (`.carousel`) renders
- Two slides render as `.carousel-item`, first slide has `.active`
- Slide image renders (distinct colored images per slide for visual isolation)
- Indicators (`.carousel-indicators`) render when `useIndicators=true`
- Prev/next controls render when `useLeftAndRightControls=true`
- `ride=false` → no `data-bs-ride` attribute; `ride=true` → `data-bs-ride="carousel"`
- `keyboard=false` → `data-bs-keyboard="false"`; `wrap=false` → `data-bs-wrap="false"`
- `fade=true` → `.carousel-fade` class on the wrapper

### 07 — Grid (`07-grid.cy.ts`)
Covers `bootstrap5nt:grid` with predefined, custom and section layout variants.

- Predefined 6/6 split renders two `.col-md-6` columns inside `.row` within `.container`
- Each column renders its droppable child content (distinct text per column)
- Custom grid (`gridClasses=col-8,col-4`) renders matching column classes with child content
- Section wrapper (`bootstrap5mix:sectionWrapper`) renders `<section>` element with configured `id`

### 08 — Navbar (`08-navbar.cy.ts`)
Covers `bootstrap5nt:navbar`.

- Navbar wrapper (`.navbar`), brand link (`.navbar-brand`), toggler (`.navbar-toggler`), and collapsible region (`.collapse.navbar-collapse`) render
- Navigation links (`.nav-item`, `.nav-link`) render
- Multi-level navigation: top-level item with children renders as a dropdown (`.dropdown`)
- Dropdown toggle uses `data-bs-toggle="dropdown"`; dropdown menu is present in DOM
- Second-level pages render as `.dropdown-item` inside the menu
- Third-level pages render inside a `.dropend` submenu
- Leaf pages at top level render as plain `.nav-item` (no dropdown)
- `navClass=navbar-dark bg-dark` → `.navbar-dark` and `.bg-dark` classes applied
- `addContainerWithinTheNavbar=true` → `.container` inside `<nav>`; `false` → no `.container`

### 09 — Text (`09-text.cy.ts`)
Covers `bootstrap5nt:text` (rich-text / WYSIWYG component).

- Rich-text HTML renders on the page
- Content is correct and not double-wrapped

### 10 — Breadcrumb (`10-breadcrumb.cy.ts`)
Covers `bootstrap5nt:breadcrumb`.

> The breadcrumb JSP only renders when the page is at depth ≥ 3 under the site root (the
> `fn:length(pageNodes) > 1` condition). Tests use a 3-level hierarchy:
> `/home/breadcrumb-l1/breadcrumb-l2/breadcrumb-test`.

- `ol.breadcrumb` renders with an `aria-label` attribute
- Home link is present
- Intermediate level is present
- Active (current) page item has `.active` and `aria-current="page"`
- At least two items render

### 11 — Figure (`11-figure.cy.ts`)
Covers `bootstrap5nt:figure`.

- `<figure class="figure">` wrapper renders
- Image renders as `img.figure-img`
- Image is responsive (`img-fluid`) by default
- `<figcaption class="figure-caption">` renders when a title is set and contains the caption text
- Each context uses a distinct colored image (blue / green / orange) separated by `<hr>` dividers so tests target the correct figure instance
- `captionAlignment=text-center` → `figcaption.figure-caption.text-center`
- `thumbnails=true` → `img.img-thumbnail`
- `responsive=false` → image does not have `img-fluid`

### 99 — Teardown (`99-teardown.cy.ts`)
Deletes the `bootstrap5test` site to leave the Jahia instance in a clean state.

---

## License

MIT — see the [LICENSE](../LICENSE) file at the root of the repository.
