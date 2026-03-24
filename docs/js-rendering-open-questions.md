# Open Questions — JS Rendering Module

Centralised list of all integration points that require validation with the
**Jahia JS engine team** before the module can be considered production-ready.
All of these are documented with `⚠️` comments in the source files.

Each item lists: the affected component, the Java construct in the reference JSP,
the approximation used in the JS view, and the question to resolve.

---

## Priority 1 — Blocking (component does not work without resolution)

### OQ-01: Alert mixin view registration
**Component:** `Alert/default.server.tsx`
**Java:** `jmix_skinnable/html/skinnable.skins.alert.jsp` — registered as view `skins.alert` on `jmix:skinnable`
**JS approximation:** `jahiaComponent({ nodeType: "jmix:skinnable", name: "skins.alert", ... })`
**Question:** Is `jmix:skinnable` the correct `nodeType` for registering a mixin skin view via `jahiaComponent()`? Or should it be `jmix:droppableContent` (the host type of `bootstrap5mix:alert`)?
**Issue:** #21

### OQ-02: Pagination — bound component resolution
**Component:** `Pagination/default.server.tsx`
**Java:** `uiComponents:getBindedComponent(currentNode, renderContext, 'j:bindedComponent')` + `template:option` + `template:initPager`
**JS approximation:** Renders edit-mode placeholder; pager state hardcoded
**Question:** Is there a JS equivalent for bound component resolution and pager state initialisation? If not, is Pagination expected to remain Java-only?
**Issue:** #23

---

## Priority 2 — Degraded output (component renders but with reduced fidelity)

### OQ-03: Navbar — login state
**Component:** `Navbar/default.server.tsx`
**Java:** `renderContext.loggedIn`, `currentUser.username`
**JS approximation:** `renderContext.isLoggedIn?.()`, `renderContext.getUser?.().getUsername?.()`
**Question:** Confirm method signatures for login state and current user in the JS server context.

### OQ-04: Navbar — URL generator
**Component:** `Navbar/default.server.tsx`
**Java:** `url.logout`, `url.live`, `url.preview`, `url.edit`, `url.contribute`
**JS approximation:** `renderContext.getURLGenerator?.().getLogout?.()`
**Question:** Confirm `URLGenerator` accessor and method names in the JS context.

### OQ-05: Navbar — login form action
**Component:** `Navbar/default.server.tsx`
**Java:** `ui:loginArea` — wraps `<form>` with the Jahia login POST action
**JS approximation:** `<form action="#">` (non-functional)
**Question:** Is there a JS equivalent for generating the Jahia login form action URL? Or should login remain Java-rendered?

### OQ-06: Navbar — language codes
**Component:** `Navbar/default.server.tsx`
**Java:** `ui:initLangBarAttributes activeLanguagesOnly="${liveMode}"` → `requestScope.languageCodes`
**JS approximation:** `siteNode.getLanguages?.()`
**Question:** Confirm the correct API to retrieve the list of active site languages in the JS server context.

### OQ-07: Navbar — language switch URL
**Component:** `Navbar/default.server.tsx`
**Java:** `<b5:switchToLanguageLink languageCode="${lang}"/>` — custom taglib
**JS approximation:** `${mainNode.getPath()}.${lang}.html`
**Question:** Confirm the correct URL pattern for locale-switched page URLs. Does the JS context expose a helper equivalent to `b5:switchToLanguageLink`?

### OQ-08: Navbar — permission gating
**Component:** `Navbar/default.server.tsx`
**Java:** `jcr:hasPermission(renderContext.mainResource.node, 'jContentAccess')`
**JS approximation:** Workspace-switching links rendered unconditionally
**Question:** Is there a JS API for checking JCR permissions in the server render context?

### OQ-09: Breadcrumb — url.base
**Component:** `Breadcrumb/default.server.tsx`
**Java:** `url.base` (prefix for page URLs, e.g. `/cms/render/default/en`)
**JS approximation:** `""` (empty string — relative URL)
**Question:** Confirm the correct accessor for the URL base prefix in the JS server context.

### OQ-10: Breadcrumb — jcr:findDisplayableNode
**Component:** `Breadcrumb/default.server.tsx`
**Java:** `jcr:findDisplayableNode(pageNode, renderContext)` — returns the node that actually renders for the given node (may differ for virtual nodes)
**JS approximation:** Checks `isNodeType("jnt:page")` as a proxy
**Question:** Is there a JS equivalent for `jcr:findDisplayableNode`? If not, is the `isNodeType("jnt:page")` fallback acceptable?

### OQ-11: Carousel / Card — image weakref resolution
**Components:** `Carousel/default.server.tsx`, `Carousel/carousel-item.server.tsx`, `Card/default.server.tsx`
**Java:** `${currentNode.properties.image.node}` / `${imageNode.url}`
**JS approximation:** `currentNode.getProperty("image")?.getNode?.()` / `imageNode.getUrl?.()`
**Question:** Confirm the method chain for resolving a weakref property to its target node and getting its URL.

### OQ-12: Grid — Area absoluteArea support
**Component:** `Grid/default.server.tsx`
**Java:** `<template:area moduleType="absoluteArea" level="${level}"/>`
**JS approximation:** `<Area name={areaPath} nodeTypes="jmix:droppableContent" />` (absoluteArea props omitted)
**Question:** Does the JS `<Area>` component accept `moduleType` and `level` props for absolute area inheritance?

### OQ-13: Grid — Area listLimit support
**Component:** `Grid/default.server.tsx`
**Java:** `<template:area listLimit="${listLimit}"/>`
**JS approximation:** `<Area name={areaPath} nodeTypes="jmix:droppableContent" />` (listLimit prop omitted)
**Question:** Does the JS `<Area>` component accept a `listLimit` prop?

---

## Priority 3 — Validation (likely correct but unconfirmed)

### OQ-14: getChildNodes nodeType filter
**Used by:** Accordion, Tabs, Carousel, Grid, Navbar
**Question:** Confirm `getChildNodes(node, "jmix:navMenuItem")` filters by mixin type correctly (not just primary node type).

### OQ-15: Navbar — j:displayInMenuName multi-value property
**Component:** `Navbar/default.server.tsx`
**Java:** `level1Page.properties['j:displayInMenuName']` iterated as a list
**JS approximation:** `page.getPropertyValues?.("j:displayInMenuName")`
**Question:** Confirm the API for reading multi-value JCR properties in the JS server context.

### OQ-16: Navbar — renderContext.getSite()
**Component:** `Navbar/default.server.tsx`
**Question:** Confirm the accessor for the site node in the JS server context.

### OQ-17: Breadcrumb — getAncestors() order and completeness
**Component:** `Breadcrumb/default.server.tsx`
**Question:** Confirm `currentNode.getAncestors()` returns nodes from root to direct parent (root first), which the view reverses for breadcrumb display.

---

## Tracking

| ID | Priority | Component | Sprint Issue |
|---|---|---|---|
| OQ-01 | 1 | Alert | #21 |
| OQ-02 | 1 | Pagination | #23 |
| OQ-03–08 | 2 | Navbar | #24 |
| OQ-09–10 | 2 | Breadcrumb | #23 |
| OQ-11 | 2 | Carousel, Card | #24 |
| OQ-12–13 | 2 | Grid | #23 |
| OQ-14–17 | 3 | Navbar, Breadcrumb | #25 |

All Priority 1 items block production deployment. Priority 2 items cause degraded
output but the component still renders. Priority 3 items are likely correct.
