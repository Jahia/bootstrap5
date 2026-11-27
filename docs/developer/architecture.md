# Architecture

## Rendering pipeline

```
HTTP request
  └─ Jahia rendering engine
       ├─ Resolves the page template
       │    └─ bootstrap5-templates-starter: TemplateStarterView (TSX)
       │         ├─ Renders <html>, <head>, <body>
       │         ├─ Includes Bootstrap CSS/JS from bootstrap5-core
       │         └─ Renders Areas (header, pagecontent, footer)
       │
       └─ For each node in each area, resolves the view
            └─ bootstrap5-components: component view (TSX)
                 └─ Renders the component HTML
```

All server-side rendering runs inside the **Jahia JavaScript modules engine** (`javascript-modules-engine`, shipped with Jahia 8.2.3 and later; its JavaScript runtime is GraalJS). The modules do not install or embed it. TypeScript/JSX is compiled by Vite into `dist/server/index.js` and executed in a Java-hosted JavaScript context.

## Module priority and view resolution

Jahia resolves views by searching modules in dependency order — a module that declares `module-dependencies: X` has higher priority than `X`.

- `bootstrap5-components` declares `module-dependencies: bootstrap5-core`
- `bootstrap5-templates-starter` declares `module-dependencies: bootstrap5-core, bootstrap5-components`

A custom module declaring `module-dependencies: bootstrap5-components` will override any view from `bootstrap5-components`.

## JS engine Java interop constraints

> **Critical:** Calling Java methods from the JS engine has specific syntax requirements. These apply to the engine shipped with Jahia 8.2.3 and later.

### The `?.()` optional-call problem

The JS engine sends different messages to Java objects depending on call syntax:

| Syntax | Engine message | Result |
|--------|---------------|--------|
| `obj.method()` | `invoke` | ✅ Works |
| `obj.method?.()` | `execute` on stored member | ❌ `TypeError: Message not supported` |

**Rule:** Never use `?.()` optional-call syntax on Java method references. Use an explicit null guard instead:

```tsx
// ❌ WRONG — fails at runtime
const lang = renderContext.getMainResourceLocale?.()?.getLanguage?.();

// ✅ CORRECT
const locale = renderContext.getMainResourceLocale();
const lang = locale ? String(locale.getLanguage()) : "en";
```

### Other Java interop patterns

```tsx
// Boolean coercion from Java boolean
const isEdit = renderContext.isEditMode() as unknown as boolean;

// String coercion from Java String/Object
const url = String(node.getPath());

// Methods not on the TypeScript type but valid at runtime
const home = (siteNode as any).getHome() as JCRNodeWrapper;
const languages = (siteNode as any).getLanguages();

// Weakref property chain — always null-guard
const imageProp = node.getProperty("image");
const imageNode = imageProp ? imageProp.getNode() as JCRNodeWrapper : undefined;
```

## Component registration

Every TSX view file exports exactly one component registered with `jahiaComponent`:

```tsx
import { jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";

jahiaComponent(
  {
    nodeType: "bootstrap5nt:accordion",
    name: "default",        // view name — must match j:view in the template or CND
    componentType: "view",
    displayName: "Accordion",
  },
  function AccordionView() {
    const { currentNode } = useServerContext();
    // ...
    return <div>...</div>;
  }
);
```

There is no hand-written entry file: the `@jahia/vite-plugin` collects every `src/**/*.server.{jsx,tsx}` file into `dist/server/index.js`, the `server` entry declared in `package.json`.

## CND and module ownership

`bootstrap5-components` owns all `bootstrap5nt:*` node types and `bootstrap5mix:*` mixins. Definitions are split across two locations:

- **`settings/definitions.cnd`** — namespaces and cross-component shared mixins (image, padding, margin)
- **`src/components/<Name>/definition.cnd`** — one file per component (14 files; `List` has none)

`bootstrap5-core` owns only `bootstrap5mix:component` (the base marker mixin) and `bootstrap5nt:version` (`bootstrap5-core/src/main/resources/META-INF/definitions.cnd`).

## react-bootstrap

`react-bootstrap` is a **devDependency** — it is compiled into `dist/server/index.js` by Vite and not loaded at runtime by Jahia. It is used selectively for a small number of components where it adds clear value without introducing Jahia-specific compatibility issues.

**Components that use react-bootstrap:** `Breadcrumb`, `Button`, `Card`, `Figure`.

**Components that use plain Bootstrap 5 HTML:** `Accordion`, `Alert`, `Carousel`, `Navbar`, `Tabs`, and all layout components. These were rewritten to plain HTML to avoid two categories of issues:

- `<a href="#">` rendered by react-bootstrap navigation components is intercepted by Jahia's edit-frame link interceptor in edit mode (e.g. `Nav.Link` in Tabs → replaced with `<button data-bs-toggle="tab">`).
- Extra wrapper elements and class names injected by react-bootstrap components that conflict with Bootstrap 5 CSS or with the expected DOM structure in Jahia tests.

**Rule for new components:** Use plain Bootstrap 5 HTML by default. Only reach for react-bootstrap for purely presentational components (e.g. `Figure`, `Card`) where no Jahia edit-mode interactivity is involved.

## Static assets packaging

The `@jahia/vite-plugin` compiles TypeScript/TSX to `dist/server/index.js`. It does **not** copy static files. Static resources are packaged by listing their directories in the `files` array of `package.json`:

```json
"files": ["dist/server", "src/**/*.cnd", "settings", "META-INF", "resources", "img", "javascript"]
```

`src/**/*.cnd` includes all per-component `definition.cnd` files. `META-INF` contains the Content Editor forms JSON. npm pack includes all listed paths verbatim in the TGZ.

## Known limitations

### `Area` has no `areaAsSubNode` equivalent

**Upstream issue:** [Jahia/jahia-private#4894](https://github.com/Jahia/jahia-private/issues/4894)

In the JSP rendering stack, `<template:area areaAsSubNode="true" />` stores the area's content as a child of the *component node* rather than the *page node*. This makes area content shared across all pages that inherit the component (e.g. a grid placed inside a template-level `AbsoluteArea` footer).

`@jahia/javascript-modules-library` has no such option (checked on 1.3.1, see `src/utils/sub-node-area.tsx`):

- `<Area name="foo" />` always stores content under the *current page node*, so each page gets its own independent content.
- `<AbsoluteArea parent={node} name="foo" />` anchors to a fixed parent node, but it carries additional semantics: it always inherits content from the parent page downward, and the parent node must already exist in the repository.

**Current solution:** the `SubNodeArea` helper (`src/utils/sub-node-area.tsx`) resolves the parent of the list as `areaAsSubNode` did in 2.x (the component itself when it already holds the area or belongs to the site content, the page displayed when the component comes from a page template) and renders an `AbsoluteArea` anchored on it. The Grid, and the free footer of the Card, use it. With `bootstrap5mix:createAbsoluteAreas`, the Grid anchors its column areas on the ancestor page of the chosen level instead (`absoluteAreaAnchor` in `src/components/Grid/default.server.tsx`): the content is shared by every page below that ancestor and editable on the ancestor page only.

**Limitation:** the helper covers the Grid and the Card footer only. A proper `areaAsSubNode` prop on `Area` requires an upstream fix in `@jahia/javascript-modules-library`.
