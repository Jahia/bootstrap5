# Button group

A button group places several [buttons](button.md) side by side, or one under the other, as one block.

![Button group](../../../images/button-group.png)

## Properties

| Field | Description |
|-------|-------------|
| Group name (read by screen readers) | Not displayed. Tells screen reader users what the buttons have in common, for example "Share" |
| Size | `Default`, `Small` or `Large`. The size applies to every button of the group |
| Stack the buttons vertically | Place the buttons one under the other instead of side by side |

## Buttons

The group holds Button components. Add them with the **+** button inside the group, and set each button as you would a stand-alone button (link, modal, collapse, popover, offcanvas, tooltip).

## Notes

- A button that opens a modal, a collapse area or an offcanvas panel works inside a group. The content it opens is displayed after the group, not inside it.
- Give the group a name: without it, screen reader users hear the buttons without knowing what they have in common.
