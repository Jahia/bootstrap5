# Architecture

## Rendering pipeline

```
HTTP request
  └─ Jahia rendering engine
       ├─ Resolves the page template
       │    └─ bootstrap5-templates-starter: TemplateView (TSX)
       │         ├─ Renders <html>, <head>, <body>
       │         ├─ Includes Bootstrap CSS/JS from bootstrap5-core
       │         └─ Renders Areas (header, pagecontent, footer)
       │
       └─ For each node in each area, resolves the view
            └─ bootstrap5-components: component view (TSX)
                 └─ Renders the component HTML
```

All server-side rendering runs inside the **Jahia JavaScript modules engine** (GraalVM on Jahia ≤ 8.2.2, OpenJDK-based engine on 8.2.3+). TypeScript/JSX is compiled to CommonJS by Vite and executed in a Java-hosted JavaScript context.

## Module priority and view resolution

Jahia resolves views by searching modules in dependency order — a module that declares `module-dependencies: X` has higher priority than `X`.

- `bootstrap5-components` declares `module-dependencies: bootstrap5-core`
- `bootstrap5-templates-starter` declares `module-dependencies: bootstrap5-core`

A custom module declaring `module-dependencies: bootstrap5-components` will override any view from `bootstrap5-components`.

## JS engine Java interop constraints

> **Critical:** Calling Java methods from the JS engine has specific syntax requirements. These apply to both GraalVM (Jahia ≤ 8.2.2) and the OpenJDK-based engine (Jahia 8.2.3+).

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

The entry point `src/index.ts` (compiled to `dist/server/index.js`) imports all component files.

## CND and module ownership

`bootstrap5-components` owns all `bootstrap5nt:*` node types and `bootstrap5mix:*` mixins. Definitions are split across two locations:

- **`settings/definitions.cnd`** — namespaces and cross-component shared mixins (image, padding, margin)
- **`src/components/<Name>/definition.cnd`** — one file per component (12 files)

`bootstrap5-core` owns only `bootstrap5mix:component` (the base marker mixin) and `bootstrap5nt:version`.

## Static assets packaging

The `@jahia/vite-plugin` compiles TypeScript/TSX to `dist/server/index.js`. It does **not** copy static files. Static resources are packaged by listing their directories in the `files` array of `package.json`:

```json
"files": ["dist/server", "src/**/*.cnd", "settings", "META-INF", "resources", "img", "javascript"]
```

`src/**/*.cnd` includes all per-component `definition.cnd` files. `META-INF` contains the Content Editor forms JSON. npm pack includes all listed paths verbatim in the TGZ.
