# Customization

## Theming Bootstrap 5

Bootstrap 5 CSS is served from `bootstrap5-core`. To customize the Bootstrap theme (colors, fonts, spacing), build a custom Bootstrap CSS and deploy it via a separate module or override in your own template set module.

The standard way to customize Bootstrap 5 is with Sass:

```scss
// Override Bootstrap variables before importing
$primary: #your-brand-color;
$font-family-base: "Your Font", sans-serif;

@import "bootstrap/scss/bootstrap";
```

Compile your custom CSS and serve it from your template. You can either:

1. Replace the `AddResources` call for `bootstrap.min.css` in the template TSX
2. Add a second stylesheet after Bootstrap to override specific variables

## Adding static assets to the template module

Static resources (fonts, images, additional CSS/JS) go in the `settings/` folder or in a dedicated folder listed in `files` in `package.json`.

Then declare the folder path in `static-resources`:

```json
"jahia": {
  "static-resources": "/dist/client,/dist/assets,/css,/images"
}
```

Reference them in TSX using the `useUrlBuilder` hook:

```tsx
import { useUrlBuilder } from "@jahia/javascript-modules-library";

const { buildStaticUrl } = useUrlBuilder();
const cssUrl = buildStaticUrl({ assetPath: "css/my-theme.css" });

<AddResources type="css" resources={cssUrl} />
```

## Adding edit-mode only CSS

`starter-edit.css` is served in edit mode only via a conditional `AddResources` call in the template:

```tsx
const { renderContext } = useServerContext();
const isEdit = renderContext.isEditMode() as unknown as boolean;

{isEdit && <AddResources type="css" resources={buildStaticUrl({ assetPath: "css/starter-edit.css" })} />}
```

Use the same pattern for any edit-mode-only resource.

## Creating a custom template set based on Bootstrap 5

To create a branded template set:

1. Create a new JS module with `"module-type": "templatesSet"`
2. Declare `"module-dependencies": "bootstrap5-core"` (or `"bootstrap5-components"` if you want all components)
3. Copy and adapt `settings/import.xml` from `bootstrap5-templates-starter`
4. Write your page templates in TSX (see [Template Structure](template-structure.md))
5. Add your custom CSS/JS
6. Deploy as a TGZ

Your module's views will take priority over `bootstrap5-templates-starter` for `jnt:template` rendering because it declares a dependency on `bootstrap5-core`, making it higher priority.

## Overriding a component view

To replace a specific component's rendering in your module:

```tsx
jahiaComponent(
  {
    nodeType: "bootstrap5nt:card",
    name: "default",
    componentType: "view",
  },
  function MyCustomCard() {
    // your custom rendering
  }
);
```

Declare `"module-dependencies": "bootstrap5-components"` in your `package.json`. Jahia will use your view in preference to the one in `bootstrap5-components`.
