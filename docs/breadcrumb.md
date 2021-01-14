# Breadcrumb

> Indicate the current page’s location within a navigational hierarchy that automatically adds separators via CSS. 

This will look like this:

![alt_text](../images/breadcrumb.png "Breadcrumb")
 
The generated HTML looks like this

````html
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">Home</a></li>
    <li class="breadcrumb-item"><a href="#">Library</a></li>
    <li class="breadcrumb-item active" aria-current="page">Data</li>
  </ol>
</nav>
````
## Breadcrumb properties

A property is available when enabling the Advanced settings (bootstrap5mix:advancedBreadcrumb).

| Label | Name | Description |
| --- | --- | --- | 
| **Custom Class(es) to set on this breadcrumb** | `cssClass` | Allow you to add a custom CSS to the main breadcrumb list |

## Breadcrumb definition

Here is the full definition of the breadcrumb:
```cnd
[bootstrap5mix:advancedBreadcrumb] mixin
 extends = bootstrap5nt:breadcrumb
 itemtype = content
 - cssClass (string) = 'float-start' indexed=no

[bootstrap5nt:breadcrumb]> jnt:content, bootstrap5mix:component
```

[Back to README](../README.md)
