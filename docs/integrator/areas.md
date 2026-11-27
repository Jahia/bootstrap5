# Areas Reference

Areas are droppable regions in a page template or component where content editors can add components.

## Page-level areas (defined in templates)

| Area name | Template | Description |
|-----------|----------|-------------|
| `header` | Both templates | Site-wide header, typically holds a Navbar. Stored on the home page, shown on every page, editable on the home page only |
| `pagecontent` | Both templates | Main content of the page |
| `footer` | Both templates | Site-wide footer. Stored on the home page, shown on every page, editable on the home page only |

## Component-level areas

Many components expose their own droppable areas:

| Component | Area name | Description |
|-----------|-----------|-------------|
| Grid (predefined row) | `main`, `side`, `extra`, `extra2` | One area per column, named after the number of columns and their widths |
| Grid (custom row) | `col0`, `col1`, ... | One area per column |
| Grid (absolute) | Same names as above | Content stored under the ancestor page of the chosen level, shared by the pages below it |
| Card | none | The card body is the content added directly to the card |
| Card (free footer) | `cardFooter` | Card footer (when Free footer is enabled) |
| Button (modal, collapse, offcanvas) | none | The content is added directly to the button |
| Accordion item | `content` | Panel body |
| Tabs | (per content list name) | Each tab panel is a named content list |

## Area configuration in TSX

Areas are rendered using the `<Area>` component from `@jahia/javascript-modules-library`:

```tsx
import { Area } from "@jahia/javascript-modules-library";

// Simple area
<Area name="pagecontent" />

// Area restricted to specific node types
<Area name="header" allowedNodeTypes={["bootstrap5nt:navbar"]} />

// Area with a limit on the number of items
<Area name="side" numberOfItems={3} />
```

## Absolute areas

Absolute areas pull shared content from a page at a given depth of the page tree. They are configured through the `bootstrap5mix:createAbsoluteAreas` mixin on a Grid component and are useful for site-wide banners or shared page sections.

The `level` property (0–5) determines which ancestor page of the displayed page holds the content:
- `0`: the home page
- `1`: the child of the home page on the path to the displayed page
- `2`: its child, and so on

The content is shared by every page below that ancestor and can be edited on that ancestor page only. When the displayed page is above the chosen level, nothing is rendered.
