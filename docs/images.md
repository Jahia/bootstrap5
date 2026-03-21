# Images

How images are handled across the Bootstrap 5 component library — from the bare picker mixin to the full `image` view with all its parameters.

---

## The image mixin hierarchy

Three mixins form a stack, each one extending the previous:

```
bootstrap5mix:image
  └─ bootstrap5mix:imageAdvanced
       └─ bootstrap5mix:imageAdvancedSettings
```

| Mixin | What it adds | Typical use |
|---|---|---|
| `bootstrap5mix:image` | The image picker (`image` weakreference) | Any component that just needs to pick an image |
| `bootstrap5mix:imageAdvanced` | Nothing — acts as a feature flag that triggers the "advanced image" edit form | Components that want to expose the full image view but leave layout to the parent |
| `bootstrap5mix:imageAdvancedSettings` | CSS class, inline style, id, responsive flag, thumbnail, alignment, alt text, border radius | When the editor controls the image presentation directly |

A concrete example: `bootstrap5nt:figure` extends `bootstrap5mix:imageAdvanced`. The editor gets the image picker, and the figure template is responsible for applying the right Bootstrap classes (`figure-img img-fluid`). The editor can then opt in to `bootstrap5mix:imageAdvancedSettings` for fine-grained overrides.

---

## The `image` view

The file `bootstrap5mix_image/html/image.image.jsp` is the single shared view used by every component that renders an image. Components call it via `<template:include>` rather than duplicating `<img>` rendering logic.

```jsp
<template:include view="image">
    <template:param name="class" value="figure-img img-fluid"/>
</template:include>
```

The view outputs a single `<img>` tag — or nothing at all if no image has been picked.

### Parameters

Three parameters can be passed from any calling template:

| Parameter | Attribute | Merge behaviour |
|---|---|---|
| `class` | `class` on `<img>` | **Additive.** The param value is the base; `imageClass` from `bootstrap5mix:imageAdvancedSettings` is appended after. `img-fluid` is also appended automatically unless `responsive = false`. |
| `style` | `style` on `<img>` | **Additive.** The param value comes first; `imageStyle` from advanced settings is appended, separated by `;`. |
| `id` | `id` on `<img>` | **Advanced settings wins.** The param value is the fallback; if `imageID` is set in advanced settings it overrides the param completely. |

> Alt text is **not** a template parameter — it is always read from the node: either from `bootstrap5mix:imageAdvancedSettings.alt` (if set) or from the image asset's display name.

### Class merging in detail

The final `class` attribute is built in this order:

1. The `class` param passed by the calling template (e.g. `"card-img-top"`)
2. `imageClass` from `bootstrap5mix:imageAdvancedSettings`, appended if non-empty
3. Any alignment class derived from the `align` property:
   - `start` → `float-start`
   - `end` → `float-end`
   - `center` → `mx-auto d-block`
4. `img-thumbnail` if `thumbnails = true`
5. Border radius classes from `borderRadius` and `borderRadiusSize` if set
6. `img-fluid` appended automatically **unless** `responsive = false` or `img-fluid` is already present

This means the calling template provides the structural class and the editor's advanced settings layer on top — they don't conflict.

### Style merging in detail

```
final style = param style [;] imageStyle
```

If the param already ends with a `;` it is not doubled. If both are empty, the `style` attribute is omitted entirely.

---

## How components use the image view

### Figure

```jsp
<figure class="figure">
    <template:include view="image">
        <template:param name="class" value="figure-img img-fluid"/>
    </template:include>
    <figcaption class="figure-caption">…</figcaption>
</figure>
```

The template hardcodes `figure-img img-fluid` as the base class. An editor with `bootstrap5mix:imageAdvancedSettings` can add extra classes on top (e.g. `rounded` for rounded corners), but `figure-img img-fluid` is always there.

### Card

```jsp
<template:include view="image">
    <template:param name="class" value="card-img-top"/>
</template:include>
```

The `card-img-top` class makes the image fill the full card width and apply the top border radius of the card. Only rendered when an image is actually set.

### Using the image view in a custom component

If your custom node type extends `bootstrap5mix:imageAdvanced` (or `bootstrap5mix:image`), you get the shared image view for free:

```jsp
<%-- In mymodule:myComponent view JSP --%>
<template:include view="image">
    <template:param name="class" value="my-hero-image img-fluid"/>
    <template:param name="style" value="max-height: 400px; object-fit: cover;"/>
</template:include>
```

If the editor has also added `bootstrap5mix:imageAdvancedSettings`, their `imageClass` and `imageStyle` values are merged on top automatically — no extra JSP logic needed.

---

## `bootstrap5mix:imageAdvancedSettings` reference

| Property | CND name | Description | Default |
|---|---|---|---|
| **CSS class** | `imageClass` | Extra class(es) appended to the `<img>` | — |
| **Inline style** | `imageStyle` | Appended to the `style` attribute (`;`-separated) | — |
| **HTML id** | `imageID` | Overrides any `id` param from the calling template | — |
| **Responsive** | `responsive` | Adds `img-fluid` — image scales with its container | `true` |
| **Thumbnail** | `thumbnails` | Adds `img-thumbnail` — thin rounded border | `false` |
| **Alignment** | `align` | `float-start`, `float-end`, or `mx-auto d-block` | `default` |
| **Alt text** | `alt` | Overrides the asset's display name | — |
| **Border radius shape** | `borderRadius` | `rounded`, `rounded-circle`, `rounded-pill`, `rounded-top/end/bottom/start`, or `rounded-0` (none) | `rounded-0` |
| **Border radius size** | `borderRadiusSize` | `rounded-1` (small) through `rounded-3` (large) | `default` |

---

## Adding `bootstrap5mix:imageAdvancedSettings` to a component

The advanced settings mixin is not attached by default. To enable it in Jahia edit mode, right-click the component and choose **Edit** → switch to the **Advanced** tab → select **Image advanced settings**.

Once the mixin is active, all properties above appear in the component's edit form and their values are merged into the `image` view output automatically.

---

[← Back to README](../README.md)
