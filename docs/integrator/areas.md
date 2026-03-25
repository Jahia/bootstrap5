# Areas Reference

Areas are droppable regions in a page template or component where content editors can add components.

## Page-level areas (defined in templates)

| Area name | Template | Description |
|-----------|----------|-------------|
| `header` | Both templates | Site-wide header — typically holds a Navbar |
| `pagecontent` | Both templates | Main content of the page |
| `footer` | Both templates | Site-wide footer |

## Component-level areas

Many components expose their own droppable areas:

| Component | Area name | Description |
|-----------|-----------|-------------|
| Grid (predefined/custom row) | `col-{n}` (auto-named) | One area per column |
| Grid (absolute) | Inherited from ancestor | Shared content pulled from an ancestor page |
| Card | `content` | Card body |
| Card (free footer) | `footer` | Card footer (when Free footer is enabled) |
| Button (modal) | `modal-content` | Modal dialog body |
| Button (collapse) | `collapse-content` | Collapsed body |
| Button (offcanvas) | `offcanvas-content` | Offcanvas panel body |
| Accordion Item | `content` | Below the rich-text field |
| Alert | `content` | Alert body |
| Tabs | (per content list name) | Each tab panel is a named content list |

## Area configuration in TSX

Areas are rendered using the `<Area>` component from `@jahia/javascript-modules-library`:

```tsx
import { Area } from "@jahia/javascript-modules-library";

// Simple area
<Area name="pagecontent" />

// Area restricted to specific node types
<Area name="header" nodeTypes="bootstrap5nt:navbar jnt:contentList" />

// Area with a list limit
<Area name="col-1" listLimit={3} />
```

## Absolute areas

Absolute areas pull shared content from a page at a given ancestor depth. They are configured through the `bootstrap5mix:createAbsoluteAreas` mixin on a Grid component and are useful for site-wide banners or shared page sections.

The `level` property (0–5) determines which ancestor's content is used:
- `0` — current page
- `1` — parent page
- `2` — grandparent page
- etc.
