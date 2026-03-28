# Grid

The Grid component is the primary layout building block. It can act as a semantic section wrapper, a Bootstrap container, a multi-column row, or a set of shared content areas.

Each Grid component operates in one mode determined by the **Advanced settings** tabs present.

## Modes

### Section wrapper

Wraps content in a semantic HTML5 element.

| Field | Description |
|-------|-------------|
| Section element | `section`, `article`, `aside`, `nav`, `header`, `footer`, `div` |
| Section ID | HTML id attribute |
| CSS class | Additional classes |
| Inline style | Inline CSS |
| Role | ARIA role |
| ARIA label | Accessibility label |

### Container

Wraps content in a Bootstrap `.container` div.

| Field | Description |
|-------|-------------|
| Container type | `container`, `container-fluid`, `container-sm/md/lg/xl/xxl` |
| Container ID | HTML id attribute |
| CSS class | Additional classes |

### Row with preset columns

Divides the row into a preset ratio of Bootstrap columns. A droppable area is created for each column.

![Grid layout presets](../../../images/grid-layout.png)

| Field | Description |
|-------|-------------|
| Grid type | Choose the column ratio |
| Row ID | HTML id attribute |
| CSS class | Additional classes |
| Vertical alignment | align-items-start/center/end |
| Horizontal alignment | justify-content-start/center/end/around/between/evenly |
| Horizontal gutters | gx-0 through gx-5 |
| Vertical gutters | gy-0 through gy-5 |

Available presets:

| Preset | Bootstrap columns |
|--------|-------------------|
| 12 | Full width (one column) |
| 6-6 | Two equal halves |
| 4-8 | One-third / two-thirds |
| 8-4 | Two-thirds / one-third |
| 3-9 | One-quarter / three-quarters |
| 9-3 | Three-quarters / one-quarter |
| 4-4-4 | Three equal thirds |
| 3-6-3 | Narrow / wide / narrow |
| 3-3-3-3 | Four equal quarters |
| 10-2 | Large / narrow |
| 2-10 | Narrow / large |

### Row with custom columns

Specify arbitrary Bootstrap column classes manually.

| Field | Description |
|-------|-------------|
| Column classes | Comma-separated list of col-* classes, one per column (e.g. `col-12 col-md-6, col-12 col-md-6`) |

### Absolute areas

Anchors each column area to the grid node itself so that the same content is shared across all pages that inherit this grid (equivalent to `areaAsSubNode="true"` in the JSP stack). Use this when the grid is placed inside a template-level `AbsoluteArea` (e.g. a footer), and you want a single set of column content shared across the whole site rather than per-page overrides.

> **Note:** The *Level* field is retained in the form for compatibility but is not used by the current JavaScript rendering engine. Column areas are always anchored to the grid node itself (see [Architecture — Known limitations](../../developer/architecture.md#known-limitations)).

### List limit

Caps the number of items rendered in each column area.

![Grid list limit](../../../images/grid-limit.png)

| Field | Description |
|-------|-------------|
| Maximum items | -1 (unlimited), or 1–10 |

## Notes

- Grid modes are not mutually exclusive — a section wrapper can contain a container which contains a row.
- Nest Grid components to build complex layouts.
