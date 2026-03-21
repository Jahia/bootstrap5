# User Guide — Content Editors

This guide is for content editors who create and manage content in Jahia using the Bootstrap 5 components. No HTML or development knowledge is required.

---

## How Bootstrap 5 components work

Bootstrap 5 components are added to pages the same way as any other Jahia content: drag them from the component list in edit mode or use the **+** button in a content area.

Most components have two levels of settings:
- **Basic properties** — visible immediately when you open a component
- **Advanced settings** — additional mixins you can enable for more control (styling, sizing, CSS classes, etc.)

---

## Building page layouts

Layouts are built by composing three elements: **Grid → Row → Column**.

### Step 1 — Add a Grid

A **Grid** (`bootstrap5nt:grid`) is the outer container. Add one to your page, then optionally configure:

- **Container** (`bootstrap5mix:createContainer`) — wraps content in a Bootstrap container. Choose between fixed-width (`container`) or full-width (`container-fluid`) and responsive variants (`container-sm` through `container-xxl`).
- **Section** (`bootstrap5mix:createSection`) — wraps the grid in a semantic HTML5 element: `<section>`, `<article>`, `<aside>`, `<header>`, `<footer>`, or `<main>`.

### Step 2 — Add a Row

Inside a Grid, add a **Row** (`bootstrap5mix:createRow`). Configure alignment and spacing:

| Setting | What it does |
|---|---|
| Vertical alignment | Aligns columns vertically: top, center, or bottom |
| Horizontal alignment | Distributes columns: start, center, end, around, between, evenly |
| Horizontal gutter | Horizontal spacing between columns (`gx-0` to `gx-5`) |
| Vertical gutter | Vertical spacing between columns (`gy-0` to `gy-5`) |

### Step 3 — Choose a column layout

Two options are available:

**Predefined layouts** (`bootstrap5mix:predefinedGrid`) — pick from ready-made column splits:

| Layout | Columns |
|---|---|
| `12` | Full width, single column |
| `6/6` | Two equal columns |
| `4/4/4` | Three equal columns |
| `3/3/3/3` | Four equal columns |
| `4/8` | Sidebar left + main |
| `8/4` | Main + sidebar right |
| `3/6/3` | Narrow-wide-narrow |
| `3/9` / `9/3` | Small sidebar variants |
| `2/10` / `10/2` | Very narrow sidebar variants |
| `2/8/2` | Centered with padding |

**Custom layout** (`bootstrap5mix:customGrid`) — type your own Bootstrap column classes (e.g. `col-md-6 col-lg-4`).

---

## Components

### Navbar

The navbar provides site navigation with optional branding, sign-in, and language switching. See the full [Navbar documentation](navbar.md).

**Key settings:**

| Setting | Description |
|---|---|
| Starting point | Choose what pages the navigation shows: Home, Current page, Parent page, or Custom page |
| Display sign-in button | Shows a login button for anonymous users |
| Display language switcher | Shows available site languages |
| Maximum levels | How many levels of sub-menus to display (1–5) |
| Wrap in container | Adds `<div class="container">` inside the nav — important when the navbar is not inside a container |

> **Tip:** If your dropdown menus overflow off the right edge of the screen, enable **Wrap in container**.

**Branding:** add the `bootstrap5mix:brand` mixin to set a logo and/or text. If a site-level brand (`bootstrap5mix:siteBrand`) is configured by an administrator, it takes priority — see [brand resolution](navbar.md#customize-brand).

---

### Button

The button component supports six types of actions. Select the action in the **Action** property:

| Action | What it does |
|---|---|
| Internal link | Links to a page, file, or content node within the site |
| External link | Links to any URL |
| Collapse | Toggles the visibility of content placed inside the button |
| Modal | Opens a dialog box with content placed inside |
| Popover | Shows a small popup with text/HTML near the button |
| Offcanvas | Slides in a panel from the edge of the viewport |

Use **Advanced settings** (`bootstrap5mix:buttonAdvancedSettings`) to change the style (Primary, Secondary, Danger…), size, outline variant, and more.

See the full [Button documentation](button.md).

---

### Card

A flexible container with an optional header, body, and footer. Add the `bootstrap5mix:colors` mixin to apply Bootstrap contextual colours (background, text, border).

See the full [Card documentation](card.md).

---

### Carousel

A slideshow of images or content. Add **Carousel Items** inside it. Use **Advanced settings** to control:
- Show/hide navigation controls and indicators
- Slide interval (milliseconds)
- Fade transition vs. slide transition

See the full [Carousel documentation](carousel.md).

---

### Accordion

Groups of collapsible content panels. Add **Accordion** items inside the Accordions container. Each item has a title (shown as the clickable header) and a content area.

See the full [Accordion documentation](accordion.md).

---

### Tabs and Pills

Tabbed navigation. Add **Tab** items inside the Tabs container. Each tab has a title and a content area. Available styles: tabs, pills, links, underline.

See the full [Tabs documentation](tabs.md).

---

### Figure (Image with caption)

Displays an image with an optional caption below. Use **Advanced settings** (`bootstrap5mix:imageAdvancedSettings`) to control responsiveness, alignment, border radius, and thumbnail styling.

See the full [Figure documentation](figure.md).

---

### Text

A rich-text area powered by CKEditor. Supports Bootstrap typography classes and includes:
- **Remove Format** — strips inline formatting
- **Wash** — cleans up pasted HTML from tools like Microsoft Word

See the full [Text documentation](text.md).

---

### Breadcrumb

Automatically displays the current page's position in the site hierarchy. No configuration needed.

See the full [Breadcrumb documentation](breadcrumb.md).

---

### Pagination

Displays a numbered page navigation bar. Use **Advanced settings** to control size and alignment.

See the full [Pagination documentation](pagination.md).

---

## Spacing (padding & margin)

Any component can have padding or margin added by enabling the corresponding mixin:

- `bootstrap5mix:padding` — adds a Bootstrap padding class
- `bootstrap5mix:margin` — adds a Bootstrap margin class

Both work the same way:

| Property | Values |
|---|---|
| Direction | All sides, Top, Bottom, Start (left), End (right), Horizontal (x), Vertical (y) |
| Size | 0 (none) → 5 (largest) |

These map directly to Bootstrap utility classes (e.g. `pt-3`, `mb-2`).

---

## Tips

- **Edit mode vs. live mode** — Some components (like the Version component) only show information in edit mode. The final output visible to visitors may look different.
- **Language switcher** — The current language is not shown in the switcher list, only the other available languages.
- **Navbar brand** — If you set a brand on the navbar but it doesn't appear, check whether a site-level brand is configured in Administration → Site settings → Mixins.

---

[← Back to README](../README.md)
