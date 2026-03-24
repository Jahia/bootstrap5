# How to Build a Component — JS Rendering Guide

> Target: a new developer should be able to add a working SSR view in under 1 hour.

---

## Overview

`bootstrap5-js-rendering` is a Jahia JS module that registers React SSR views for
Bootstrap 5 node types. Views are pure server-side React functions — no browser JS
is required for rendering. Bootstrap 5's `data-bs-*` attributes handle all
interactive behaviour (collapse, dropdowns, modals, carousel) without any React
islands.

The module has **one job**: take JCR node properties → emit correct Bootstrap 5 HTML.

---

## Folder layout

```
bootstrap5-js-rendering/
├── src/
│   ├── components/
│   │   └── MyComponent/
│   │       └── default.server.tsx   ← SSR view (required)
│   │       └── other-view.server.tsx ← additional named view (optional)
│   │       └── my-component.client.tsx ← browser island (rare, see islands guide)
│   └── utils/
│       └── image.tsx                ← shared ImageTag helper
├── package.json
├── vite.config.js
└── tsconfig.json
```

All `*.server.tsx` files are automatically bundled into `dist/server/index.js` by
`@jahia/vite-plugin`. Each file must call `jahiaComponent()` to register its view.

---

## Step 1 — Identify the node type

Find the node type in the CND:

```
bootstrap5-components/src/main/resources/META-INF/definitions.cnd
bootstrap5-core/src/main/resources/META-INF/definitions.cnd
```

Note:
- **`bootstrap5nt:foo`** — standalone component with a `default` view
- **`jmix:foo`** — mixin; use the mixin's host node type as the `nodeType`
  (e.g. `jmix:skinnable` for the alert skin view `skins.alert`)

---

## Step 2 — Read the reference JSP

Find the matching JSP in `bootstrap5-components/src/main/resources/`:

```
bootstrap5nt_foo/html/foo.jsp
```

Read it carefully. Note:
- Which properties are read directly (`currentNode.properties.x.string`)
- Which mixins gate conditional logic (`jcr:isNodeType(currentNode, 'bootstrap5mix:bar')`)
- Whether child nodes are iterated (`jcr:getChildrenOfType`)
- Whether sub-views are included (`template:include view="hidden.bar"`)
- Whether Java-only constructs are used (taglibs, moduleMap, request params)

---

## Step 3 — Create the view file

Create `src/components/MyComponent/default.server.tsx`:

```tsx
/**
 * bootstrap5nt:myComponent — SSR view
 *
 * Rendering parity checklist (from myComponent.jsp):
 *   [x] <div class="..."> wrapper
 *   [x] title from jcr:title
 *   ...
 */
import { jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";

interface MyComponentProps {
  "jcr:title"?: string;
  someProperty?: string;
}

jahiaComponent(
  {
    nodeType: "bootstrap5nt:myComponent",
    componentType: "view",
    name: "default",
    displayName: "My Component",
  },
  ({ "jcr:title": title, someProperty }: MyComponentProps) => {
    const { currentNode, renderContext } = useServerContext();

    return (
      <div className="my-component">
        {title && <h2>{title}</h2>}
      </div>
    );
  },
);
```

---

## Step 4 — Map JSP constructs to JS equivalents

| JSP construct | JS equivalent |
|---|---|
| `currentNode.properties.foo.string` | prop `foo` in interface (auto-resolved by Jahia) |
| `currentNode.properties.foo.boolean` | prop `foo?: boolean` |
| `currentNode.properties.foo.node` | prop `foo?: JCRNodeWrapper` |
| `jcr:isNodeType(currentNode, 'mix:bar')` | `currentNode.isNodeType("mix:bar")` |
| `currentNode.getPropertyAsString("x")` | `currentNode.getPropertyAsString("x")` |
| `jcr:getChildrenOfType(currentNode, 'ns:foo')` | `getChildNodes(currentNode, "ns:foo")` |
| `c:forEach items="${children}"` | `.map((child) => ...)` |
| `template:module node="${child}"` | `<Render content={child} />` |
| `c:forEach + template:module` (all children) | `<RenderChildren />` |
| `template:area path="main"` | `<Area name="main" nodeTypes="jmix:droppableContent" />` |
| `template:include view="hidden.bar"` | Inline the sub-view logic directly in the TSX file |
| `template:addResources type="inline"` | `<AddResources type="inline" targetTag="body" inlineResource="<script>...</script>" />` |
| `renderContext.editMode` | `renderContext.isEditMode()` |
| `renderContext.mainResource.node` | `mainNode` from `useServerContext()` |
| `fn:escapeXml(str)` | React escapes text by default; use `{str}` not `dangerouslySetInnerHTML` |
| CKEditor rich-text property | `<div dangerouslySetInnerHTML={{ __html: text }} />` |

### Mixin-gated properties

When a property only exists if a mixin is present:

```tsx
let extraClass = "";
if (currentNode.isNodeType("bootstrap5mix:myAdvancedSettings")) {
  extraClass = currentNode.getPropertyAsString("cssClass") ?? "";
}
```

### "default" sentinel values

Many choice-list properties store `"default"` when no explicit value is chosen.
Strip it the same way the JSP does:

```tsx
const align = someValue === "default" ? "" : someValue;
```

---

## Step 5 — Handle sub-view delegation

JSP uses `template:include view="hidden.bar"` to include a sub-view. JS modules
have no equivalent mechanism. **Inline the sub-view logic directly in the parent
TSX file** as a local function or helper component.

Example — Grid consolidates 3 hidden sub-view JSPs into one function:

```tsx
const GridColumns = (): JSX.Element => {
  if (isPredefined) { /* predefinedGrid logic */ }
  if (isCustom)     { /* customGrid logic */ }
  /* nogrid logic */
};
```

---

## Step 6 — Edit-mode drop zones

Add `<Area>` for any location where editors should be able to drop content:

```tsx
{/* Edit-mode drop zone */}
<Area name="content" nodeTypes="jmix:droppableContent" />
```

For lists with existing children (JSP: `jcr:getChildrenOfType` + `template:area path="*"`):

```tsx
{/* Render existing children */}
{children.map((child) => <Render key={child.getIdentifier()} content={child} />)}
{/* Drop zone for new children in edit mode */}
{renderContext.isEditMode() && <Area name="*" nodeTypes="jmix:droppableContent" />}
```

---

## Step 7 — Inline scripts

Use `<AddResources>` to inject Bootstrap init scripts. In most cases this is
**not needed** — Bootstrap 5 initialises components from `data-bs-*` attributes
automatically. Only needed for manual init (e.g. Popover which requires explicit JS):

```tsx
import { AddResources } from "@jahia/javascript-modules-library";

const INIT_SCRIPT = `
document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => {
  new bootstrap.Popover(el);
});
`.trim();

// Inside the component:
<AddResources
  type="inline"
  targetTag={renderContext.isEditMode() ? "head" : "body"}
  inlineResource={`<script>${INIT_SCRIPT}</script>`}
/>
```

---

## Step 8 — Image rendering

Use the shared `ImageTag` helper for any component that renders an image via
`bootstrap5mix:imageAdvanced` or `bootstrap5mix:imageAdvancedSettings`:

```tsx
import { ImageTag } from "../../utils/image.js";

<ImageTag
  node={currentNode}
  imageNode={image}          // JCRNodeWrapper from weakref prop
  callerClass="my-img-class"
/>
```

`ImageTag` handles all `bootstrap5mix:imageAdvancedSettings` mixin options
(responsive, thumbnail, border-radius, alignment, alt text, etc.).

---

## Checklist before committing

- [ ] `jahiaComponent()` call has correct `nodeType`, `componentType`, `name`, `displayName`
- [ ] Interface lists all props with correct types (`string`, `boolean`, `JCRNodeWrapper`)
- [ ] Mixin-gated properties are checked with `currentNode.isNodeType()`
- [ ] `"default"` sentinels are stripped from class/style values
- [ ] Edit-mode `<Area>` drop zones are present where needed
- [ ] No dead props, no unused imports
- [ ] File-top comment has rendering parity checklist with `[x]` for each JSP feature
- [ ] If Java-only constructs are used, they are marked with `⚠️` TODO comments

---

## Running a build check

```bash
cd bootstrap5-js-rendering
yarn         # first time only
yarn build   # type-check + bundle
```

A successful build means all `*.server.tsx` files are registered and type-correct.
The output is `dist/server/index.js`.

---

## Common pitfalls

| Pitfall | Correct approach |
|---|---|
| Using `registry.add()` from `@jahia/ui-extender` | Use `jahiaComponent()` from `@jahia/javascript-modules-library` |
| Trying to pass params to `<Render>` | No param mechanism — access node properties directly via `getChildNodes` |
| Conditional open/close JSX tags | Extract content into a variable and wrap conditionally: `condition ? <div>{content}</div> : content` |
| Multi-value JCR property as string | Use `getPropertyValues("x")` and iterate, not `getPropertyAsString("x")` |
| Image URL via `imageNode.url` (JSP) | Use `imageNode.getUrl?.()` in JS (validate API) |
