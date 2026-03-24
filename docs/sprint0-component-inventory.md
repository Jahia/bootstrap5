# Sprint 0 — Component Inventory & Classification Matrix

**Date:** 2026-03-24

Source of truth: `bootstrap5-components/src/main/resources/META-INF/definitions.cnd`
JSP views: `bootstrap5-components/src/main/resources/bootstrap5nt_*/html/`

---

## Component Classification Matrix

| Component | Node type | JSP view | Complexity | Islands needed | Sprint |
|-----------|-----------|----------|------------|----------------|--------|
| Text | `bootstrap5nt:text` | `text.jsp` | Simple | No | 3 (reference) |
| Button | `bootstrap5nt:button` | `button.jsp` | High | Partial (modal, collapse, popover, offcanvas) | 3 → 5 |
| Figure | `bootstrap5nt:figure` | `figure.jsp` | Simple | No | 4 |
| Alert | `bootstrap5mix:alert` | `skinnable.skins.alert.jsp` | Simple | No | 4 |
| Accordion | `bootstrap5nt:accordions` + `bootstrap5nt:accordion` | `accordions.jsp` + `accordion.jsp` | Medium | No (data-bs-* attributes) | 4 |
| Tabs | `bootstrap5nt:tabs` | `tabs.jsp` | Medium | No (data-bs-* attributes) | 4 |
| Card | `bootstrap5nt:card` | `card.jsp` | Medium | No | 6 |
| Grid | `bootstrap5nt:grid` | `grid.jsp` + 3 hidden variants | High | No | 6 |
| Breadcrumb | `bootstrap5nt:breadcrumb` | `breadcrumb.jsp` | Simple | No | 6 |
| Pagination | `bootstrap5nt:pagination` | `pagination.jsp` | Medium | No | 6 |
| Carousel | `bootstrap5nt:carousel` + `bootstrap5nt:carouselItem` | `carousel.jsp` + `carouselItem.jsp` | High | No (data-bs-* attributes) | 7 |
| Navbar | `bootstrap5nt:navbar` | `navbar.jsp` + 4 hidden partials | Very High | Yes (mobile toggle) | 7 |

---

## Detailed Notes by Component

### Text — `bootstrap5nt:text`
- Mixin: `bootstrap5mix:text` → `text` (richtext, i18n)
- Pure SSR. Output is `dangerouslySetInnerHTML` of the rich text value.
- No JS required.

### Button — `bootstrap5nt:button`
- Label: `jcr:title` (via `mix:title`)
- Key prop: `buttonType` — drives mixin injection via `ButtonTypeInitializer`
- Six types, each producing different HTML:

  | buttonType | Output | Mixin | Island needed |
  |------------|--------|-------|---------------|
  | `internalLink` | `<a href="...">` | `bootstrap5mix:internalLink` → `internalLink` (weakref) | No |
  | `externalLink` | `<a href="...">` | `bootstrap5mix:externalLink` → `externalLink` (string) | No |
  | `modal` | `<button>` + hidden `<div class="modal">` | `bootstrap5mix:modal` | No* |
  | `collapse` | `<a>` + `<div class="collapse">` + child content | `bootstrap5mix:collapse` | No* |
  | `popover` | `<button data-bs-toggle="popover">` + inline init script | `bootstrap5mix:popover` | Yes (JS init) |
  | `Offcanvas` | `<button>` + `<div class="offcanvas">` + child content | `bootstrap5mix:Offcanvas` | No* |

  *Bootstrap's own JS handles the interaction via `data-bs-*` attributes.
  Only popover requires explicit JS initialisation (currently inline jQuery).
  In the JS rendering module, this can be handled via a small island or a
  `<AddResources>` script.

- Advanced settings: `bootstrap5mix:buttonAdvancedSettings` → `style`, `size`,
  `outline`, `block`, `state`, `cssClass`, `disableTextWrapping`, `stretchedLink`

> **Sprint 3 note:** Start with `internalLink` and `externalLink` only as the
> reference. The other types are Sprint 5 (islands) or Sprint 7 (complex).

### Figure — `bootstrap5nt:figure`
- Image: `image` (weakref via `bootstrap5mix:imageAdvanced`)
- Caption: `jcr:title` (via `mix:title`)
- Optional mixin: `bootstrap5mix:figureAdvancedSettings` → `captionAlignment`
- Pure SSR. `<figure>` + `<img>` + `<figcaption>`.

### Alert — `bootstrap5mix:alert`
- This is a **mixin**, not a standalone node type. It extends `jmix:droppableContent`.
- Rendered via `jmix_skinnable/html/skinnable.skins.alert.jsp`
- Props: `backgroundColor`, `addDismissButton`
- Wraps child content in a `<div class="alert alert-{color}">`.
- The dismiss button uses `data-bs-dismiss="alert"` — Bootstrap JS handles it.

> **Architecture note:** Because alert is a mixin, the view registration
> is on `jmix:droppableContent` with a specific view name, not on its own
> node type. Verify the exact registration mechanism in the existing JSP
> before implementing.

### Accordion — `bootstrap5nt:accordions` + `bootstrap5nt:accordion`
- Two-level: `accordions` (group) + `accordion` (panel)
- Panel: `jcr:title` (header), `text` (richtext body), `show` (boolean), droppable children
- Group: `flush` (boolean)
- Interaction: `data-bs-toggle="collapse"` — no React island needed.
- Rendering: parent renders the `<div class="accordion">` wrapper and iterates
  over child nodes using `<RenderChildren />`.

### Tabs — `bootstrap5nt:tabs`
- Children are `jnt:contentList` nodes (each list = one tab panel)
- Props: `type` (tab/pill/link/underline), `fade`, `align`, `useListNameAsAnchor`
- Interaction: `data-bs-toggle="tab"` — no React island needed.

### Card — `bootstrap5nt:card`
- Props: `jcr:title`, `headerSize`, `textAlign`, `footer` (i18n), `image` (weakref)
- Mixins: `bootstrap5mix:colors`, `bootstrap5mix:cardAdvancedSettings`
- Droppable children in the body area.

### Grid — `bootstrap5nt:grid`
- Structural component. Four rendering modes driven by mixins:
  - `bootstrap5mix:createRow` → typeOfGrid → injects `predefinedGrid` or `customGrid`
  - `bootstrap5mix:createSection` → semantic HTML wrapper
  - `bootstrap5mix:createContainer` → Bootstrap `.container`
  - `bootstrap5mix:createAbsoluteAreas` → Jahia absolute areas
- Three hidden JSP views (`grid.hidden.*.jsp`) render column structure.
- This is the most structurally complex component. Tackle last in sprint 6.

### Navbar — `bootstrap5nt:navbar`
- Props: `root` (homePage/currentPage/parentPage/customRootPage), driven by `NavbarRootInitializer`
- Mixins: `bootstrap5mix:navbarGlobalSettings`, `bootstrap5mix:customizeNavbar`, `bootstrap5mix:brand`
- Site-level override: `bootstrap5mix:siteBrand` on `jnt:virtualsite`
- Four hidden JSP partials: `basenav.jsp`, `basenav-multilevel-resources.jsp`,
  `languages.jsp`, `login.jsp`
- Mobile toggle requires Bootstrap JS (`data-bs-toggle="collapse"`) — SSR works,
  no island strictly required. But language switcher may need server context for
  `getSiteLocales()`.

---

## Layer Classification

### What stays in `bootstrap5-components` (Java)

| Artefact | Type | Why it stays in Java |
|----------|------|---------------------|
| `definitions.cnd` | Content definition | Already exists, stable |
| `ButtonTypeInitializer` | Java choicelist initializer | Injects mixins at save time |
| `GridTypeInitializer` | Java choicelist initializer | Injects mixins at save time |
| `NavbarRootInitializer` | Java choicelist initializer | Injects mixins at save time |
| `SwitchToLanguageTag` | Java taglib | Server-side URL computation |
| `.properties` label files | i18n | Editor interface labels |
| `jahia-content-editor-forms` | JSON | Editor form configuration |

### What goes in `bootstrap5-js-rendering` (JS)

| Artefact | Type |
|----------|------|
| `src/components/*/default.server.tsx` | SSR views |
| `src/components/*/*.client.tsx` | Client islands (where needed) |
| `src/components/*/component.module.css` | Scoped CSS (if any) |
| `package.json` | Module descriptor |
| `vite.config.js` | Build config |
| `tsconfig.json` | TypeScript config |

### What stays undefined (deferred)

- Page templates (`jnt:page`) — out of scope
- Carousel JS initialisation approach — to be decided in Sprint 7
- Popover JS initialisation — to be decided in Sprint 5

---

## Open Questions for Sprint 0 Review

1. **Alert as mixin**: How does `jahiaComponent()` register a view for a mixin
   type (`jmix:droppableContent`)? Is `nodeType: "jmix:droppableContent"` with
   a named view the correct pattern, or does alert need a wrapper node type?

2. **Pagination**: Requires server-side state (current page number from request).
   How is HTTP request state accessed in JS views? `useServerContext()` →
   `renderContext.getRequest()`?

3. **Navbar language switcher**: `SwitchToLanguageTag` is a Java taglib.
   The JS equivalent would use `getSiteLocales()` from the library.
   Confirm that `buildNodeUrl(node, { language: code })` produces the same URLs.
