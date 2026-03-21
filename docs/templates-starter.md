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

[← Back to README](../README.md)
