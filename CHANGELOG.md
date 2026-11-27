# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Version numbers follow `major.minor.patch`: `3.x.x` is the JavaScript/React rewrite (this branch), `2.x.x` was the legacy Groovy/JSP stack.

---

## [Unreleased]

_Closes the remaining gaps with 2.4.7: what a 2.x site relied on works the same in 3.x, and the 2.4.5 to 2.4.7 fixes are all present._

### Fixed
- **Pagination** — the pager works again: it resolves the list it is bound to, pages it with the `begin`/`end`/`pagesize` URL parameters of 2.x, and the list views display one page (the view was a placeholder that rendered nothing)
- **Alert skin** — displays the content it is applied to (it rendered an empty alert)
- **Grid, absolute areas** — with `bootstrap5mix:createAbsoluteAreas` the columns show the content stored under the ancestor page of the chosen level, editable on that page only, as in 2.x (the option was ignored)
- **Grid, area names** — `2_10` and `10_2` use the 2.x area names again (`main,side` and `side,main`): their two columns were swapped
- **Grid, columns** — the column content is found where 2.x stored it in every situation: under the grid on a page, under the grid for content shared from another page (a grid in the header), and under each page for a grid placed in a page template, which keeps one content per page. Same lookup for the card free footer
- **Grid, `listLimit`** — the limit now applies to what is displayed, not only to what editors can add (2.x only limited the editing interface)
- **Upgrade from 2.x, content editor** — after 3.x replaced 2.x, the grid type, button type and navbar root lists no longer brought their settings (every optional field set showed at once): removing the 2.x components module unregistered the choice list initializers that 3.x declares under the same names. `bootstrap5-core` now registers them again
- **Starter templates** — a page displayed in a language the home page is not translated or published in no longer fails (error 500): the shared header and footer are resolved as 2.x did; they are editable on the home page only, as in 2.x
- **Grid and image inline styles** — `sectionStyle` and `imageStyle` are rendered (a CSS string made the whole view fail); `sectionElement` and the card `headerSize` only accept the values of their choicelist
- **Navbar, levels** — levels 4 and 5 are rendered (only 3 were); ancestors of the current page get `.inpath` again, `.active` is the current page only
- **Navbar, root** — `root` is read without the global settings mixin; `customRootPage` starts the menu at the chosen page; `j:displayInMenuName` restricts a page to the menus it lists
- **Language switcher** — in live, only the active languages in which the page is published; invalidated languages left out; links labelled with the language name (`français`) with `title`, `lang` and `hreflang`
- **Tabs** — a tab opens from the URL fragment and the fragment follows the open tab again; "add a tab" button in edit mode; no stray `tabs` area
- **Accordion** — no stray `panels` area after the accordion
- **Carousel** — slides are editable modules again in edit mode; Previous/Next are translated
- **List view** — `j:subNodesView`, ordered lists and paging; "add content" button instead of an extra area
- **Breadcrumb** — an ancestor that has no page of its own is plain text instead of a link to `#`; the navigation label is translated
- **Button** — link buttons are plain links (no `role="button"`, no `aria-pressed`); popovers are initialised once the page and Bootstrap are loaded
- **Privacy settings modal** — the 2.x view is back (in `bootstrap5-core`): the 3.0.x view had no script behind its buttons
- **Rich text toolbar** — `javascript/ckconfig.js` is served again (the folder was not declared as a static resource)
- **Version component** — one view only (the Bootstrap version in edit mode); the second one printed the module version on live pages
- **Resource bundle** — non-ASCII characters of the default bundle are escaped (2.4.7 fix)
- **Build** — `bootstrap5-core` installs with `npm ci` (2.4.7 fix)
- **Pagination, page size in the URL** — a page size taken from the URL (`pagesize<id>`, `src_itemsPerPage`) is limited to 100 items per page, or to the page size set on the pager when it is larger; a visitor can no longer make a list display all its items by editing the URL
- **Language switcher, tag and image view** — the language code, language name and link written by the `b5:switchToLanguageLink` tag, and the image address of the image view, are escaped for HTML
- **Navbar, login** — the script that reopens the login modal after a failed login no longer contains the identifier of the node; the modal is marked with an attribute instead (same behaviour)

### Added
- **Button group** — new component (`bootstrap5nt:buttonGroup`) holding existing buttons, horizontal or vertical, in three sizes; the panels its buttons open (modal, collapse, offcanvas) are rendered after the group
- **Progress bar** — new component (`bootstrap5nt:progress`): value, maximum, label, colour, stripes, optional percentage
- **Help texts in the content editor** — 145 fields and groups of fields of the components (layout, grid, container, row, card, button, navbar, carousel, tabs, image, pagination, progress…) explain what they do under their label, in English, French, German, Spanish, Italian and Portuguese. The help text of a drop-down list names the choices as the editor reads them ("4 / 8", "Fixed width", "No limit"), not the stored values
- **Clearer labels** — the container widths with a threshold say which range is full width and which is fixed ("Full width up to 576 px, then fixed width (Small)") in the six languages; German: "Kapselform", "Abgeschwächt" and "Gleich breit" replace "Pill", "Muted" and "Ausgerichtet", the breadcrumb is "Navigationspfad"; Italian: the card is "Card" (tabs keep "scheda"), the breadcrumb is "Percorso di navigazione"; Spanish, Italian and Portuguese: the gutters are described as the space between columns
- **Tooltip on buttons** — optional tooltip text and position in the advanced settings of a button; it can be dismissed with Escape and stays open while pointed at
- **Colour mode** — default colour mode of a site (light, dark, automatic) in the site settings, applied by the starter templates; optional light / dark / auto switcher in the navbar, which remembers the visitor's choice
- **Right-to-left** — the starter templates load Bootstrap's right-to-left stylesheet for right-to-left languages; multi-level sub-menus open on the correct side
- **CKEditor 5** — the Bootstrap styles of the rich text fields (lead, colours, alerts, badges, tables) are available in CKEditor 5 as they are in CKEditor 4
- **Rich text tables** — table button and Bootstrap table styles (striped, bordered, hover, compact) in the CKEditor 4 toolbar; a table written in a rich text field gets the `table` class Bootstrap needs to style it, in CKEditor 4 and CKEditor 5
- **Migration test** — `tests/ci.migration.sh` seeds a site with the 2.x modules, installs 3.x over them on the same Jahia, and checks that every piece of content is still displayed in the same place
- **Accessibility tests** — `22-accessibility.cy.ts` runs the WCAG 2.2 A/AA rules of axe-core on a page holding every component, in each of its states (menus, tabs, dialogs, panels open; edit mode), and checks keyboard operation; the detail of each run is written to `tests/results/accessibility-report.json`
- **Tests on a Jahia instance** — language switcher on a multilingual site, grid in a page template and in shared content, rich text editing with CKEditor 4 and CKEditor 5, edit mode
- **`b5` taglib and `Functions`** — back in `bootstrap5-core` for project JSPs written for 2.x (`b5:safeUrl`, `b5:isRtlLanguage`, `b5:replaceAll`, `b5:switchToLanguageLink`), with the `image`, `margin` and `padding` views
- **Tests** — end-to-end specs for pagination, grid area names and absolute areas, navbar levels and roots, the alert skin and tab deep links; unit tests for the new behaviours; the 2.x JUnit tests of `Functions` and of the choicelist initializers

### Changed
- **Bootstrap** — assets updated from **5.3.8 → 5.3.9**
- **Rich text editor** — the HTML cleanup button uses DOMPurify 3.5.0 (was 3.0.5), and the sanitizer now runs last, after the removal of empty `<span>` tags
- **Bootstrap 5.3 documentation review** — every component was compared with the official 5.3 documentation; classes left over from Bootstrap 3 and 4, which have no rule in Bootstrap 5, and deprecated ones were replaced:
  - **Navbar** — default classes are `navbar navbar-expand-lg bg-body-tertiary` and `navbar-toggler` (`navbar-light`, deprecated, and `navbar-toggler-right` had no effect); `bg-body-tertiary` is the same grey as `bg-light` and follows the colour mode. Navbars with their own classes are not changed
  - **Navbar, login** — the modal follows Bootstrap's structure (the form is the modal content), which restores its vertical centring; the user name field takes the focus when the modal opens
  - **Button** — "full width" works (`btn-block` was removed in Bootstrap 5); the popover button is a focusable link, as Bootstrap requires for a popover closed on the next click (browsers do not all focus a clicked button); popover titles no longer add a native tooltip; an offcanvas always has its close button; a modal without title is named by its button; `outline` is ignored with the link style
  - **Carousel** — unticking "pause on hover" has an effect (hover is Bootstrap's default); the dark variant uses `data-bs-theme="dark"`
  - **Images** — a corner shape and a size give one class (`rounded-top-3`); two classes rounded the four corners
  - **Colours** — the "muted" text colour renders `text-body-secondary` (`text-muted` is deprecated)
  - **Rich text templates** — the jumbotron uses utilities (the component was removed in Bootstrap 5); blockquotes follow the documented structure; badges use `text-bg-*`; the eight alert colours are offered
  - **Privacy settings modal** — Bootstrap 5 attributes and classes (`data-bs-*`, `btn-close`, `btn-secondary`)
  - **Editing interface** — warning badges use `text-bg-warning`
- **New choices** — offcanvas from the top; image corner sizes 4 and 5
- **Requirements** — Jahia 8.2.3.x and `javascript-modules-engine` 1.3.1 (the latest release, which `bootstrap5-package` now installs when Jahia runs an older engine)
- **Accessibility, templates** — the starter templates wrap the page content in a `main` landmark and start with a translated "skip to main content" link
- **Accessibility, components** — the breadcrumb entry of a content that is not a page is the current location (not a link to itself); carousel slides and their indicators are labelled and translated; sub-menus open from the keyboard; changing tab no longer moves the focus out of the tab list
- **Accessibility** — pagination in a labelled `nav`, disabled entries are not links; the "(current)" texts are gone (`aria-current` carries the state); username and password fields declare `autocomplete`

## [3.0.2] — 2026-11-26

_Restores the 2.x (2.4.7) behaviour for content created with 2.x; measured with the 2.4.7 end-to-end suite on Jahia 8.2.3.7._

### Fixed
- **Rendering** — the JavaScript modules are built with Vite 7 again: Vite 8 bundled a `node:module` import that Jahia's GraalVM engine cannot load, so 3.0.0 and 3.0.1 rendered nothing
- **Accordion, Tabs, Carousel** — render with their own view again (the generic list view replaced them: no accordion wrapper, no tabs, no carousel)
- **Content created with 2.x** — accordion panels, modal/collapse/offcanvas buttons, grid columns and the card free footer display their existing content again
- **Navbar** — the login form signs visitors in again (it posted to `#`) and shows login errors; Preview/Edit links require the jContent permissions; 2.x multi-level submenus and markup; no site name when no brand text is set
- **Cache** — the 2.x cache keys are declared again (navbar per page and per user, breadcrumb and grid per page, pagination and list parameters): one cached navbar could be served on every page and to other users
- **Security** — the card footer is escaped again; editor-provided `javascript:`/`data:` links become `#` (button, navbar)
- **Labels** — translated in the 6 languages (`settings/locales`); visitors saw keys such as `bootstrap5nt_button.close`
- **Page title** — the page title instead of the template name ("base") in `<title>`
- **Carousel** — options written as configured (ride, wrap, keyboard, pause), pause button, captions on phones, image alt text
- **Accessibility** — 2.4.5 attributes restored on tabs, slides, modals and offcanvas
- **Robustness** — a slide without image, a figure without optional settings or an empty text no longer fail the component
- **Alert skin** — offered again in the skin choice of skinnable content

## [3.0.1] — 2026-11-25

### Fixed
- **Jahia Store** — JavaScript modules declare the metadata the Store requires

## [3.0.0] — 2026-11-25

_Requires Jahia 8.2.3.0 — complete rewrite as JavaScript/React (TSX) rendering stack._

### Added
- **JavaScript/React rendering stack** — all component views rewritten as TypeScript/TSX server components using `@jahia/javascript-modules-library` and `react-bootstrap`
- **`bootstrap5-package` module** — self-contained OSGi JAR that embeds and auto-installs all three modules (`skins`, `bootstrap5-core`, `bootstrap5-components`, `bootstrap5-templates-starter`) on activation; supports clean redeploy
- **Version component** — now displays the actual running package version (e.g. `v3.0.0-SNAPSHOT`) from the embedded `bootstrap5-package.properties`
- **`List` component** — droppable content list used by Tabs and other container components
- **`PrivacySettingsModal` component** — Bootstrap 5 view for Jahia's privacy settings modal

### Changed
- **react-bootstrap migration** — Accordion, Alert, Breadcrumb, Button, Card, Carousel, Figure, Navbar, Tabs migrated to `react-bootstrap` component library for cleaner, idiomatic JSX
- **Build system** — moved to Yarn 4 workspaces (root `package.json`); Maven uses `frontend-maven-plugin` with **Node v22.12.0** installed to `.node/` per module; day-to-day dev via `yarn build` / `yarn dev`
- **Collapse trigger** — `<Button data-bs-target>` replaces `<a href>` to avoid Jahia edit-frame link interception
- **Areas** — `numberOfItems` set to `0` (unlimited) on all droppable areas in Card, Grid, and Button components

### Fixed
- **Modal** — now rendered inline in edit mode so content is accessible in the Jahia editor
- **TGZ bundle redeploy** — `stop()` uninstalls previously installed TGZ bundles; `start()` updates by symbolic name, avoiding symbolic-name conflicts on redeploy
- **TGZ bundle path** — stable `data-dir` path used for TGZ files to support redeploy without symbolic-name conflicts
- **react/jsx-runtime** — patched default import for GraalVM compatibility

---

## [2.4.7] — 2026-09-29

### Fixed

- **Links** — external link targets set by editors (button `externalLink`, `jnt:externalLink` menu items in the multilevel and legacy navbar views) are now checked by the new `b5:safeUrl` function: only relative URLs and the `http`, `https`, `mailto` and `tel` schemes are kept, anything else (`javascript:`, `data:`, `vbscript:`, `ftp:`…) becomes `#`. HTML escaping alone kept these values inside the `href` but still let a `javascript:` link run when clicked. A button whose link is rejected renders disabled in live mode and shows the "no URL" badge in edit mode
- **Navbar login** — the logged-in username in the login menu is now escaped
- **Carousel** — without `bootstrap5mix:carouselAdvancedSettings`, the carousel rendered `data-bs-wrap="false"` and stopped at the last slide: the `wrap` default was set under a `${empty ride}` test instead of `${empty wrap}`. It now wraps, which is the Bootstrap default. Carousels that set `wrap` explicitly are unchanged

### Added

- **Tests** — JUnit 5 tests for `bootstrap5-components`, run by `mvn package`: the `b5:` EL functions, the choicelist initializers, and the consistency between `definitions.cnd`, `bootstrap5-components.tld` and the Java classes they name (`FunctionsTest`, `ChoiceInitializersTest`, `ModuleDescriptorsTest`)

---

## [2.4.6] — 2026-09-29

### Fixed

- **Navbar login** — the modal "Close" button rendered `???bootstrap5nt_navbar.label.close???`: the key introduced in 2.4.5 was missing from every resource bundle. Added it in all six languages
- **Grid** — the section `style` attribute is now escaped, aligning it with the sibling `id`, `class`, `role` and `aria-label` attributes on the same tag
- **Card** — the `cssClass`, `cardHeaderCssClass` and `cardBodyCssClass` values from `bootstrap5mix:cardAdvancedSettings` are now escaped
- **Navbar** — `navClass`, `brandLinkClass`, `togglerClass` and `divClass` are now escaped in the wrapper view; `ulClass`, `liClass` and `navLinkClass` in the legacy JSP view; `loginMenuULClass` in the login view
- **Navbar multilevel (Groovy)** — CSS class properties, menu item titles and menu item URLs are now escaped before interpolation; attributes there are single-quoted, so the escaping covers `'` as well
- **Privacy settings modal** — the `cssClass` and `htmlId` values are now escaped
- **Stored XSS in views** — plain-text and CSS class values set by editors were written into the HTML without escaping, so a value containing markup was rendered as markup. They are now escaped in button (title, modal title, close text, `cssClass`, `style`, `size`, `state`, `modalSize`, `direction`, `placement`, external link `href`), carousel item (title, caption, `carouselItemClass`, colours), carousel (`carouselClass`), card (title, footer, colours, alignment), accordion and tabs (item titles), custom and predefined grids (column classes, `level`), navbar (`brandText`, breakpoint class; titles and URLs in the legacy JSP view), breadcrumb (`cssClass`), figure (`captionAlignment`), pagination (`layout`, `align`), alert skin (`backgroundColor`), margin/padding classes, the privacy settings modal labels, and the page `<title>` of both starter templates. Rich text (`bootstrap5mix:text`) is still rendered as HTML
- **Grid / Card** — `sectionElement` and `headerSize` are used as tag names; values outside the choicelist now fall back to `div`
- **i18n** — English labels containing an em dash (padding/margin sizes, carousel variant, absolute areas level, container/section/row ID tooltips, image settings) rendered as `â` plus two control characters: the build reads `.properties` as ISO-8859-1, so the raw UTF-8 `—` in `bootstrap5-components.properties` was mangled. The character is now escaped as `\u2014`, like in the other bundles

### Updated

- **Build** \u2014 `bootstrap5-core` now runs `npm ci` instead of `npm install`, so the bundled Bootstrap assets always match `package-lock.json`
- **Build** \u2014 removed the unused optional `icu4j` dependency from `bootstrap5-components`, and the `<version>` redundant with the parent in `bootstrap5-components` and `bootstrap5-templates-starter`

---

## [2.4.5] — 2026-05-20

### Added
- **Navbar** — third-level pages now render as Bootstrap 5 dropend submenus (`.dropend` + `.submenu.dropdown-menu`), supported in both the Groovy multilevel renderer and the legacy JSP view

### Fixed
- **Accordion** — `aria-expanded` was hardcoded to `"true"`; now reflects actual open/closed state
- **Breadcrumb** — `aria-label` moved from `<ol>` to the wrapping `<nav>` element (WCAG 4.1.2); non-navigable items replaced `<a href="#">` with `<span>` to remove dead links
- **Button** — removed invalid `role="button"` from `<a>` elements; modal trigger gains `aria-haspopup="dialog"` and `aria-modal="true"`; collapse trigger exposes dynamic `aria-expanded`; offcanvas uses conditional `aria-labelledby`/`aria-label`; disabled state uses `<button disabled>` instead of `<a href="#">`
- **Carousel** — indicators converted from `<ol>/<li>` to `<div>/<button>` with `aria-label="Slide N"` and `aria-current="true"`; prev/next controls converted to `<button>` with `data-bs-target`; outer div gains `aria-roledescription="carousel"` and `aria-label`; pause/play toggle added
- **CarouselItem** — added `alt` text, `aria-roledescription="slide"`, and `aria-label` per slide; caption visible to AT on all viewports
- **Navbar login** — duplicate input `id` attributes eliminated; visually-hidden `<label>` elements added; login trigger converted from `<a role="button">` to `<button>`; all decorative SVGs gain `aria-hidden="true" focusable="false"`
- **Navbar multilevel (Groovy)** — `aria-current="page"` on active links replaces the deprecated visually-hidden span; dropend toggle includes `href`, `data-bs-toggle`, `aria-expanded`, and `id`; submenu `<ul>` gains `aria-labelledby`
- **Navbar multilevel (JSP)** — `aria-current="page"` on active links; removed `aria-haspopup="true"` from dropdown toggles; removed invalid `aria-labelledby` from `<div class="dropdown-menu">`
- **Navbar wrapper** — `aria-hidden="true"` on toggler icon span; conditional `alt` on brand image
- **Pagination** — wrapped `<ul class="pagination">` in `<nav aria-label="Pagination">`; numbered links gain `aria-label="Page N"`; active item gains `aria-current="page"`
- **Privacy settings modal** — converted BS4 tab markup to BS5 (`data-bs-toggle`; `<button>` tabs); `aria-modal="true"`, `aria-labelledby`, and `tabindex="-1"` on modal; tab panels gain `aria-labelledby` and `tabindex="0"`; duplicate `id` (`#privacyTabs_…`) corrected
- **Tabs** — `aria-selected` leading-space typo fixed; `tabindex` added to tab buttons and panels; `aria-label` on tablist; `aria-labelledby` on tab panels

---

## [2.4.4] — 2026-03-21

### Updated
- Bootstrap assets updated from **5.3.7 → 5.3.8**

### Fixed
- **Language switcher** — unclosed `<a>` tag caused broken HTML rendering: the language code (`FR`, `EN`…) was output inside the opening tag instead of as link text, corrupting the entire dropdown structure
- **Language switcher** — removed redundant and deprecated `aria-owns` attribute
- **Login dropdown** — duplicate `class` attribute on the Logout link caused the `logout` CSS class to be silently ignored by the browser
- **Navbar** — dropdown menus overflowed the viewport when the navbar was used outside a Bootstrap container
- **Figure** — missing `fn` taglib declaration caused a JSP compilation error
- **CarouselItem** — Bootstrap 3 markup was used in edit mode; replaced with Bootstrap 5 equivalents
- **Offcanvas** — undefined `${visibility}` variable generated an invalid HTML attribute on the toggle button
- **Carousel** — undefined `${carouselCaptionClass}` variable
- **Navbar** — typo `brandImageMobileeUrl` (double `e`) prevented the mobile brand image from rendering
- **Navbar** — wrong i18n key `bootstrap5nt_navbarnavbar` for the language switcher `aria-label`
- **Margin mixin** — wrong package declaration in `margin.margin.groovy`

### Documentation
- Fixed inconsistencies between markdown documentation and CND definitions (button, navbar, grid)
- Documented the navbar brand resolution behaviour (site node vs local component)
- Added Javadoc to `ButtonTypeInitializer`, `GridTypeInitializer`, `NavbarRootInitializer`
- Added JSDoc to `multilevel-nav.js`

---

## [2.4.3] — 2025-06-26

### Updated
- Bootstrap assets updated to **5.3.7** (security patches and compatibility improvements)
  Full upstream changelog: https://github.com/twbs/bootstrap/releases/tag/v5.3.7

---

## [2.4.2] — 2025-06-05

_Requires Jahia 8.2.0.0_

### Added
- **Pagination** — added a placeholder message for empty pagination components in edit mode, making the component visible even when no items are available

---

## [2.4.1] — 2025-05-22

_Requires Jahia 8.2.0.0_

### Added
- **Documentation** — new section in `docs/text.md` describing how to use `bootstrap5mix:text` in custom definitions, including JSP display methods
- **Jahia 8.2 compatibility** — `bootstrap5-package` enhanced with `Jahia-Required-Version: 8.2.0.0` manifest entry, dependency on `org.jahia.modules:skins:8.2.0`, and improved `maven-assembly-plugin` / `maven-dependency-plugin` configuration

### Updated
- Bootstrap assets updated to **5.3.6**
  Full upstream changelog: https://github.com/twbs/bootstrap/releases/tag/v5.3.6

### Maintenance
- Maven plugins upgraded and consolidated for improved build reliability

---

## [2.4.0] — 2025-04-15

_Requires Jahia 8.2.0.0_

### Added
- **Navbar** — two new properties in `bootstrap5mix:customizeNavbar`:
  - `liClass`: CSS class for each `<li>` item (default: `nav-item`)
  - `navLinkClass`: CSS class for each `<a>` link (default: `nav-link`)
  Supported in both JSP and Groovy-based views
- **CKEditor** — "Remove Format" button to clear inline formatting
- **CKEditor** — custom "Wash" button to clean up pasted HTML (e.g. from MS Word), powered by `purify.min.js` and `beautify-html.min.js`

### Changed
- **Navbar** — refactored `navbar.basenav-multilevel.groovy` with reusable helper methods; improved support for `jnt:page`, `jnt:nodeLink`, and `jnt:externalLink` menu items
- **CKEditor** — safety check added in `ckconfig.js` to prevent errors when `combo_inlinestyles` is absent from the editor UI
- All Spring Framework dependencies removed to simplify the codebase

### Documentation
- Updated `docs/navbar.md` with new customizable navbar properties
- Updated `docs/text.md` and replaced `text.png` to reflect the new CKEditor toolbar

---

## [2.3.1] — 2024-02-27

_Requires Jahia 8.0.0.0_

### Added
- New tab style: `underline`
- Missing resource for component permissions

### Updated
- Bootstrap assets updated to **5.3.3**

---

## [2.3.0] — 2023-08-29

_Requires Jahia 8.0.0.0_

### Updated
- Bootstrap assets updated to **5.3.1**
- CKEditor configuration improvements
- Documentation enhancements

---

## [2.2.2] — 2023-04-21

_Requires Jahia 8.0.0.0_

### Fixed
- Fixed the "remember me" login feature

---

## [2.2.1] — 2023-02-14

_Requires Jahia 8.0.0.0_

### Fixed
- Prevented a redirect issue on login

### Added
- `jmix:accessControllableContent` added as parent to the component category to enable permission generation
- jQuery and multilevel nav assets are now only loaded when needed

---

## [2.2.0] — 2023-01-17

_Requires Jahia 8.0.0.0_

### Changed
- `bootstrap5-core` no longer provides mappings for uncompressed Bootstrap assets.
  All views must use `bootstrap.min.css` and `bootstrap.bundle.min.js`.
  If third-party bundles still reference uncompressed assets, add the legacy mappings via a Spring file — see [README — Compliance](README.md#compliance).

---

## [2.1.7] — 2022-12-20

_Requires Jahia 8.0.0.0_

### Updated
- Bootstrap assets updated to **5.2.3**

---

## [2.1.6] — 2022-10-26

_Requires Jahia 8.0.0.0_

### Added
- Tab name is now set as the URL fragment when clicking on a tab

---

## [2.1.5] — 2022-10-26

_Requires Jahia 8.0.0.0_

- Patch release (no user-facing changes)

---

## [2.1.4] — 2022-10-04

_Requires Jahia 8.0.0.0_

### Updated
- Bootstrap assets updated to **5.2.2**

---

## [2.1.3] — 2022-09-20

_Requires Jahia 8.0.0.0_

### Updated
- Bootstrap assets updated to **5.2.1**

---

## [2.1.2] — 2022-07-28

_Requires Jahia 8.0.0.0_

### Updated
- Bootstrap assets updated to **5.2.0**

---

## [2.1.1] — 2022-06-23

_Requires Jahia 8.0.0.0_

### Changed
- Renamed initializers to avoid conflicts with Bootstrap 4

---

## [2.1.0] — 2022-06-09

_Requires Jahia 8.0.0.0_

### Added
- `row` string preserved in custom row class names
- jQuery dependency removed from tabs; buttons used for tab elements

### Updated
- Bootstrap assets updated to **5.2.0-beta1**

---

## [2.0.9] — 2022-03-11

_Requires Jahia 8.0.0.0_

### Changed
- Version scheme changed from `1.x.x` to `2.x.x` for Jahia 8 builds so that Jahia 8 versions are always greater than Jahia 7 versions
- Same features and code as `v1.0.8`

---

## Jahia 7.3 releases (1.x.x)

### [1.2.0] — 2023-01-17

_Requires Jahia 7.3.0.0_

### Changed
- `bootstrap5-core` no longer provides mappings for uncompressed assets (same policy as `2.2.0`)
- Bootstrap assets updated to **5.2.3**
- Tab name is now set as the URL fragment when clicking on a tab
- `row` string preserved in custom row class names
- jQuery dependency removed from tabs; buttons used for tab elements

---

### [1.1.2] — 2022-01-05

_Requires Jahia 7.3.0.0_

### Changed
- Renamed `pagesandfiles` picker to `pagesandfiles5` to avoid conflicts with Bootstrap 4

---

### [1.1.1] — 2021-10-14

_Requires Jahia 7.3.0.0_

### Updated
- Bootstrap assets updated to **5.1.3**

---

### [1.1.0] — 2021-06-29

_Requires Jahia 7.3.0.0_

- Initial release for Jahia 7.3

---

## Early releases (0.x.x / 1.0.x — Jahia 8)

### [1.0.8] — 2022-01-05
- Renamed `pagesandfiles` picker to `pagesandfiles5` to avoid conflicts with Bootstrap 4

### [1.0.7] — 2021-10-14
- Bootstrap assets updated to **5.1.3**

### [1.0.6] — 2021-09-22
- Bootstrap assets updated to **5.1.1**

### [1.0.5] — 2021-09-01
- Bootstrap assets updated to **5.1.0**

### [1.0.4] — 2021-06-23
- Bootstrap assets updated to **5.0.2**
- Navbar fixes: correct page status, title for `nodeLink`, prevention of duplicate IDs when multiple navigation menus are on the same page
- Added a Bootstrap 5 view for `privacySettingsModal`

### [1.0.3] — 2021-05-18
- New property to set CSS class(es) on the Card Header
- Workaround for resources set with `targetTag="body"` not loading in edit mode (forced to `head`)

### [1.0.2] — 2021-05-17
- Bootstrap assets updated to **5.0.1**
  Full upstream changelog: https://github.com/twbs/bootstrap/releases/tag/v5.0.1

### [0.0.8] — 2021-03-30
- Bootstrap assets updated to **5.0.0-beta3**
- New component: **Offcanvas** (as part of the Button component)
- Bootstrap JavaScript moved to end of `<body>`

### [0.0.6] — 2021-03-12
- Sticky footer template example added
- Icons added for choice lists
- Mixin order changed for cards

### [0.0.5] — 2021-02-23
- Bootstrap assets updated to **5.0.0-beta2**

### [0.0.4] — 2021-02-12
- Fixed navbar rendering in live mode

### [0.0.3] — 2021-02-10
- Navbar component made truly recursive
- Fieldset override config added for grid and navbar components
- Two absolute areas added: `header` and `footer`
- `groupId` changed from `org.foo.modules` to `org.jahiacommunity.modules`
- Package module added

---

[Back to README](README.md)
