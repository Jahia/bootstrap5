# ADR 001 — JS Rendering Module Architecture

**Status:** Accepted
**Date:** 2026-03-24
**Sprint:** 0

---

## Context

The Bootstrap 5 module for Jahia is currently implemented as a Java/JSP module
(`bootstrap5-components`). The goal is to build a canonical JavaScript reference
implementation that renders the same components using Jahia's JS module system
(GraalVM + React SSR).

This ADR records the architectural decisions that govern how this JS implementation
is structured, what belongs where, and what the hard boundaries are.

---

## Decision 1 — Three-module split

The JS implementation is split across three modules with distinct responsibilities:

| Module | Responsibility | Technology |
|--------|---------------|------------|
| `bootstrap5-content` | CND definitions, fieldsets, labels, editor config | Java (existing) |
| `bootstrap5-js-rendering` | JS/React views and templates | JS / Yarn / Vite |
| `bootstrap5-support` | Java initializers (mixin injectors, taglibs) | Java (existing, referenced) |

### Rationale

- The CND (`bootstrap5nt:*`, `bootstrap5mix:*`) already exists and is stable.
  It must not be duplicated or re-declared in the JS module.
- The Java initializers (`ButtonTypeInitializer`, `GridTypeInitializer`,
  `NavbarRootInitializer`) contain business logic that injects mixins at save
  time. This logic stays in Java — it has no equivalent in the JS rendering layer.
- The rendering layer has a single concern: given a JCR node with its properties,
  produce correct HTML. No content mutation, no business logic.

### Consequence

`bootstrap5-js-rendering/package.json` must declare:

```json
"jahia": {
  "module-dependencies": "bootstrap5-components,bootstrap5-support"
}
```

---

## Decision 2 — SSR first, Islands only when proven necessary

Every component renders server-side by default. No JS is sent to the browser
unless a specific interactive behaviour is explicitly required and cannot be
achieved with CSS or HTML alone.

### Classification

| Rendering mode | Criterion | Components |
|----------------|-----------|------------|
| SSR only | No user interaction needed | Text, Figure, Breadcrumb, Card, Grid, Alert, Button (link types) |
| Island required | User interaction or browser API | Accordion, Tabs, Carousel, Navbar (mobile toggle), Button (modal, collapse, popover, offcanvas) |

### Rationale

The Bootstrap 5 JS bundle (`bootstrap.bundle.min.js`) handles interaction through
`data-bs-*` attributes. For components that only use these attributes (accordion,
tabs), the pattern is: SSR renders the correct HTML + data attributes, Bootstrap JS
initialises on `DOMContentLoaded`. No React island is needed.

The only cases that require a React island are:
- State that must survive re-renders (e.g. a counter, a form)
- Browser-only APIs (`window`, `document`, `navigator`)
- Interaction that cannot be described declaratively via `data-bs-*`

---

## Decision 3 — Component-per-folder structure

Each view lives in its own folder under `src/components/`:

```
src/components/
  Button/
    definition.cnd        ← not redeclared, kept as reference only
    default.server.tsx    ← SSR view registered via jahiaComponent()
    Button.client.tsx     ← only if an Island is required
    component.module.css  ← optional scoped CSS
```

The folder name matches the node type suffix (e.g. `Button` for `bootstrap5nt:button`).

### Rationale

This mirrors the pattern from the Jahia hydrogen reference sample. One folder =
one component = everything needed to understand and copy it.

---

## Decision 4 — View registration via jahiaComponent()

Views are registered using the `jahiaComponent()` function from
`@jahia/javascript-modules-library`. The `registry.add()` API from
`@jahia/ui-extender` is for admin UI extensions only and must not be used here.

```tsx
import { jahiaComponent } from "@jahia/javascript-modules-library";

jahiaComponent(
  {
    nodeType: "bootstrap5nt:button",
    componentType: "view",
    name: "default",
  },
  (props, { renderContext }) => { /* ... */ },
);
```

JCR node properties are passed directly as React props. No manual `getNodeProps()`
call is needed for standard property reads.

---

## Decision 5 — Mixin-driven components require explicit type switching

Several components use Java mixin injectors to change their structure at save time
(Button, Grid, Navbar). The JSX view must check node type at render time and branch
accordingly — the same way the JSP does it today.

```tsx
import { useServerContext } from "@jahia/javascript-modules-library";

jahiaComponent(
  { nodeType: "bootstrap5nt:button", componentType: "view" },
  ({ buttonType, ...props }, _ctx) => {
    // Branch on buttonType, check mixin presence via currentNode.isNodeType()
    switch (buttonType) {
      case "internalLink": return <ButtonInternalLink {...props} />;
      case "externalLink": return <ButtonExternalLink {...props} />;
      case "modal":        return <ButtonModal {...props} />;
      // ...
    }
  },
);
```

---

## Decision 6 — No duplication of JSP logic during migration

The JS views are a faithful reproduction of the JSP output. No new features,
no refactoring, no renames. The goal is rendering parity, not improvement.
Improvements are a separate concern and belong in a later phase.

---

## Non-decisions (deferred)

- **Template layer**: Page templates (`jnt:page`) are out of scope for this sprint
  series. The JS rendering module covers content components only.
- **i18n editor labels**: `.properties` files stay in `bootstrap5-components`.
  The JS module uses `react-i18next` only for static UI strings in views (e.g.
  edit-mode hints), not for content.
- **bootstrap5-support module creation**: The existing Java initializers stay in
  `bootstrap5-components` for now. A separate `bootstrap5-support` module is
  deferred until the JS rendering module is stable.
