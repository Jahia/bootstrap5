# Breadcrumb

Shows the current page's position in the site hierarchy. Separators are added automatically via CSS — no configuration required.

![Breadcrumb](../images/breadcrumb.png)

```html
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">Home</a></li>
    <li class="breadcrumb-item"><a href="#">Section</a></li>
    <li class="breadcrumb-item active" aria-current="page">Current page</li>
  </ol>
</nav>
```

Just drop the component on your page — it automatically reads the page's position in the JCR tree.

---

## Advanced settings

Enable the `bootstrap5mix:advancedBreadcrumb` mixin to unlock one extra option:

| Property | Name | Description |
|---|---|---|
| **Custom CSS class** | `cssClass` | Adds a CSS class to the breadcrumb wrapper. Default: `float-start`. |

```cnd
[bootstrap5mix:advancedBreadcrumb] mixin
  extends = bootstrap5nt:breadcrumb
  itemtype = content
  - cssClass (string) = 'float-start' indexed=no

[bootstrap5nt:breadcrumb] > jnt:content, bootstrap5mix:component
```

---

[← Back to README](../README.md)
