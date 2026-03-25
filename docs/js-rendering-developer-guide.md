# JS Rendering Module — Developer Reference

> **Module:** `bootstrap5-js-rendering`
> **Branch:** `js-rendering-roadmap`
> **Purpose:** Canonical JS/React SSR views for all Bootstrap 5 node types.
> Replaces the JSP views in `bootstrap5-components` for production use once
> validated.

---

## Architecture in one sentence

Each component is a TypeScript React function registered via `jahiaComponent()`.
Jahia's GraalVM engine calls it server-side at render time and injects the
resulting HTML into the page. No browser JS is needed for any component — Bootstrap
5's `data-bs-*` attribute system drives all interactive behaviour.

---

## Module setup

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 22 | `engines.node` in `package.json` |
| Yarn | ≥ 4 (Berry) | `engines.yarn` + `.yarnrc.yml` present |

```bash
cd bootstrap5-js-rendering
yarn          # install deps (first time)
yarn build    # tsc type-check + vite bundle
yarn dev      # watch mode (re-bundles on save)
yarn deploy   # jahia-deploy to a running instance
```

### Build output

`vite build` (via `@jahia/vite-plugin`) produces:

```
dist/
├── server/
│   └── index.js     ← all *.server.tsx files bundled; this is the Jahia server entry
└── client/
    └── *.js         ← browser islands (none currently — zero islands in this module)
```

The `jahia` block in `package.json` tells Jahia where to find these:

```json
"jahia": {
  "module-dependencies": "bootstrap5-components",
  "server": "dist/server/index.js",
  "static-resources": "/dist/client,/dist/assets"
}
```

### File layout

```
src/
├── utils/
│   └── image.tsx                          ← shared ImageTag helper
└── components/
    ├── Accordion/
    │   ├── default.server.tsx             ← bootstrap5nt:accordions (group)
    │   └── accordion-item.server.tsx      ← bootstrap5nt:accordion (panel)
    ├── Alert/
    │   └── default.server.tsx             ← jmix:skinnable view "skins.alert" ⚠️
    ├── Breadcrumb/
    │   └── default.server.tsx
    ├── Button/
    │   └── default.server.tsx
    ├── Card/
    │   └── default.server.tsx
    ├── Carousel/
    │   ├── default.server.tsx             ← bootstrap5nt:carousel (wrapper + slides)
    │   └── carousel-item.server.tsx       ← bootstrap5nt:carouselItem (standalone fallback)
    ├── Figure/
    │   └── default.server.tsx
    ├── Grid/
    │   └── default.server.tsx             ← consolidates 4 JSPs
    ├── Navbar/
    │   └── default.server.tsx             ← consolidates 4 JSPs
    ├── Pagination/
    │   └── default.server.tsx             ← HTML layer only ⚠️
    ├── Tabs/
    │   └── default.server.tsx
    └── Version/
        └── default.server.tsx             ← smoke test
```

---

## Core API

All imports come from `@jahia/javascript-modules-library`.

### `jahiaComponent(descriptor, renderFn)`

Registers a view with Jahia.

```ts
jahiaComponent(
  {
    nodeType: "bootstrap5nt:myComponent",   // JCR node type
    componentType: "view",                  // always "view" for SSR views
    name: "default",                        // view name ("default", "skins.alert", etc.)
    displayName: "My Component",            // shown in Jahia UI
  },
  (props: MyProps, context) => <JSX />,
);
```

The second argument can use `(props, context)` or `(props)` + `useServerContext()`.

### `useServerContext()`

Returns `{ currentNode, renderContext, mainNode, bundleKey }`.

```ts
const { currentNode, renderContext, mainNode } = useServerContext();

currentNode.getIdentifier()           // UUID
currentNode.getName()                 // node name
currentNode.getPath()                 // /sites/mySite/home/...
currentNode.getDisplayableName()      // localised display name
currentNode.isNodeType("mixin:name")  // mixin presence check
currentNode.getPropertyAsString("x")  // string value or null
currentNode.getParent()               // parent node
currentNode.getAncestors()            // [root → parent] array

renderContext.isEditMode()            // true in edit mode
renderContext.isLiveMode()            // true in live mode
```

### `getChildNodes(node, nodeType)`

Returns typed child nodes (equivalent to `jcr:getChildrenOfType` in JSP).

```ts
import { getChildNodes } from "@jahia/javascript-modules-library";
const panels = getChildNodes(currentNode, "bootstrap5nt:accordion");
```

### `<RenderChildren nodeTypes="..." />`

Renders all children of the current node matching a node type. Equivalent to
`c:forEach + template:module` in JSP.

### `<Render content={node} />`

Renders a specific JCR node using its registered default view.

### `<Area name="..." nodeTypes="..." />`

Editable drop zone for content authors. Equivalent to `<template:area>` in JSP.

```tsx
<Area name="content" nodeTypes="jmix:droppableContent" />
```

### `<AddResources type="inline" targetTag="body" inlineResource="..." />`

Injects an inline `<script>` or `<style>` tag. Used for Bootstrap JS init
that can't be handled by `data-bs-*` attributes alone (Tabs deep-linking,
Popover manual init).

```tsx
<AddResources
  type="inline"
  targetTag={renderContext.isEditMode() ? "head" : "body"}
  inlineResource={`<script>new bootstrap.Popover(el)</script>`}
/>
```

---

## Shared utility — `ImageTag`

`src/utils/image.tsx`

Reproduces `bootstrap5mix_image/html/image.image.jsp`, which is called via
`<template:include view="image">` in the JSPs for Figure, Card, and Carousel.
Since JS modules have no sub-view delegation mechanism, this logic is extracted
into a shared React component.

```tsx
import { ImageTag } from "../../utils/image.js";

<ImageTag
  node={currentNode}       // component node — carries the mixin
  imageNode={image}        // JCRNodeWrapper from weakref prop (may be null)
  callerClass="figure-img img-fluid"
/>
```

When `bootstrap5mix:imageAdvancedSettings` is present on `node`, `ImageTag`
applies: `imageClass`, `imageStyle`, `imageID`, `responsive` (adds/removes
`img-fluid`), `thumbnails` (`img-thumbnail`), `borderRadius`, `borderRadiusSize`,
`align` (`float-start` / `float-end` / `mx-auto d-block`), `alt`.

**Used by:** Figure, Card, Carousel.

---

## Component reference

### Button — `Button/default.server.tsx`

**Registers:** `bootstrap5nt:button` / `"default"`

The most complex component. Six `buttonType` variants each produce different HTML:

| `buttonType` | Output |
|---|---|
| `internalLink` | `<a href="{node.url}">` |
| `externalLink` | `<a href="{externalLink}">` |
| `modal` | `<button data-bs-toggle="modal">` + hidden `.modal` div + `<Area>` for body |
| `collapse` | `<a data-bs-toggle="collapse">` + `.collapse` div + `<Area>` for body |
| `popover` | `<button data-bs-toggle="popover">` + `<AddResources>` for `new bootstrap.Popover(el)` |
| `Offcanvas` | `<button data-bs-toggle="offcanvas">` + `.offcanvas` panel + `<Area>` for body |

The button CSS class is built by `buildButtonClass()` which mirrors the JSP's
class-building logic exactly: `btn-{style}` (or `btn-outline-{style}`), `btn-{size}`,
`btn-block`, `disabled`, `active`, `text-nowrap`, `stretched-link`, arbitrary
`cssClass`. When `style === "custom"`, only the `cssClass` is applied (no `btn-*` prefix).

**Key prop:** `buttonType` — injected by `ButtonTypeInitializer` (Java) at save time.

---

### Accordion — `Accordion/default.server.tsx` + `accordion-item.server.tsx`

**Registers:** `bootstrap5nt:accordions` / `"default"` and `bootstrap5nt:accordion` / `"default"`

Two separate node types. The group (`accordions`) renders
`<div class="accordion [accordion-flush]">` and uses `<RenderChildren>` to delegate
panels. Each panel (`accordion`) reads `jcr:title`, `text` (CKEditor rich-text via
`dangerouslySetInnerHTML`), and `show` (starts expanded).

`data-bs-parent="#accordion-{parentId}"` is built from
`currentNode.getParent().getIdentifier()` — keeping one panel open at a time.

**Note:** The original `accordions.jsp` has a copy-paste bug where the inner wrapper
uses class `carousel-inner`. The JS view omits this spurious wrapper entirely.

---

### Tabs — `Tabs/default.server.tsx`

**Registers:** `bootstrap5nt:tabs` / `"default"`

Children are `jnt:contentList` nodes fetched via `getChildNodes(currentNode, "jnt:contentList")`.
Each list becomes one tab panel rendered via `<Render content={listNode} />`.

**`toAnchor(name)`** — local function replacing the Java `b5:replaceAll` custom taglib:
replaces `[^A-Za-z0-9_]` with `-`, prefixes `tab-` if the first character is not a letter.

Deep-linking (URL hash ↔ active tab) is handled by `DEEP_LINK_SCRIPT`, a vanilla JS
snippet injected via `<AddResources type="inline">` (into `<head>` in edit mode,
`<body>` in live). No React island needed.

---

### Alert — `Alert/default.server.tsx`

**Registers:** `jmix:skinnable` / `"skins.alert"` ⚠️

`bootstrap5mix:alert` is a `jmix:templateMixin` that triggers the `skins.alert`
view on `jmix:skinnable` nodes. The equivalent `jahiaComponent` registration uses
`nodeType: "jmix:skinnable"` — **this needs validation** with the Jahia JS engine
team before deploying (open question OQ-01).

Renders `<div class="alert alert-{backgroundColor} [alert-dismissible fade show]">`.
Wrapped content is injected via `<RenderChildren />`. The dismiss button (`btn-close
data-bs-dismiss="alert"`) is added when `addDismissButton=true`. No island needed —
Bootstrap handles dismiss natively.

---

### Figure — `Figure/default.server.tsx`

**Registers:** `bootstrap5nt:figure` / `"default"`

```html
<figure class="figure">
  <img ... class="figure-img img-fluid">
  <figcaption class="figure-caption [captionAlignment]">...</figcaption>
</figure>
```

Uses `ImageTag` with `callerClass="figure-img img-fluid"`. Caption alignment comes
from `bootstrap5mix:figureAdvancedSettings` (checked via `isNodeType`).

---

### Card — `Card/default.server.tsx`

**Registers:** `bootstrap5nt:card` / `"default"`

Outer div class: `cssClass` (default `"card"`) + `textAlign` + `bg-{color}` +
`text-{color}` + `border-{color}` from `bootstrap5mix:colors`.

Structure:
1. `ImageTag` with `callerClass="card-img-top"` (only if `image` prop set)
2. Header element (`headerSize`: `div`, `h1`–`h6`) when `jcr:title` is present
3. Card body: children from `getChildNodes(currentNode, "jmix:droppableContent")`
   filtered to exclude the `"cardFooter"` subnode
4. Footer: plain text + optional `<Area name="cardFooter">` when `freeFooter=true`

`bootstrap5mix:cardAdvancedSettings` overrides `cssClass`, `cardBodyCssClass`, and
`cardHeaderCssClass`. Both color and advanced settings are checked with `isNodeType()`
before reading their properties.

---

### Grid — `Grid/default.server.tsx`

**Registers:** `bootstrap5nt:grid` / `"default"`

The most complex component. Consolidates four JSPs into one file
(the JSP used `template:include view="hidden.*"` for sub-views; no equivalent in JS).

Three optional wrapper layers applied from outside in: **section** →
**container** → **row**. Each is gated by a mixin check:

| Mixin | Wrapper | Key properties |
|---|---|---|
| `bootstrap5mix:createSection` | `<section>`, `<main>`, `<aside>`, etc. | `sectionElement`, `sectionId`, `sectionCssClass`, `sectionStyle`, `sectionRole`, `sectionAria` |
| `bootstrap5mix:createContainer` | `<div class="container[-fluid] ...">` | `containerType` deduplicated from `containerCssClass` |
| `bootstrap5mix:createRow` | `<div class="row ...">` | `rowCssClass`, vAlign, hAlign, gX, gY — `"default"` stripped |

Grid type (one of three, from mixin):

| Mixin | Columns | Area names |
|---|---|---|
| `bootstrap5mix:predefinedGrid` | `grid="4_8"` split on `_`, `col-md-{span}` | Derived by `predefinedAreaNames()` — `side`/`main`/`extra`/`extra2` based on proportions |
| `bootstrap5mix:customGrid` | `gridClasses` comma-split | `col0`, `col1`, … |
| *(none)* — nogrid | Single area | `"main"` (or node name in `/modules`) |

**`predefinedAreaNames(parts)`** mirrors the JSP `choose/when` logic exactly:
`[4,8]` → `["side","main"]`, `[3,6,3]` → `["side","main","extra"]`, etc.

`bootstrap5mix:createAbsoluteAreas` and `bootstrap5mix:listLimit` are present in the
source but the `<Area>` JS component support for `moduleType` and `listLimit` props
has not been confirmed (OQ-12, OQ-13).

---

### Breadcrumb — `Breadcrumb/default.server.tsx`

**Registers:** `bootstrap5nt:breadcrumb` / `"default"`

Ancestor collection: `currentNode.getAncestors().filter(n => n.isNodeType("jnt:page"))`.
Falls back to `mainNode` ancestors filtered by `jmix:navMenuItem` when the component
is not placed under a page.

Renders as `<ol class="breadcrumb [cssClass]">`. Items:
- Path matches `mainNode.getPath()` → `<li class="breadcrumb-item active" aria-current="page">`
- Not directly displayable (approximated as `!isNodeType("jnt:page")`) → `<a href="#">`
- Otherwise → `<a href="{path}.html">`

When `mainNode` is not a `jnt:page`, a final item is appended for the resource itself
(truncated to 15–30 chars with `abbreviate()`).

**Open:** `url.base` prefix (OQ-09), `jcr:findDisplayableNode` equivalent (OQ-10).

---

### Pagination — `Pagination/default.server.tsx`

**Registers:** `bootstrap5nt:pagination` / `"default"`

**Status: HTML layer only.** The Bootstrap pagination markup (prev/next, page window,
active page) is implemented. The core integration is blocked on Java-only constructs:

- `uiComponents:getBindedComponent()` — resolves the bound list component
- `template:option` + `template:initPager` — initialises pager state in `moduleMap`
- HTTP request params `begin{id}` / `end{id}` / `pagesize{id}` — current page state

Until these have JS equivalents, the component renders an informative placeholder in
edit mode and nothing in live mode. (OQ-02)

---

### Carousel — `Carousel/default.server.tsx` + `carousel-item.server.tsx`

**Registers:** `bootstrap5nt:carousel` / `"default"` and `bootstrap5nt:carouselItem` / `"default"`

`bootstrap5mix:carouselAdvancedSettings` controls all carousel options. Key
rendering decisions:

**Slides are rendered inline in the parent.** The JSP passes `currentStatus` (i.e.
which slide is first/active) to each item via `<template:param>`. Since JS modules
have no param-passing mechanism, the carousel wrapper reads each item's properties
directly via `getChildNodes` and adds `active` based on `index === 0`.

`carousel-item.server.tsx` is a standalone fallback view for direct rendering. It
determines active state by checking sibling position:
`getChildNodes(currentNode.getParent(), "bootstrap5nt:carouselItem")[0]`.

**Edit mode:** outer div gets class `carouseledit` (not `carousel`) and inner gets
`carousel-inneredit` — CSS hooks that disable animation in the editor. Each slide
renders as a compact 64 px thumbnail instead of a full-screen item.

**Image access:** `currentNode.getProperty("image")?.getNode?.()` — weakref
resolution API needs validation (OQ-11).

---

### Navbar — `Navbar/default.server.tsx`

**Registers:** `bootstrap5nt:navbar` / `"default"`

Consolidates four JSP files: `navbar.jsp`, `navbar.hidden.basenav.jsp`,
`navbar.hidden.login.jsp`, `navbar.hidden.languages.jsp`.

**Brand resolution:** `bootstrap5mix:siteBrand` on the site node takes priority over
`bootstrap5mix:brand` on the component. Desktop/mobile brand images use responsive
visibility classes derived from the expand breakpoint extracted from `navClass`
(e.g. `"navbar-expand-lg"` → `expand = "lg"` → `d-none d-lg-inline-block`).

**Root node resolution:**

| `root` property | Result |
|---|---|
| `"currentPage"` | Current page |
| `"parentPage"` | Parent of current page |
| `"customRootPage"` | Weakref property `customRootPage` |
| *(empty)* | `site.home` |

**Nav tree:** `getChildNodes(rootNode, "jmix:navMenuItem")`. Each item is routed by
node type: `jnt:navMenuText` → `#`, `jnt:externalLink` → raw URL, `jnt:page` →
`node.getUrl()`, `jnt:nodeLink` → linked node URL. `j:displayInMenuName` multi-value
property filters items per navbar. Level 2 dropdown rendered when `maxlevel ≥ 2`.

**Login fragment:** Logged-in state shows a user dropdown with workspace-switching
links. Anonymous state shows a login link + Bootstrap modal with username/password
form. `ui:loginArea` (Jahia login form POST action) has no JS equivalent — form
action is `"#"` pending validation (OQ-05).

**Language switcher:** Language list approximated via `siteNode.getLanguages?.()`.
Switch URL approximated as `{mainNode.getPath()}.{lang}.html` (OQ-06, OQ-07).

---

### Text — `Text/default.server.tsx`

**Registers:** `bootstrap5nt:text` / `"default"`

The JSP is a single line: `${currentNode.properties.text.string}`. The JS view reads
the `text` property via `currentNode.getProperty("text").getString()` and injects it
via `dangerouslySetInnerHTML`. The property is stored i18n and contains sanitized
CKEditor HTML — no further escaping needed.

---

### List — `List/default.server.tsx`

**Registers:** `jmix:list` / `"default"`

**HTML layer only.** The JSP depends on Java-only constructs:

| Blocked feature | Java API | Status |
|---|---|---|
| Paginated child list | `moduleMap.currentList` / `begin` / `end` | No JS equivalent |
| Live-only AJAX load | `moduleMap.liveOnly` + jQuery `.load()` | No JS equivalent |
| Sub-view delegation | `hidden.header` / `hidden.footer` | No JS equivalent |
| Empty-state message | `moduleMap.emptyListMessage` | No JS equivalent |

The JS view iterates all direct children via `currentNode.getNodes()` and renders
each via `<Render>`. Edit-mode drop zone uses `<Area name="*">`. The clearfix div
is present in edit mode only, mirroring the JSP.

---

### Privacy Settings Modal — `PrivacySettingsModal/bootstrap5.server.tsx`

**Registers:** `wemnt:privacySettingsModal` / `"bootstrap5"`

WEM (Jahia Experience Manager) GDPR privacy modal. Full HTML structure implemented
(trigger button/link, Bootstrap modal, consent tabs, settings panel) with complete
rendering parity to the JSP.

**Pending WEM JS integration:**

| Feature | WEM API | Status |
|---|---|---|
| Privacy instance init | `manageWemPrivacy.createInstance(...)` | No JS equivalent |
| Profile download | `wem.downloadMyProfile()` | No JS equivalent |
| Profile anonymize | `wem.anonymizeProfile(...)` | No JS equivalent |
| Private browsing toggle | `wem.togglePrivateBrowsing(...)` | No JS equivalent |
| Consent types URL | `url.context + url.baseLive + site.path` | No JS equivalent |

The trigger and modal render correctly; interactive behaviour requires
`wem-manage-privacy.js` to be loaded and `manageWemPrivacyInstances[id]` to be
initialised (via an inline AddResources script, once the URL APIs are available).

---

## Page template views (`jnt:template`)

Bootstrap 5 page templates are rendered via `jnt:template` views. Unlike content components (which render a fragment inside an existing page), template views produce the full `<html>` document shell.

Template TSX files live in `src/templates/` rather than `src/components/` to make the distinction clear at a glance. The `@jahia/vite-plugin` scans `src/**/*.server.tsx`, so they are picked up automatically.

| View name | File | Replaces |
|---|---|---|
| `bootstrap5-templates-starter` | `src/templates/bootstrap5-templates-starter.server.tsx` | `template.bootstrap5-templates-starter.jsp` |
| `bootstrap5-templates-starter.sticky-footer` | `src/templates/bootstrap5-templates-starter.sticky-footer.server.tsx` | `template.bootstrap5-templates-starter.sticky-footer.jsp` |

### Registering a template view

```tsx
jahiaComponent(
  {
    nodeType: "jnt:template",
    name: "bootstrap5-templates-starter",   // must match j:view on the jnt:template node
    displayName: "Bootstrap 5 Starter",
    componentType: "view",
  },
  function TemplateView() {
    const { renderContext, currentNode } = useServerContext();
    // …
    return (
      <html lang={language}>
        <head>…</head>
        <body>
          <Area path="header" areaAsSubNode={true} moduleType="absoluteArea" level={0} />
          <Area path="pagecontent" areaAsSubNode={true} />
          <Area path="footer" areaAsSubNode={true} moduleType="absoluteArea" level={0} />
        </body>
      </html>
    );
  }
);
```

### RTL detection

`isRtlLanguage(language)` in `src/utils/rtl.ts` mirrors `Functions.java#isRtlLanguage`. It checks Unicode block ranges (Arabic, Hebrew, Syriac, Thaana, N'Ko, …) rather than a hardcoded list of language codes, so regional variants work without changes.

### `<!DOCTYPE html>`

React has no JSX node for the doctype. Jahia's JS rendering framework prepends `<!DOCTYPE html>` from the HTTP `Content-Type` response, equivalent to what the JSP `<%@ page contentType="text/html;charset=UTF-8" %>` directive produces.

### Bootstrap JS placement

`bootstrap.bundle.min.js` is injected in `<head>` during edit mode (Jahia editing infrastructure requirement) and at the end of `<body>` in live/preview mode (performance default):

```tsx
{isEditMode
  ? <AddResources type="javascript" resources="bootstrap.bundle.min.js" targetTag="head" />
  : <AddResources type="javascript" resources="bootstrap.bundle.min.js" targetTag="body" />
}
```

---

## Open questions (validation needed before production)

| ID | Component | Issue |
|---|---|---|
| OQ-01 | Alert | `nodeType: "jmix:skinnable"` for mixin skin view — is this correct? |
| OQ-02 | Pagination | Bound component resolution + pager state — no JS equivalent known |
| OQ-05 | Navbar | `ui:loginArea` equivalent — login form `action` URL |
| OQ-06 | Navbar | `siteNode.getLanguages?.()` — confirm API |
| OQ-07 | Navbar | Language switch URL pattern |
| OQ-09 | Breadcrumb | `url.base` accessor |
| OQ-10 | Breadcrumb | `jcr:findDisplayableNode` equivalent |
| OQ-11 | Card, Carousel | `getProperty("image").getNode?.()` weakref API |
| OQ-12 | Grid | `<Area moduleType="absoluteArea" level={n}>` — supported? |
| OQ-13 | Grid | `<Area listLimit={n}>` — supported? |

OQ-01 and OQ-02 block production deployment. The rest degrade output without
preventing rendering.

---

## Adding a new component

1. **Read the JSP** in `bootstrap5-components/src/main/resources/bootstrap5nt_foo/html/foo.jsp`.
2. Create `src/components/Foo/default.server.tsx`.
3. Write a `jahiaComponent()` registration and a TypeScript interface for props.
4. Map JSP constructs to JS equivalents:

| JSP | JS |
|---|---|
| `currentNode.properties.x.string` | prop `x` in the interface |
| `jcr:isNodeType(currentNode, 'mixin')` | `currentNode.isNodeType("mixin")` |
| `jcr:getChildrenOfType(node, 'type')` | `getChildNodes(node, "type")` |
| `template:module node="${child}"` | `<Render content={child} />` |
| `c:forEach + template:module` (all children) | `<RenderChildren />` |
| `template:area path="x"` | `<Area name="x" nodeTypes="..." />` |
| `template:include view="hidden.bar"` | Inline the sub-view logic directly |
| `renderContext.editMode` | `renderContext.isEditMode()` |
| `fn:escapeXml(str)` | React escapes text by default — use `{str}` |
| CKEditor rich-text | `<div dangerouslySetInnerHTML={{ __html: text }} />` |

5. Add a rendering parity checklist comment at the top of the file (see any existing view for the pattern).
6. Run `yarn build` to type-check.

---

[← Back to developer guide](developer-guide.md)
