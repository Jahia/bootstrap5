# Mixins Reference

Mixins are opt-in capability bundles. Some are applied automatically when a component property is selected (via Java choicelist initializers); others appear as additional tabs in the Content Editor.

## Layout mixins (Grid)

### `bootstrap5mix:createSection`
Wraps grid content in a semantic HTML5 element.

| Property | Type | Description |
|----------|------|-------------|
| sectionElement | string | `section`, `article`, `aside`, `nav`, `header`, `footer`, `div` |
| sectionId | string | HTML id |
| sectionCssClass | string | CSS classes |
| sectionStyle | string | Inline style |
| sectionRole | string | ARIA role |
| sectionAria | string | ARIA label |

### `bootstrap5mix:createContainer`
Wraps content in a Bootstrap container div.

| Property | Type | Description |
|----------|------|-------------|
| containerType | string | `container`, `container-fluid`, `container-sm/md/lg/xl/xxl` |
| containerId | string | HTML id |
| containerCssClass | string | CSS classes |

### `bootstrap5mix:createRow`
Adds Bootstrap row behavior and alignment.

| Property | Type | Description |
|----------|------|-------------|
| typeOfGrid | choicelist | `nogrid`, `predefinedGrid` (auto-injects `bootstrap5mix:predefinedGrid`), `customGrid` (auto-injects `bootstrap5mix:customGrid`) |
| rowId | string | HTML id |
| rowCssClass | string | CSS classes |
| rowVerticalAlignment | string | `align-items-start/center/end` |
| rowHorizontalAlignment | string | `justify-content-start/center/end/around/between/evenly` |
| horizontalGutters | string | `gx-0` to `gx-5` |
| verticalGutters | string | `gy-0` to `gy-5` |

### `bootstrap5mix:predefinedGrid`
Auto-injected when typeOfGrid = predefinedGrid.

| Property | Type | Description |
|----------|------|-------------|
| grid | choicelist | Preset ratio: `12`, `6_6`, `4_8`, `8_4`, `3_9`, `9_3`, `4_4_4`, `3_6_3`, `3_3_3_3`, `10_2`, `2_10` |

### `bootstrap5mix:customGrid`
Auto-injected when typeOfGrid = customGrid.

| Property | Type | Description |
|----------|------|-------------|
| gridClasses | string | Comma-separated Bootstrap col-* classes, one per column |

### `bootstrap5mix:createAbsoluteAreas`
Pulls shared content from an ancestor level.

| Property | Type | Description |
|----------|------|-------------|
| level | long | Ancestor depth: 0 (current) to 5 |

### `bootstrap5mix:listLimit`
Caps the number of items rendered in area columns.

| Property | Type | Description |
|----------|------|-------------|
| nbOfItemsToDisplay | long | -1 (unlimited) or 1–10 |

---

## Spacing mixins

### `bootstrap5mix:padding` / `bootstrap5mix:hasPadding`

| Property | Type | Description |
|----------|------|-------------|
| paddingWhere | choicelist | `all`, `t` (top), `b` (bottom), `s` (start), `e` (end), `x` (horizontal), `y` (vertical) |
| paddingSize | choicelist | `0`–`5` |

### `bootstrap5mix:margin` / `bootstrap5mix:hasMargin`

| Property | Type | Description |
|----------|------|-------------|
| marginWhere | choicelist | `all`, `t`, `b`, `s`, `e`, `x`, `y` |
| marginSize | choicelist | `0`–`5` |

---

## Appearance mixins

### `bootstrap5mix:colors`

| Property | Type | Description |
|----------|------|-------------|
| backgroundColor | choicelist | Bootstrap contextual colors + `transparent` |
| textColor | choicelist | Bootstrap contextual text colors |
| borderColor | choicelist | Bootstrap contextual border colors |

---

## Button mixins (auto-injected by ButtonTypeInitializer)

### `bootstrap5mix:buttonAdvancedSettings`

| Property | Type | Description |
|----------|------|-------------|
| style | choicelist | `primary`, `secondary`, `success`, `info`, `warning`, `danger`, `link`, `dark`, `light`, `custom` |
| size | choicelist | `lg`, `sm`, or default |
| outline | boolean | Outline style |
| block | boolean | Full-width |
| state | choicelist | `active`, `disabled`, or normal |
| cssClass | string | Additional classes |
| disableTextWrapping | boolean | Add `text-nowrap` |
| stretchedLink | boolean | Add `stretched-link` |

### `bootstrap5mix:internalLink`

| Property | Type | Description |
|----------|------|-------------|
| (jcr:title) | string | Button label |
| internalLink | weakreference | Target page or file |

### `bootstrap5mix:externalLink`

| Property | Type | Description |
|----------|------|-------------|
| (jcr:title) | string | Button label |
| externalLink | string | Target URL |

### `bootstrap5mix:modal`

| Property | Type | Description |
|----------|------|-------------|
| modalTitle | string | Dialog heading |
| closeText | string | Close button label |
| modalSize | choicelist | `sm`, default, `lg`, `xl` |
| staticBackdrop | boolean | Prevent closing by clicking outside |
| verticallyCentered | boolean | Center dialog vertically |

### `bootstrap5mix:collapse`

| Property | Type | Description |
|----------|------|-------------|
| show | boolean | Start expanded |

### `bootstrap5mix:popover`

| Property | Type | Description |
|----------|------|-------------|
| popoverTitle | string | Popover heading |
| popoverContent | string | Popover body |
| direction | choicelist | `top`, `bottom`, `start`, `end` |
| html | boolean | Allow HTML in content |

### `bootstrap5mix:Offcanvas`

| Property | Type | Description |
|----------|------|-------------|
| OffcanvasTitle | string | Panel heading |
| placement | choicelist | `start`, `end`, `bottom` |
| enableBackdrop | boolean | Show backdrop |
| enableBodyScrolling | boolean | Allow page scrolling while open |

---

## Image mixins

### `bootstrap5mix:imageAdvancedSettings`

| Property | Type | Description |
|----------|------|-------------|
| imageClass | string | CSS classes on `<img>` |
| imageStyle | string | Inline style on `<img>` |
| imageID | string | HTML id |
| responsive | boolean | `img-fluid` |
| thumbnails | boolean | `img-thumbnail` |
| align | choicelist | `float-start`, `float-end`, `mx-auto` (centered block) |
| alt | string | Alt text |
| borderRadius | boolean | Enable rounded corners |
| borderRadiusSize | choicelist | `1`–`5` |

### `bootstrap5mix:figureAdvancedSettings`

| Property | Type | Description |
|----------|------|-------------|
| captionAlignment | choicelist | `text-start`, `text-center`, `text-end` |

---

## Navbar mixins

### `bootstrap5mix:brand`
Component-level brand (overridden by `bootstrap5mix:siteBrand` at site level).

| Property | Type | Description |
|----------|------|-------------|
| brandText | string | Site name text |
| brandImage | weakreference | Desktop logo image |
| brandImageMobile | weakreference | Mobile logo image |

### `bootstrap5mix:siteBrand`
Applied to `jnt:virtualsite`. Same properties as `bootstrap5mix:brand`, takes priority.

### `bootstrap5mix:navbarGlobalSettings`

| Property | Type | Description |
|----------|------|-------------|
| addLoginButton | boolean | Show login/logout |
| addLanguageButton | boolean | Show language switcher |
| maxlevel | long | Menu depth (1–5) |
| addContainerWithinTheNavbar | boolean | Wrap in `.container` |

### `bootstrap5mix:customizeNavbar`
Fine-grained CSS class overrides. See [Navbar component](../content-editor/components/navbar.md) for the full field list.

### `bootstrap5mix:customRootPage`
Auto-injected when root = `customRootPage`.

| Property | Type | Description |
|----------|------|-------------|
| customRootPage | weakreference | The page to use as navigation root |

---

## Card mixins

### `bootstrap5mix:cardAdvancedSettings`

| Property | Type | Description |
|----------|------|-------------|
| cssClass | string | Outer card classes |
| cardHeaderCssClass | string | Header classes |
| cardBodyCssClass | string | Body classes |
| freeFooter | boolean | Replace static footer with droppable area |

---

## Pagination mixin

### `bootstrap5mix:advancedPagination`

| Property | Type | Description |
|----------|------|-------------|
| pageSize | long | Items per page |
| nbOfPages | long | Pages shown in bar (live) |
| nbOfPagesInEdit | long | Pages shown in bar (edit) |
| align | string | Alignment class |
| layout | string | Layout variant |
