# Button

A button renders a styled link or interactive trigger. The button type determines what happens when clicked.

## Button types

Choose the type first — it unlocks the relevant fields.

| Type | Behavior |
|------|----------|
| Internal link | Links to a page or file within the Jahia site |
| External link | Links to an arbitrary URL |
| Modal | Opens a Bootstrap dialog overlay |
| Collapse | Shows/hides a collapsible content panel inline |
| Popover | Shows a floating tooltip-style popup |
| Offcanvas | Slides in a panel from the edge of the screen |

## Common appearance fields

| Field | Description |
|-------|-------------|
| Style | Color variant (primary, secondary, success, info, warning, danger, link, dark, light, custom) |
| Size | `lg`, `sm`, or default |
| Outline | Use the outline variant (border only, no background fill) |
| Block | Full-width button (takes the full container width) |
| State | Active, disabled, or normal |
| CSS class | Additional CSS classes |
| Disable text wrapping | Prevent the label from wrapping to a second line |
| Stretched link | Make the entire parent card/container clickable |

## Internal link fields

| Field | Description |
|-------|-------------|
| Label | The button text |
| Link | Pick a page or file from the site tree |

## External link fields

| Field | Description |
|-------|-------------|
| Label | The button text |
| URL | The target URL |

## Modal fields

| Field | Description |
|-------|-------------|
| Label | The button text that opens the modal |
| Modal title | The dialog heading |
| Close button text | Label of the close button inside the dialog |
| Size | Dialog size: small, default, large, extra-large |
| Static backdrop | Prevent closing by clicking outside the dialog |
| Vertically centered | Center the dialog vertically in the viewport |

The modal body is a droppable area.

## Collapse fields

| Field | Description |
|-------|-------------|
| Label | The button text |
| Show | Start in the expanded state |

The collapse body is a droppable area.

## Popover fields

| Field | Description |
|-------|-------------|
| Label | The button text |
| Popover title | The popover heading |
| Content | The popover body text |
| Direction | top, bottom, start, end |
| Allow HTML | Render HTML tags in the content |

## Offcanvas fields

| Field | Description |
|-------|-------------|
| Label | The button text |
| Panel title | The offcanvas panel heading |
| Slide in from | start (left), end (right), bottom |
| Show backdrop | Darken the page behind the panel |
| Allow page scrolling | Let visitors scroll the page while the panel is open |

The offcanvas body is a droppable area.
