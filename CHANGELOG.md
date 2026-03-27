# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Version numbers follow `major.minor.patch`: `3.x.x` is the JavaScript/React rewrite (this branch), `2.x.x` was the legacy Groovy/JSP stack.

---

## [3.0.0] — Unreleased

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
