# Alert

An alert displays a contextual notification banner. It can optionally include a close button.

## Properties

| Field | Description |
|-------|-------------|
| Background color | The contextual color of the alert (primary, secondary, success, info, warning, danger, light, dark) |
| Allow dismissing | Add an × close button so visitors can hide the alert |

## Body content

The alert body is a droppable area — add any content component (text, button, etc.) inside it.

## Notes

- Alert is applied as a **skin** on a content container, not as a standalone component. Add content inside it as you would any other container.
- The close button uses Bootstrap 5's built-in dismiss mechanism and requires no extra JavaScript.
