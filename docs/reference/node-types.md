# Node Type Reference

Complete reference for all CND node types and mixins defined in the Bootstrap 5 modules.

> **Namespaces:**
> - `bootstrap5nt:` — concrete component node types
> - `bootstrap5mix:` — mixin types (optional property sets)

---

## bootstrap5-core

### `bootstrap5mix:component`

Base mixin inherited by every Bootstrap 5 component.

```cnd
[bootstrap5mix:component] > jmix:droppableContent, jmix:accessControllableContent, jmix:editorialContent
  mixin
```

**Inherited capabilities:**
- `jmix:droppableContent` — available in content editor areas
- `jmix:accessControllableContent` — Jahia ACL rules can be applied
- `jmix:editorialContent` — shows in the editorial content tree

### `bootstrap5nt:version`

Displays an info alert in edit mode showing the current Bootstrap version.

```cnd
[bootstrap5nt:version] > jnt:content, bootstrap5mix:component
```

---

## bootstrap5-components — Layout

### `bootstrap5nt:grid`

Outer layout container. Contains rows and other droppable content.

```cnd
[bootstrap5nt:grid] > jnt:content, bootstrap5mix:component
  + * (jmix:droppableContent) = jmix:droppableContent
```

**Available mixins:** `bootstrap5mix:createSection`, `bootstrap5mix:createContainer`, `bootstrap5mix:createRow`, `bootstrap5mix:predefinedGrid`, `bootstrap5mix:customGrid`, `bootstrap5mix:createAbsoluteAreas`, `bootstrap5mix:listLimit`, `bootstrap5mix:padding`, `bootstrap5mix:margin`

---

### `bootstrap5mix:createSection`

Wraps the grid in a semantic HTML5 element.

```cnd
[bootstrap5mix:createSection] mixin
  extends = bootstrap5nt:grid
  itemtype = layout
  - section (string, choicelist[resourceBundle]) = 'div' autocreated indexed=no
    < 'div', 'section', 'article', 'aside', 'header', 'footer', 'main'
```

---

### `bootstrap5mix:createContainer`

Wraps the grid in a Bootstrap container div.

```cnd
[bootstrap5mix:createContainer] mixin
  extends = bootstrap5nt:grid
  itemtype = layout
  - containerType (string, choicelist[resourceBundle]) = 'container' autocreated indexed=no
    < 'container', 'container-fluid', 'container-sm', 'container-md',
      'container-lg', 'container-xl', 'container-xxl'
```

---

### `bootstrap5mix:createRow`

Configures Bootstrap row alignment and gutter classes.

```cnd
[bootstrap5mix:createRow] mixin
  extends = bootstrap5nt:grid
  itemtype = layout
  - verticalAlignment   (string, choicelist[resourceBundle]) indexed=no
  - horizontalAlignment (string, choicelist[resourceBundle]) indexed=no
  - gutterX             (string, choicelist[resourceBundle]) indexed=no
  - gutterY             (string, choicelist[resourceBundle]) indexed=no
  - cssClass            (string) indexed=no
```

---

### `bootstrap5mix:predefinedGrid`

Selects a preset column layout.

```cnd
[bootstrap5mix:predefinedGrid] mixin
  extends = bootstrap5nt:grid
  itemtype = layout
  - gridSize (string, choicelist[gridTypeInitializer5, resourceBundle])
    = 'col' autocreated indexed=no
```

Available values: `12`, `6_6`, `4_4_4`, `3_3_3_3`, `3_6_3`, `2_8_2`, `3_9`, `9_3`, `4_8`, `8_4`, `2_10`, `10_2`

---

### `bootstrap5mix:customGrid`

Applies custom Bootstrap column classes.

```cnd
[bootstrap5mix:customGrid] mixin
  extends = bootstrap5nt:grid
  itemtype = layout
  - customGridSize (string) = 'col' autocreated indexed=no
```

---

### `bootstrap5mix:createAbsoluteAreas`

Enables content inheritance from parent page levels (Jahia absolute areas).

```cnd
[bootstrap5mix:createAbsoluteAreas] mixin
  extends = bootstrap5nt:grid
  itemtype = layout
  - areaAsSubNode (boolean) = 'false' autocreated indexed=no
```

---

### `bootstrap5mix:listLimit`

Limits the number of items droppable into the grid.

```cnd
[bootstrap5mix:listLimit] mixin
  extends = bootstrap5nt:grid
  - limit (long) indexed=no
```

---

## bootstrap5-components — Spacing

### `bootstrap5mix:padding`

```cnd
[bootstrap5mix:padding] mixin
  extends = bootstrap5mix:component
  - paddingDirection (string, choicelist[resourceBundle]) = 'all' autocreated indexed=no
    < 'all', 't', 'b', 's', 'e', 'x', 'y'
  - paddingSize (string, choicelist[resourceBundle]) = '3' autocreated indexed=no
    < '0', '1', '2', '3', '4', '5'
```

### `bootstrap5mix:margin`

```cnd
[bootstrap5mix:margin] mixin
  extends = bootstrap5mix:component
  - marginDirection (string, choicelist[resourceBundle]) = 'all' autocreated indexed=no
    < 'all', 't', 'b', 's', 'e', 'x', 'y'
  - marginSize (string, choicelist[resourceBundle]) = '3' autocreated indexed=no
    < '0', '1', '2', '3', '4', '5'
```

---

## bootstrap5-components — Navbar

### `bootstrap5nt:navbar`

```cnd
[bootstrap5nt:navbar] > jnt:content, bootstrap5mix:component, jmix:navMenuComponent
  - root (string, choicelist[navbarRootInitializer5, resourceBundle])
    = 'homePage' autocreated indexed=no
    < 'homePage', 'currentPage', 'parentPage', 'customRootPage'
```

**Available mixins:** `bootstrap5mix:navbarGlobalSettings`, `bootstrap5mix:brand`, `bootstrap5mix:customizeNavbar`, `bootstrap5mix:customRootPage`

---

### `bootstrap5mix:navbarGlobalSettings`

```cnd
[bootstrap5mix:navbarGlobalSettings] mixin
  extends = bootstrap5nt:navbar
  itemtype = content
  - addLoginButton               (boolean) = 'true'  autocreated indexed=no
  - addLanguageButton            (boolean) = 'true'  autocreated indexed=no
  - maxlevel                     (string, choicelist[resourceBundle]) = '2' autocreated indexed=no
    < '1', '2', '3', '4', '5'
  - addContainerWithinTheNavbar  (boolean) = 'false' autocreated indexed=no
```

---

### `bootstrap5mix:brand`

```cnd
[bootstrap5mix:brand] mixin
  extends = bootstrap5nt:navbar
  - brandText         (string) i18n
  - brandImage        (weakreference, picker[type='image']) < 'jmix:image'
  - brandImageMobile  (weakreference, picker[type='image']) < 'jmix:image'
```

---

### `bootstrap5mix:siteBrand`

```cnd
[bootstrap5mix:siteBrand] mixin
  extends = jnt:virtualsite
  itemtype = content
  - brandText         (string) i18n
  - brandImage        (weakreference, picker[type='image']) < 'jmix:image'
  - brandImageMobile  (weakreference, picker[type='image']) < 'jmix:image'
```

---

### `bootstrap5mix:customizeNavbar`

```cnd
[bootstrap5mix:customizeNavbar] mixin
  extends = bootstrap5nt:navbar
  itemtype = content
  - navClass          (string) = 'navbar navbar-expand-lg navbar-light bg-light' autocreated indexed=no
  - togglerClass      (string) = 'navbar-toggler navbar-toggler-right' indexed=no
  - brandLinkClass    (string) = 'navbar-brand'          autocreated indexed=no
  - brandImageClass   (string) = 'navbar-brand'          autocreated indexed=no
  - divClass          (string) = 'collapse navbar-collapse' autocreated indexed=no
  - ulClass           (string) = 'navbar-nav me-auto'    autocreated indexed=no
  - liClass           (string) = 'nav-item'              autocreated indexed=no
  - navLinkClass      (string) = 'nav-link'              autocreated indexed=no
  - loginMenuULClass  (string) = 'navbar-nav ms-auto'
```

---

### `bootstrap5mix:customRootPage`

```cnd
[bootstrap5mix:customRootPage] > jmix:templateMixin mixin
  extends = bootstrap5nt:navbar
  - customRootPage (weakreference, picker[type='page']) < 'jnt:page'
```

---

## bootstrap5-components — Button

### `bootstrap5nt:button`

```cnd
[bootstrap5nt:button] > jnt:content, bootstrap5mix:component, mix:title
  - buttonType (string, choicelist[buttonTypeInitializer5, resourceBundle])
    = 'internalLink' autocreated indexed=no
    < 'internalLink', 'externalLink', 'modal', 'collapse', 'popover', 'Offcanvas'
```

**Available mixins (auto-injected):** `bootstrap5mix:buttonAdvancedSettings`, `bootstrap5mix:internalLink`, `bootstrap5mix:externalLink`, `bootstrap5mix:modal`, `bootstrap5mix:collapse`, `bootstrap5mix:popover`, `bootstrap5mix:Offcanvas`

---

### `bootstrap5mix:buttonAdvancedSettings`

```cnd
[bootstrap5mix:buttonAdvancedSettings] mixin
  extends = bootstrap5nt:button
  itemtype = content
  - style               (string, choicelist[resourceBundle]) = 'primary' autocreated indexed=no
    < 'primary', 'secondary', 'success', 'info', 'warning', 'danger', 'link', 'dark', 'light', 'custom'
  - size                (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no
    < 'default', 'btn-lg', 'btn-sm'
  - outline             (boolean) = 'false' indexed=no
  - block               (boolean) = 'false' indexed=no
  - state               (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no
    < 'default', 'active', 'disabled'
  - cssClass            (string) indexed=no
  - disableTextWrapping (boolean) = 'false' indexed=no
  - stretchedLink       (boolean) = 'false' indexed=no
```

---

### `bootstrap5mix:internalLink`

```cnd
[bootstrap5mix:internalLink] > jmix:templateMixin mixin
  extends = bootstrap5nt:button
  - internalLink (weakreference) < jmix:mainResource, jnt:page, jnt:file
```

### `bootstrap5mix:externalLink`

```cnd
[bootstrap5mix:externalLink] > jmix:templateMixin mixin
  extends = bootstrap5nt:button
  - externalLink (string) = 'http://'
```

### `bootstrap5mix:collapse`

```cnd
[bootstrap5mix:collapse] > jmix:templateMixin, jmix:browsableInEditorialPicker mixin orderable
  extends = bootstrap5nt:button
  - show (boolean) = 'false' indexed=no
  + * (jmix:droppableContent) = jmix:droppableContent
```

### `bootstrap5mix:modal`

```cnd
[bootstrap5mix:modal] > jmix:templateMixin, jmix:browsableInEditorialPicker mixin orderable
  extends = bootstrap5nt:button
  - modalTitle          (string) i18n
  - closeText           (string) = 'Close' i18n
  - modalSize           (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no
    < 'default', 'lg', 'sm', 'xl'
  - staticBackdrop      (boolean) = 'false' indexed=no
  - verticallyCentered  (boolean) = 'false' indexed=no
  + * (jmix:droppableContent) = jmix:droppableContent
```

### `bootstrap5mix:popover`

```cnd
[bootstrap5mix:popover] > jmix:templateMixin mixin
  extends = bootstrap5nt:button
  - popoverTitle   (string) i18n
  - popoverContent (string) i18n
  - direction      (string, choicelist[resourceBundle]) = 'top' autocreated indexed=no
    < 'top', 'left', 'right', 'bottom'
  - html           (boolean) = 'false' indexed=no
```

### `bootstrap5mix:Offcanvas`

```cnd
[bootstrap5mix:Offcanvas] > jmix:templateMixin, jmix:browsableInEditorialPicker mixin orderable
  extends = bootstrap5nt:button
  - OffcanvasTitle      (string) i18n
  - placement           (string, choicelist[resourceBundle]) = 'start' autocreated indexed=no
    < 'start', 'end', 'bottom'
  - enableBackdrop      (boolean) = 'true'  indexed=no
  - enableBodyScrolling (boolean) = 'false' indexed=no
  + * (jmix:droppableContent) = jmix:droppableContent
```

---

## bootstrap5-components — Card

### `bootstrap5nt:card`

```cnd
[bootstrap5nt:card] > jnt:content, bootstrap5mix:component, jmix:list,
    jmix:browsableInEditorialPicker, jmix:siteContent orderable
  + * (jmix:droppableContent) = jmix:droppableContent
```

**Available mixins:** `bootstrap5mix:colors`, `bootstrap5mix:cardAdvancedSettings`

### `bootstrap5mix:colors`

```cnd
[bootstrap5mix:colors] mixin
  extends = bootstrap5nt:card
  itemtype = content
  - backgroundColor (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no
    < 'default', 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'white', 'transparent'
  - textColor       (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no
    < 'default', 'muted', 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'white', 'body', 'black-50', 'white-50'
  - borderColor     (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no
    < 'default', 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'white'
```

### `bootstrap5mix:cardAdvancedSettings`

```cnd
[bootstrap5mix:cardAdvancedSettings] mixin
  extends = bootstrap5nt:card
  itemtype = content
  - cssClass (string) indexed=no
```

---

## bootstrap5-components — Carousel

### `bootstrap5nt:carousel`

```cnd
[bootstrap5nt:carousel] > jnt:content, bootstrap5mix:component, jmix:list,
    jmix:browsableInEditorialPicker, jmix:siteContent orderable
  + * (bootstrap5nt:carouselItem) = bootstrap5nt:carouselItem
```

**Available mixins:** `bootstrap5mix:carouselAdvancedSettings`

### `bootstrap5nt:carouselItem`

```cnd
[bootstrap5nt:carouselItem] > jnt:content, mix:title
  - image   (weakreference, picker[type='image']) < 'jmix:image'
  - caption (string) i18n
  - link    (weakreference) < jmix:mainResource, jnt:page, jnt:file
```

### `bootstrap5mix:carouselAdvancedSettings`

```cnd
[bootstrap5mix:carouselAdvancedSettings] mixin
  extends = bootstrap5nt:carousel
  itemtype = content
  - showControls   (boolean) = 'true'  indexed=no
  - showIndicators (boolean) = 'false' indexed=no
  - interval       (long)    = '5000'  indexed=no
  - fade           (boolean) = 'false' indexed=no
  - ride           (boolean) = 'true'  indexed=no
```

---

## bootstrap5-components — Tabs

### `bootstrap5nt:tabs`

```cnd
[bootstrap5nt:tabs] > jnt:content, bootstrap5mix:component, jmix:list,
    jmix:browsableInEditorialPicker, jmix:siteContent orderable
  - tabType (string, choicelist[resourceBundle]) = 'nav-tabs' autocreated indexed=no
    < 'nav-tabs', 'nav-pills', 'nav-link', 'nav-underline'
  + * (bootstrap5nt:tab) = bootstrap5nt:tab
```

### `bootstrap5nt:tab`

```cnd
[bootstrap5nt:tab] > jnt:content, mix:title, jmix:browsableInEditorialPicker orderable
  + * (jmix:droppableContent) = jmix:droppableContent
```

---

## bootstrap5-components — Accordion

### `bootstrap5nt:accordions`

```cnd
[bootstrap5nt:accordions] > jnt:content, bootstrap5mix:component, jmix:list,
    jmix:browsableInEditorialPicker, jmix:siteContent orderable
  + * (bootstrap5nt:accordion) = bootstrap5nt:accordion
```

### `bootstrap5nt:accordion`

```cnd
[bootstrap5nt:accordion] > jnt:content, mix:title, jmix:browsableInEditorialPicker orderable
  - show (boolean) = 'false' indexed=no
  + * (jmix:droppableContent) = jmix:droppableContent
```

---

## bootstrap5-components — Pagination

### `bootstrap5nt:pagination`

```cnd
[bootstrap5nt:pagination] > jnt:content, bootstrap5mix:component
```

**Available mixins:** `bootstrap5mix:advancedPagination`

### `bootstrap5mix:advancedPagination`

```cnd
[bootstrap5mix:advancedPagination] mixin
  extends = bootstrap5nt:pagination
  itemtype = content
  - size      (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no
    < 'default', 'pagination-sm', 'pagination-lg'
  - alignment (string, choicelist[resourceBundle]) = 'start' autocreated indexed=no
    < 'start', 'center', 'end'
```

---

## bootstrap5-components — Figure & Image

### `bootstrap5nt:figure`

```cnd
[bootstrap5nt:figure] > jnt:content, bootstrap5mix:component
  - image   (weakreference, picker[type='image']) < 'jmix:image'
  - caption (string) i18n
```

**Available mixins:** `bootstrap5mix:imageAdvancedSettings`

### `bootstrap5mix:imageAdvancedSettings`

```cnd
[bootstrap5mix:imageAdvancedSettings] mixin
  - cssClass    (string) indexed=no
  - inlineStyle (string) indexed=no
  - htmlId      (string) indexed=no
  - responsive  (boolean) = 'false' indexed=no
  - thumbnail   (boolean) = 'false' indexed=no
  - align       (string, choicelist[resourceBundle]) indexed=no
    < 'float-start', 'float-end', 'mx-auto d-block'
  - alt         (string) i18n
  - borderRadius (string, choicelist[resourceBundle]) indexed=no
    < 'rounded', 'rounded-top', 'rounded-end', 'rounded-bottom', 'rounded-start',
      'rounded-circle', 'rounded-pill', '0', '1', '2', '3'
```

---

## bootstrap5-components — Text

### `bootstrap5nt:text`

```cnd
[bootstrap5nt:text] > jnt:content, bootstrap5mix:component
  - text (string, richtext[ckeditor.toolbar='Tinny',
      ckeditor.customConfig='$context/modules/bootstrap5-components/javascript/ckconfig.js']) i18n
```

### `bootstrap5mix:text`

Reusable mixin to add a rich-text field to any custom node type.

```cnd
[bootstrap5mix:text] mixin
  - text (string, richtext[ckeditor.toolbar='Tinny',
      ckeditor.customConfig='$context/modules/bootstrap5-components/javascript/ckconfig.js']) i18n
```

---

## bootstrap5-components — Breadcrumb & Alert

### `bootstrap5nt:breadcrumb`

```cnd
[bootstrap5nt:breadcrumb] > jnt:content, bootstrap5mix:component
```

### `bootstrap5mix:alert`

Mixin to display a Bootstrap alert on any component.

```cnd
[bootstrap5mix:alert] mixin
  extends = bootstrap5mix:component
  - alertType    (string, choicelist[resourceBundle]) = 'info' autocreated indexed=no
    < 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'
  - alertText    (string) i18n
  - dismissible  (boolean) = 'false' indexed=no
```

---

[← Back to README](../../README.md) | [← Mixin catalog](../mixins.md)
