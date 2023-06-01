# Breadcrumb Component Documentation

The Breadcrumb component is used to indicate the current page's location within a navigational hierarchy. It automatically adds separators via CSS.

![Breadcrumb](../images/breadcrumb.png "Breadcrumb")

The generated HTML for the Breadcrumb component looks like this:

```html
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">Home</a></li>
    <li class="breadcrumb-item"><a href="#">Library</a></li>
    <li class="breadcrumb-item active" aria-current="page">Data</li>
  </ol>
</nav>
```

## Breadcrumb Properties

When enabling the Advanced settings (`bootstrap5mix:advancedBreadcrumb`), the following property becomes available:

| Label                                           | Name      | Description                                           |
|-------------------------------------------------|-----------|-------------------------------------------------------|
| **Custom Class(es) to set on this breadcrumb**  | `cssClass`| Allows you to add a custom CSS class to the breadcrumb |

## Breadcrumb Definition

Here is the full definition of the breadcrumb:

```cnd
[bootstrap5mix:advancedBreadcrumb] mixin
  extends = bootstrap5nt:breadcrumb
  itemtype = content
  - cssClass (string) = 'float-start' indexed=no

[bootstrap5nt:breadcrumb] > jnt:content, bootstrap5mix:component
```

[Back to README](../README.md)