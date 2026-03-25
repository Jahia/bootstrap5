# Figure

A figure renders an image with an optional caption.

![Figure](../../../images/figure.png)

## Properties

| Field | Description |
|-------|-------------|
| Image | Pick an image from the media library |
| Title | Caption text displayed below the image |

## Advanced image settings

| Field | Description |
|-------|-------------|
| CSS class | Additional classes on the `<img>` element |
| Inline style | Inline CSS on the `<img>` element |
| ID | HTML id attribute |
| Responsive | Add `img-fluid` (scales with container width) |
| Thumbnail | Add `img-thumbnail` (rounded border) — see below |
| Alignment | float-start, float-end, mx-auto (centered block) |
| Alt text | Accessibility description (falls back to image display name) |
| Border radius | Enable rounded corners |
| Border radius size | Bootstrap border-radius utility size (1–5) |

![Thumbnail style](../../../images/image-thumbnail.png)
![Border radius](../../../images/border-radius.png)
![Border radius sizes](../../../images/border-radius-size.png)

## Advanced figure settings

| Field | Description |
|-------|-------------|
| Caption alignment | text-start, text-center, text-end |

## Notes

- If no title is set, no `<figcaption>` is rendered.
- The image URL is resolved automatically from the JCR media library.
