# Template Structure

## Template hierarchy

The template set defines a two-level hierarchy in `settings/import.xml`:

```
jnt:templatesFolder  (rootTemplate=base, defaultTemplate=starter)
├─ base  (jnt:template, view="bootstrap5-templates-starter")
│   ├─ starter       (jnt:pageTemplate)         ← default for new pages
│   └─ sticky-footer (jnt:pageTemplate, view="bootstrap5-templates-starter.sticky-footer")
└─ content-template  (jnt:contentTemplate, applyOn=jnt:content, hidden)
```

- **base** is the abstract parent template. It is never selected directly.
- **starter** inherits the base view; no view override needed.
- **sticky-footer** overrides the view to use a flexbox-based layout that pins the footer to the bottom of the viewport.
- **content-template** is a hidden template used when a standalone `jnt:content` node is rendered as a full page.

## Standard template (starter)

**TSX file:** `src/templates/bootstrap5-templates-starter.server.tsx`

**Registered as:** `{ nodeType: "jnt:template", name: "bootstrap5-templates-starter", componentType: "view" }`

### HTML structure

```html
<html lang="{lang}" dir="{ltr|rtl}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{page display name}</title>
    <!-- bootstrap.min.css always -->
    <!-- starter-edit.css in edit mode only -->
    <!-- bootstrap.bundle.min.js in head in edit mode -->
  </head>
  <body>
    <a class="visually-hidden-focusable" href="#main">Skip to content</a>
    <!-- header area, held by the home page -->
    <main id="main" tabindex="-1">
      <Area name="pagecontent" />
    </main>
    <!-- footer area, held by the home page -->
    <!-- bootstrap.bundle.min.js at end of body in live mode -->
  </body>
</html>
```

### Areas

| Area name | Purpose |
|-----------|---------|
| `header` | Site-wide header (Navbar, etc.). Held by the home page, editable there only |
| `pagecontent` | Main page content, inside `<main id="main">` |
| `footer` | Site-wide footer. Held by the home page, editable there only |

### Bootstrap assets

- `bootstrap.min.css` (`bootstrap.rtl.min.css` for right-to-left languages) is always included in the `<head>`.
- `bootstrap.bundle.min.js` is included:
  - In `<head>` in **edit mode** (required by the Jahia page composer toolbars)
  - At the end of `<body>` in **live mode** (best practice for performance)
- `starter-edit.css` is included in **edit mode only** (a small edit-mode fix for the navbar).

### RTL support

The template detects RTL languages (Arabic, Hebrew, Persian, Urdu, etc.) and sets `dir="rtl"` on the `<html>` element automatically.

## Sticky footer template

**TSX file:** `src/templates/bootstrap5-templates-starter.sticky-footer.server.tsx`

**Registered as:** `{ nodeType: "jnt:template", name: "bootstrap5-templates-starter.sticky-footer", componentType: "view" }`

Identical structure to the standard template, but uses a flexbox-based layout that pushes the footer to the bottom of the viewport even when the page content is shorter than the viewport height. No custom CSS is required — this is achieved with `h-100` on `<html>`, `d-flex flex-column h-100` on `<body>`, `flex-shrink-0` on `<main>` and `mt-auto` on the `<footer>` element that wraps the footer area.

## Changing the default template for new pages

Edit `settings/import.xml` and update the `j:defaultTemplateName` attribute on the `jnt:templatesFolder` node:

```xml
<templates jcr:primaryType="jnt:templatesFolder"
           j:rootTemplateName="base"
           j:defaultTemplateName="sticky-footer">
```

## Adding a new template

1. Create a new TSX file in `src/templates/` — e.g. `my-template.server.tsx`
2. Register it with `jahiaComponent({ nodeType: "jnt:template", name: "my-template", componentType: "view" }, ...)`
3. Add a `jnt:pageTemplate` node in `settings/import.xml` under `<base>`:
   ```xml
   <my-template j:view="my-template" jcr:primaryType="jnt:pageTemplate"/>
   ```
4. Build and redeploy the module
