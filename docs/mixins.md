# Mixin Catalog

This page lists all mixins provided by the Bootstrap 5 modules.
Mixins are optional sets of properties that can be added to a component node to extend its capabilities.

> In Jahia, mixins are added through the content editor (Advanced Settings panel) or via Studio.
> A mixin marked **autocreated** is added automatically when its parent component is created.

---

## Base Mixins (bootstrap5-core)

### `bootstrap5mix:component`

The base mixin inherited by every Bootstrap 5 component. Provides:
- `jmix:droppableContent` — makes the component available in the content editor drag-and-drop
- `jmix:accessControllableContent` — allows access control rules to apply
- `jmix:editorialContent` — marks the content as editorial

You do not use this mixin directly; it is extended by all `bootstrap5nt:*` node types.

---

## Spacing Mixins

Both mixins can be applied to any component that inherits from `bootstrap5mix:component`.

### `bootstrap5mix:padding`

Adds a Bootstrap padding utility class to the component's root element.

| Property | Type | Values | Default |
|---|---|---|---|
| `paddingDirection` | choicelist | `all`, `t`, `b`, `s`, `e`, `x`, `y` | `all` |
| `paddingSize` | choicelist | `0`, `1`, `2`, `3`, `4`, `5` | `3` |

Generated class example: `pt-3` (padding-top, size 3).

### `bootstrap5mix:margin`

Adds a Bootstrap margin utility class to the component's root element.

| Property | Type | Values | Default |
|---|---|---|---|
| `marginDirection` | choicelist | `all`, `t`, `b`, `s`, `e`, `x`, `y` | `all` |
| `marginSize` | choicelist | `0`, `1`, `2`, `3`, `4`, `5` | `3` |

Generated class example: `mb-2` (margin-bottom, size 2).

---

## Grid & Layout Mixins

### `bootstrap5mix:createSection`

Wraps the grid column in a semantic HTML5 sectioning element.

| Property | Type | Values | Default |
|---|---|---|---|
| `section` | choicelist | `section`, `article`, `aside`, `header`, `footer`, `main`, `div` | `div` |

### `bootstrap5mix:createContainer`

Wraps the grid in a Bootstrap container.

| Property | Type | Values | Default |
|---|---|---|---|
| `containerType` | choicelist | `container`, `container-fluid`, `container-sm`, `container-md`, `container-lg`, `container-xl`, `container-xxl` | `container` |

### `bootstrap5mix:createRow`

Controls row-level Bootstrap classes (alignment, gutters).

| Property | Type | Description |
|---|---|---|
| `verticalAlignment` | choicelist | `align-items-start`, `align-items-center`, `align-items-end` |
| `horizontalAlignment` | choicelist | `justify-content-start`, `justify-content-center`, `justify-content-end`, `justify-content-around`, `justify-content-between`, `justify-content-evenly` |
| `gutterX` | choicelist | Horizontal gutter: `gx-0` … `gx-5` |
| `gutterY` | choicelist | Vertical gutter: `gy-0` … `gy-5` |
| `cssClass` | string | Additional custom CSS classes |

### `bootstrap5mix:predefinedGrid`

Selects a predefined column layout for the row.

| Property | Type | Available layouts |
|---|---|---|
| `gridSize` | choicelist | `12`, `6/6`, `4/4/4`, `3/3/3/3`, `3/6/3`, `2/8/2`, `3/9`, `9/3`, `4/8`, `8/4`, `2/10`, `10/2` |

### `bootstrap5mix:customGrid`

Applies a fully custom set of Bootstrap column classes.

| Property | Type | Description |
|---|---|---|
| `customGridSize` | string | Space-separated Bootstrap column classes (e.g. `col-md-6 col-lg-4`) |

### `bootstrap5mix:createAbsoluteAreas`

Enables content inheritance from parent page levels (Jahia absolute areas).

### `bootstrap5mix:listLimit`

Limits the number of items that can be dropped into a grid column.

| Property | Type | Description |
|---|---|---|
| `limit` | long | Maximum number of droppable items |

---

## Navbar Mixins

### `bootstrap5mix:navbarGlobalSettings`

Global behaviour settings for the navbar.

| Property | Type | Description | Default |
|---|---|---|---|
| `addLoginButton` | boolean | Show sign-in button for anonymous users | `true` |
| `addLanguageButton` | boolean | Show language switcher | `true` |
| `maxlevel` | choicelist | Maximum navigation depth (`1`–`5`) | `2` |
| `addContainerWithinTheNavbar` | boolean | Wrap navbar content in a `<div class="container">` | `false` |

> **Tip:** Enable `addContainerWithinTheNavbar` when your page layout does not already have an outer container, to prevent navbar dropdowns from overflowing the viewport.

### `bootstrap5mix:brand`

Per-navbar brand settings. Only active when `bootstrap5mix:siteBrand` is **not** present on the site node.

| Property | Type | Description |
|---|---|---|
| `brandText` | string (i18n) | Brand label text |
| `brandImage` | weakreference (image) | Brand logo for desktop |
| `brandImageMobile` | weakreference (image) | Brand logo for mobile/small screens |

> See [brand resolution order](navbar.md#customize-brand) for the priority rules between site-level and component-level branding.

### `bootstrap5mix:siteBrand`

Site-level brand definition. Extends `jnt:virtualsite` — set via Administration → Site settings → Mixins.
When present, it **overrides** any `bootstrap5mix:brand` set on individual navbar nodes.

| Property | Type | Description |
|---|---|---|
| `brandText` | string (i18n) | Site-wide brand label text |
| `brandImage` | weakreference (image) | Site-wide brand logo for desktop |
| `brandImageMobile` | weakreference (image) | Site-wide brand logo for mobile/small screens |

### `bootstrap5mix:customizeNavbar`

Fine-grained CSS class control over every element of the navbar.

| Property | Default value | Target element |
|---|---|---|
| `navClass` | `navbar navbar-expand-lg navbar-light bg-light` | `<nav>` |
| `togglerClass` | `navbar-toggler navbar-toggler-right` | Toggler `<button>` |
| `brandLinkClass` | `navbar-brand` | Brand text `<a>` |
| `brandImageClass` | `navbar-brand` | Brand image `<a>` |
| `divClass` | `collapse navbar-collapse` | Collapsible `<div>` |
| `ulClass` | `navbar-nav me-auto` | Navigation `<ul>` |
| `liClass` | `nav-item` | Navigation `<li>` |
| `navLinkClass` | `nav-link` | Navigation `<a>` |
| `loginMenuULClass` | `navbar-nav ms-auto` | Sign-in section `<ul>` |

### `bootstrap5mix:customRootPage`

Allows selecting a custom starting page for the navigation tree (used when `root` is set to `customRootPage`).

| Property | Type | Description |
|---|---|---|
| `customRootPage` | weakreference (page) | The custom root page |

---

## Button Mixins

These mixins are added **automatically** by the `ButtonTypeInitializer` when the `buttonType` property is changed. You do not add them manually.

### `bootstrap5mix:buttonAdvancedSettings`

| Property | Type | Values | Default |
|---|---|---|---|
| `style` | choicelist | `primary`, `secondary`, `success`, `info`, `warning`, `danger`, `link`, `dark`, `light`, `custom` | `primary` |
| `size` | choicelist | `default`, `btn-lg`, `btn-sm` | `default` |
| `outline` | boolean | Use outline variant (no background) | `false` |
| `block` | boolean | Full-width stacked button | `false` |
| `state` | choicelist | `default`, `active`, `disabled` | `default` |
| `cssClass` | string | Additional custom CSS classes | — |
| `disableTextWrapping` | boolean | Prevent text wrapping | `false` |
| `stretchedLink` | boolean | Make parent container fully clickable | `false` |

### `bootstrap5mix:internalLink`
Added when `buttonType = internalLink`. Provides a `internalLink` property (page, content, or file picker).

### `bootstrap5mix:externalLink`
Added when `buttonType = externalLink`. Provides an `externalLink` string property (default: `http://`).

### `bootstrap5mix:collapse`
Added when `buttonType = collapse`. Provides a `show` boolean (expand by default) and a droppable content area.

### `bootstrap5mix:modal`
Added when `buttonType = modal`. Provides:

| Property | Type | Default |
|---|---|---|
| `modalTitle` | string (i18n) | — |
| `closeText` | string (i18n) | `Close` |
| `modalSize` | choicelist (`default`, `sm`, `lg`, `xl`) | `default` |
| `staticBackdrop` | boolean | `false` |
| `verticallyCentered` | boolean | `false` |

### `bootstrap5mix:popover`
Added when `buttonType = popover`. Provides:

| Property | Type | Default |
|---|---|---|
| `popoverTitle` | string (i18n) | — |
| `popoverContent` | string (i18n) | — |
| `direction` | choicelist (`top`, `left`, `right`, `bottom`) | `top` |
| `html` | boolean | `false` |

### `bootstrap5mix:Offcanvas`
Added when `buttonType = Offcanvas`. Provides:

| Property | Type | Default |
|---|---|---|
| `OffcanvasTitle` | string (i18n) | — |
| `placement` | choicelist (`start`, `end`, `bottom`) | `start` |
| `enableBackdrop` | boolean | `true` |
| `enableBodyScrolling` | boolean | `false` |

---

## Image Mixin

### `bootstrap5mix:imageAdvancedSettings`

Available on the **Figure** component. Provides fine-grained control over image rendering.

| Property | Type | Description |
|---|---|---|
| `cssClass` | string | Custom CSS classes on the `<img>` |
| `inlineStyle` | string | Inline `style` attribute |
| `htmlId` | string | HTML `id` attribute |
| `responsive` | boolean | Add `img-fluid` class (max-width: 100%) |
| `thumbnail` | boolean | Add `img-thumbnail` class |
| `align` | choicelist | `float-start`, `float-end`, `mx-auto d-block` |
| `alt` | string | Alt text (overrides the asset's default alt) |
| `borderRadius` | choicelist | `rounded`, `rounded-top`, `rounded-end`, `rounded-bottom`, `rounded-start`, `rounded-circle`, `rounded-pill`, sizes 0–3 |

---

## Carousel Mixin

### `bootstrap5mix:carouselAdvancedSettings`

| Property | Type | Default |
|---|---|---|
| `showControls` | boolean | `true` |
| `showIndicators` | boolean | `false` |
| `interval` | long (ms) | `5000` |
| `fade` | boolean | `false` |
| `ride` | boolean | `true` |

---

## Pagination Mixin

### `bootstrap5mix:advancedPagination`

| Property | Type | Values | Default |
|---|---|---|---|
| `size` | choicelist | `default`, `pagination-sm`, `pagination-lg` | `default` |
| `alignment` | choicelist | `start`, `center`, `end` | `start` |

---

## Card Mixin

### `bootstrap5mix:colors`

Available on **Card**. Sets Bootstrap contextual colour classes.

| Property | Type | Values |
|---|---|---|
| `backgroundColor` | choicelist | `default`, `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark`, `white`, `transparent` |
| `textColor` | choicelist | `default`, `muted`, `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark`, `white`, `body`, `black-50`, `white-50` |
| `borderColor` | choicelist | `default`, `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark`, `white` |

### `bootstrap5mix:cardAdvancedSettings`

| Property | Type | Description |
|---|---|---|
| `cssClass` | string | Additional custom CSS classes |

---

[Back to README](../README.md)
