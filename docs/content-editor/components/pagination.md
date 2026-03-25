# Pagination

The Pagination component renders a Bootstrap pagination bar bound to a content list on the same page. Visitors can navigate through the list page by page.

## Properties

| Field | Description |
|-------|-------------|
| Display pager | Show the pagination bar (uncheck to initialize pagination silently without the UI) |

## Advanced settings

| Field | Description |
|-------|-------------|
| Page size | Number of items per page |
| Number of pages (live) | Maximum pages to show in the bar |
| Number of pages (edit) | Pages shown in the bar while in edit mode |
| Alignment | `justify-content-start`, `justify-content-center`, `justify-content-end` |
| Layout | Visual layout variant |

## Notes

- The Pagination component must be **bound** to a content list on the same page using the Jahia binding mechanism.
- The bound list controls which content is paginated; Pagination only renders the navigation bar.
