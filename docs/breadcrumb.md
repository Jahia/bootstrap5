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

## JS Rendering

| Source file | Registers |
|---|---|
| `bootstrap5-js-rendering/src/components/Breadcrumb/default.server.tsx` | `bootstrap5nt:breadcrumb` / `"default"` |

Ancestor collection uses `currentNode.getAncestors().filter(n => n.isNodeType("jnt:page"))` (equivalent to `jcr:getParentsOfType`). Fallback: if the list is empty (component placed outside a page tree), ancestors of `mainNode` filtered by `jmix:navMenuItem` are used instead.

Renders a reversed `<ol class="breadcrumb">` (root first). Each item:
- Path matches `mainNode.getPath()` → `<li class="breadcrumb-item active" aria-current="page">`
- Non-displayable node (approximated as `!isNodeType("jnt:page")`) → `<a href="#">`
- Otherwise → `<a href="{path}.html">`

When `mainNode` is not a page, a final item is appended for the resource itself (name truncated to 15–30 characters).

> **Open questions:** `url.base` prefix not yet validated (rendered as relative URL in the meantime); no JS equivalent for `jcr:findDisplayableNode`.

---

[← Back to README](../README.md)
