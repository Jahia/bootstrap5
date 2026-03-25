# Breadcrumb

The breadcrumb component automatically reflects the current page's position in the site hierarchy. No manual configuration of the links is required.

## Properties

| Field | Description |
|-------|-------------|
| CSS class | Additional CSS classes applied to the breadcrumb wrapper (default: `float-start`) |

## Notes

- The breadcrumb is built dynamically from the page tree at render time.
- The current page is always shown as the last, non-linked item.
- Ancestor pages link back to themselves automatically.
