# Architecture

## Rendering pipeline

```
HTTP request
  └─ Jahia rendering engine
       ├─ Resolves the page template
       │    └─ bootstrap5-templates-starter-js: TemplateView (TSX)
       │         ├─ Renders <html>, <head>, <body>
       │         ├─ Includes Bootstrap CSS/JS from bootstrap5-core
       │         └─ Renders Areas (header, pagecontent, footer)
       │
       └─ For each node in each area, resolves the view
            └─ bootstrap5-js-rendering: component view (TSX)
                 └─ Renders the component HTML
```

All server-side rendering runs inside the **GraalVM polyglot engine**. TypeScript/JSX is compiled to CommonJS by Vite and executed in a Java-hosted JavaScript context.

## Module priority and view resolution

Jahia resolves views by searching modules in dependency order — a module that declares `module-dependencies: X` has higher priority than `X`.

- `bootstrap5-js-rendering` declares `module-dependencies: bootstrap5-core`
- `bootstrap5-templates-starter-js` declares `module-dependencies: bootstrap5-core`

A custom module declaring `module-dependencies: bootstrap5-js-rendering` will override any view from `bootstrap5-js-rendering`.

## GraalVM Java interop constraints

> **Critical:** Calling Java methods from GraalVM JavaScript has specific syntax requirements.

### The `?.()` optional-call problem

GraalVM sends different messages to Java objects depending on call syntax:

| Syntax | GraalVM message | Result |
|--------|----------------|--------|
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

The canonical CND (`META-INF/definitions.cnd`) lives in `bootstrap5-js-rendering`. It owns all `bootstrap5nt:*` node types and `bootstrap5mix:*` mixins.

`bootstrap5-core` owns only `bootstrap5mix:component` (the base marker mixin) and `bootstrap5nt:version`.

When both modules are deployed, Jahia logs a `WARN` for any type already registered. This is harmless — the first-loaded module wins.

## Static assets packaging

The `@jahia/vite-plugin` compiles TypeScript/TSX to `dist/server/index.js`. It does **not** copy static files. Static resources are packaged by listing their directories in the `files` array of `package.json`:

```json
"files": ["dist", "META-INF", "resources", "img", "javascript", "settings", "css"]
```

npm pack then includes all listed directories verbatim in the TGZ.
