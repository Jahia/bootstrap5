# Carousel

A carousel cycles through a set of slides. Each slide contains an image with an optional title and caption.

## How to use

1. Add a **Carousel** component
2. Add **Carousel Item** components inside it (one per slide)
3. Reorder slides by dragging them in the content tree

## Carousel properties

| Field | Description |
|-------|-------------|
| Show indicators | Display clickable dots below the slides |
| Show controls | Display previous/next arrow buttons |
| Auto-play interval (ms) | Time between automatic slide transitions (default: 5000) |
| Keyboard | Allow keyboard arrow navigation |
| Pause on hover | Stop auto-play when the mouse is over the carousel |
| Ride | Start cycling automatically on load |
| Wrap | Cycle back to the first slide after the last |
| Fade | Use a fade transition instead of a slide |
| CSS class | Additional classes on the carousel element |
| Variant | `dark` for dark-colored controls (use on light backgrounds) |

## Carousel Item properties

| Field | Description |
|-------|-------------|
| Image | Pick an image from the media library |
| Title | Slide heading (overlaid on the image) |
| Caption | Slide body text (overlaid below the title) |
| Title color | Color class for the title text |
| Caption color | Color class for the caption text |
| Item CSS class | Additional classes on this slide |
| Interval (ms) | Override the global interval for this slide only |
