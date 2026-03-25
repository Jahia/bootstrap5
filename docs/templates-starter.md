# Bootstrap 5 Templates Starter

The `bootstrap5-templates-starter` module is a **ready-to-run template set** for Jahia. Its goal is twofold: get you up and running with a working Bootstrap 5 site in minutes, and serve as a reference starting point when you build your own custom template set.

---

## What's included

Two page templates, both fully Bootstrap 5 and RTL-ready:

| Template | When to use it |
|---|---|
| **Starter** | Standard layout — the default for most pages |
| **Sticky Footer** | Same layout, but the footer sticks to the bottom of the viewport when the page content is short |

Both templates share the same three-area structure:

```
┌─────────────────────────────────┐
│           Header area           │  ← absolute (shared across all pages)
├─────────────────────────────────┤
│                                 │
│         Page content area       │  ← per-page content
│                                 │
├─────────────────────────────────┤
│           Footer area           │  ← absolute (shared across all pages)
└─────────────────────────────────┘
```

---

## Template areas

### Header and footer — absolute areas

The `header` and `footer` areas are **absolute areas at level 0**, meaning they pull their content from the **home page**, regardless of which page is currently being viewed. Edit their content once on the home page and it appears everywhere.

> In edit mode, absolute areas are highlighted in **red**. If you try to edit them from a subpage, Jahia reminds you to go to the home page to modify the shared content.

### Page content — per-page area

The `pagecontent` area is the main content zone. Each page has its own independent content here.

---

## The Starter template

The default template. Clean and minimal — Bootstrap assets, three areas, and nothing else.

```html
<!DOCTYPE html>
<html lang="fr">               <!-- lang is set dynamically from Jahia locale -->
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page title</title>
  <link rel="stylesheet" href="bootstrap.min.css">
</head>
<body>
  <!-- Shared header (from home page) -->
  <template:area path="header" moduleType="absoluteArea" level="0"/>

  <!-- Per-page content -->
  <template:area path="pagecontent"/>

  <!-- Shared footer (from home page) -->
  <template:area path="footer" moduleType="absoluteArea" level="0"/>

  <script src="bootstrap.bundle.min.js"></script>
</body>
</html>
```

Bootstrap JS is loaded at the **end of `<body>`** for performance. In edit mode it is moved to `<head>` as required by Jahia's editing infrastructure.

---

## The Sticky Footer template

Identical to the Starter template, with one addition: the footer is always pinned to the bottom of the viewport when the page content doesn't fill the full height. This uses pure Bootstrap 5 flex utilities — no custom CSS needed.

```html
<html class="h-100">
<body class="d-flex flex-column h-100">

  <template:area path="header" .../>

  <main class="flex-shrink-0">
    <template:area path="pagecontent"/>
  </main>

  <footer class="mt-auto">
    <template:area path="footer" .../>
  </footer>

</body>
</html>
```

How it works:
- `h-100` on `<html>` and `<body>` makes the page fill the full viewport height
- `d-flex flex-column` on `<body>` stacks header, main, and footer vertically
- `flex-shrink-0` on `<main>` prevents the content from compressing
- `mt-auto` on `<footer>` pushes it to the bottom when there's leftover space

---

## RTL support

Both templates automatically detect right-to-left languages (Arabic, Hebrew, Persian, and others) and adapt accordingly:

- `dir="rtl"` is added to the `<html>` element
- Bootstrap's RTL stylesheet (`bootstrap.rtl.min.css`) is loaded instead of the standard one

This uses the `b5:isRtlLanguage()` function from the Bootstrap 5 custom taglib:

```jsp
<c:set var="language" value="${renderContext.mainResourceLocale.language}"/>
<html lang="${language}" ${b5:isRtlLanguage(language) ? 'dir="rtl"' : ''}>
```

No configuration needed — it works automatically as soon as a site has an RTL language enabled.

---

## Using the starter as a base for your own template set

The starter is intentionally minimal so it's easy to copy and extend. The typical approach:

1. **Copy the module** — duplicate `bootstrap5-templates-starter` into a new module in your project
2. **Rename** — update `artifactId`, `Jahia-Module-Type`, and `Jahia-Depends` in `pom.xml`
3. **Add your templates** — create new JSP files in `src/main/resources/jnt_template/html/`
4. **Register them** — declare them in `src/main/import/repository.xml`
5. **Add your CSS** — global styles, custom variables, overrides

You keep full access to the Bootstrap 5 components, the `b5:` taglib, and the RTL detection — they all come from `bootstrap5-components` which you inherit as a dependency.

### Minimal custom template

```jsp
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="b5"       uri="http://www.jahia.org/b5" %>
<%@ taglib prefix="c"        uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page contentType="text/html;charset=UTF-8" %>
<c:set var="language" value="${renderContext.mainResourceLocale.language}"/>
<!DOCTYPE html>
<html lang="${language}" ${b5:isRtlLanguage(language) ? 'dir="rtl"' : ''}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${renderContext.mainResource.node.displayableName}</title>
  <template:addResources type="css" resources="${b5:isRtlLanguage(language)
      ? 'bootstrap.rtl.min.css' : 'bootstrap.min.css'}"/>
  <c:if test="${renderContext.editMode}">
    <template:addResources type="css" resources="starter-edit.css"/>
  </c:if>
</head>
<body>
  <template:area path="header"      areaAsSubNode="true" moduleType="absoluteArea" level="0"/>
  <template:area path="pagecontent" areaAsSubNode="true"/>
  <template:area path="footer"      areaAsSubNode="true" moduleType="absoluteArea" level="0"/>
  <template:addResources type="javascript" resources="bootstrap.bundle.min.js"
      targetTag="${renderContext.editMode ? 'head' : 'body'}"/>
</body>
</html>
```

### Declaring a template in `repository.xml`

```xml
<bootstrap5-templates-starter j:isModuleTemplate="true" jcr:primaryType="jnt:module">
  <templates jcr:primaryType="jnt:templatesFolder" j:rootTemplateName="base">
    <base jcr:primaryType="jnt:template" j:view="mymodule">
      <mytemplate
          jcr:primaryType="jnt:pageTemplate"
          jcr:title="My custom template"
          j:view="mymodule.mytemplate"/>
    </base>
  </templates>
</bootstrap5-templates-starter>
```

The `j:view` value on `jnt:pageTemplate` maps to the JSP file name:
`template.{j:view}.jsp` → `template.mymodule.mytemplate.jsp`

---

## Edit mode CSS

The file `starter-edit.css` contains one rule that prevents the navbar from overflowing its container in Jahia's GXT editing interface:

```css
.navbar .jahia-template-gxt {
    margin-bottom: 0 !important;
}
```

When building your own template, carry this file along — you'll likely need it.

---

## JS Rendering

Both page templates are implemented in `bootstrap5-js-rendering` as full-page SSR components.

| View name | Source file |
|---|---|
| `bootstrap5-templates-starter` | `bootstrap5-js-rendering/src/templates/bootstrap5-templates-starter.server.tsx` |
| `bootstrap5-templates-starter.sticky-footer` | `bootstrap5-js-rendering/src/templates/bootstrap5-templates-starter.sticky-footer.server.tsx` |

**nodeType:** `jnt:template`

Both files are placed under `src/templates/` rather than `src/components/` to make the distinction between page-level templates and content fragments visually clear. The `@jahia/vite-plugin` scans `src/**/*.server.tsx` so they are discovered automatically.

### RTL detection

The `b5:isRtlLanguage()` EL function from `bootstrap5-components` is replicated in TypeScript as `isRtlLanguage()` in `bootstrap5-js-rendering/src/utils/rtl.ts`. The implementation uses the same strategy as `Functions.java`: it checks Unicode block ranges rather than maintaining a hardcoded list of language codes, so regional variants (`ar-SA`, `he-IL`, `fa-IR`, …) are handled automatically.

### Doctype

The JSP templates output `<!DOCTYPE html>` via the `<%@ page contentType="text/html;charset=UTF-8" %>` directive. In React SSR there is no equivalent JSX node for the doctype; Jahia's JS rendering framework is expected to prepend it based on the HTTP `Content-Type`. The template component returns `<html>` as its root element.

### Bootstrap JS position

The `bootstrap.bundle.min.js` script is placed in `<head>` when `renderContext.isEditMode()` is true (required by Jahia's editing infrastructure) and at the end of `<body>` otherwise (performance default), exactly mirroring the JSP `targetTag="${renderContext.editMode?'head':'body'}"` attribute.

### Building a custom template set with JS views

When creating a custom template set that replaces `bootstrap5-templates-starter`:

1. Keep the `repository.xml` / `jnt:template` hierarchy in a Maven `templatesSet` module (this is required by Jahia)
2. Declare new JS views in your JS rendering module by registering `jahiaComponent` entries with `nodeType: "jnt:template"` and the `name` matching the `j:view` value on your `jnt:template` / `jnt:pageTemplate` nodes
3. Add your JS rendering module as an additional `Jahia-Depends` in the template set's `pom.xml`

---

[← Back to README](../README.md)
