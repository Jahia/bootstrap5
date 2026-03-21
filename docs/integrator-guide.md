# Integrator Guide — Template Developers

This guide is for developers who build Jahia templates and sites using Bootstrap 5 components. It covers architecture, template integration, customization patterns, and extending components.

---

## Module architecture

```
bootstrap5-core
├── Bootstrap 5.x CSS/JS assets (bundled, generated at build time via npm)
├── bootstrap5mix:component     — base mixin for all Bootstrap 5 content nodes
└── bootstrap5nt:version        — version display component

bootstrap5-components
├── META-INF/definitions.cnd    — all node type and mixin definitions
├── META-INF/bootstrap5-components.tld  — custom JSP taglib (b5:)
├── META-INF/jahia-content-editor-forms/ — content editor UI fieldsets
├── bootstrap5nt_*/html/        — JSP and Groovy views per component
├── bootstrap5mix_*/html/       — Mixin-specific views (margin, padding, image)
├── css/multilevel-nav.css      — CSS for multi-level navigation
└── javascript/multilevel-nav.js — JS for multi-level navigation
```

### Module dependency chain

```
your-template-module
    └── bootstrap5-components
            └── bootstrap5-core
                    └── default (Jahia built-in)
```

Declare `bootstrap5-components` as a dependency in your template module's `pom.xml`:

```xml
<Jahia-Depends>bootstrap5-components</Jahia-Depends>
```

All component views automatically add the required CSS and JS assets at render time — you do not need to add Bootstrap resources manually in your page template, unless you are building a fully custom layout.

---

## Adding Bootstrap 5 to a custom page template

If you need to explicitly declare Bootstrap assets in your page template (e.g., a minimal custom template):

```jsp
<%-- In your page template JSP --%>
<template:addResources type="css" resources="bootstrap.min.css"/>
<template:addResources type="javascript" resources="bootstrap.bundle.min.js"
    targetTag="${renderContext.editMode?'head':'body'}"/>
```

> JavaScript is intentionally loaded at the **end of body** in live mode (better performance), and in `<head>` in edit mode (required by Jahia's editing infrastructure).

---

## Node type hierarchy

Every Bootstrap 5 component inherits from `bootstrap5mix:component`:

```cnd
[bootstrap5mix:component] > jmix:droppableContent, jmix:accessControllableContent, jmix:editorialContent
  mixin

[bootstrap5nt:grid] > jnt:content, bootstrap5mix:component
  + * (jmix:droppableContent) = jmix:droppableContent
```

This means all components are:
- **Droppable** — available in content areas via drag-and-drop
- **Access-controllable** — can have Jahia ACL rules applied
- **Editorial** — appear in Jahia's content editor

---

## JSP patterns

### Standard header pattern

Every component view follows this header pattern:

```jsp
<%@ taglib prefix="c"        uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn"       uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt"      uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="jcr"      uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="b5"       uri="http://www.jahia.org/b5" %>

<%--@elvariable id="currentNode"    type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="renderContext"  type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="url"            type="org.jahia.services.render.URLGenerator"--%>
```

### Reading properties

```jsp
<%-- String property --%>
<c:set var="myText" value="${currentNode.properties['myProp'].string}"/>

<%-- Boolean property --%>
<c:set var="isEnabled" value="${currentNode.properties['enabled'].boolean}"/>

<%-- Weak reference (image, page…) --%>
<c:set var="imageNode" value="${currentNode.properties['myImage'].node}"/>

<%-- With default value --%>
<c:set var="cssClass" value="${empty currentNode.properties['cssClass'].string
    ? 'default-class'
    : currentNode.properties['cssClass'].string}"/>
```

### Checking for a mixin

```jsp
<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:brand')}">
    <%-- Render brand section --%>
</c:if>

<c:choose>
    <c:when test="${jcr:isNodeType(siteNode, 'bootstrap5mix:siteBrand')}">
        <%-- Use site-level brand --%>
    </c:when>
    <c:when test="${jcr:isNodeType(currentNode, 'bootstrap5mix:brand')}">
        <%-- Use component-level brand --%>
    </c:when>
</c:choose>
```

### Edit mode detection

```jsp
<c:if test="${renderContext.editMode}">
    <%-- Show only in Jahia edit mode --%>
    <div class="alert alert-info">Edit mode hint</div>
</c:if>
```

### Adding resources conditionally

```jsp
<%-- Only load multilevel nav assets if needed --%>
<c:if test="${maxlevel > 1}">
    <template:addResources type="css"        resources="multilevel-nav.css"/>
    <template:addResources type="javascript" resources="multilevel-nav.js"/>
</c:if>
```

---

## Reusable mixin views

Several Bootstrap 5 mixins ship with a dedicated **view** that can be called from any template via `<template:include>`. Rather than duplicating rendering logic, your JSP delegates to the mixin view and gets back either rendered HTML or a plain string it can embed directly.

### How Jahia resolves mixin views

Jahia's view resolution walks the type hierarchy of `currentNode` until it finds a matching view. This means:

```
bootstrap5mix_padding/html/padding.padding.groovy
│                           │     │
│                           │     └─ view name   → "padding"
│                           └─ type local name   → "padding"  (bootstrap5mix:padding)
└─ folder = namespace_localname → bootstrap5mix:padding
```

So `<template:include view="padding"/>` on a node that has the `bootstrap5mix:padding` mixin resolves to `padding.padding.groovy`. The same convention applies to `margin` and `image`.

---

### `image` view — `bootstrap5mix:image`

Outputs a fully-formed `<img>` tag. Any node type that extends `bootstrap5mix:image` or `bootstrap5mix:imageAdvanced` can call it.

```jsp
<template:include view="image">
    <template:param name="class" value="card-img-top"/>
</template:include>
```

Three parameters are accepted via `<template:param>`:

| Parameter | Merged with | Winner when both set |
|---|---|---|
| `class` | `imageClass` from `bootstrap5mix:imageAdvancedSettings` | **Both kept** — param first, then advanced settings |
| `style` | `imageStyle` from `bootstrap5mix:imageAdvancedSettings` | **Both kept** — joined with `;` |
| `id` | `imageID` from `bootstrap5mix:imageAdvancedSettings` | **Advanced settings wins** |

`img-fluid` is appended automatically unless `bootstrap5mix:imageAdvancedSettings.responsive = false`. Alt text is never a parameter — it always resolves from the node (`alt` property > asset display name).

→ Full reference: [Images](images.md)

---

### `padding` view — `bootstrap5mix:padding`

Returns the computed Bootstrap padding utility class as a plain string — no HTML wrapper. Useful for building a `class` attribute dynamically.

The Groovy script is intentionally minimal:

```groovy
def where = currentNode.properties['paddingWhere'].string   // 'all','t','b','s','e','x','y'
def size  = currentNode.properties['paddingSize'].string    // '0'..'5'
if (where == "all") { where = '' }
print "p${where}-${size}"
```

Output examples:

| `paddingWhere` | `paddingSize` | Output class |
|---|---|---|
| `all` | `3` | `p-3` |
| `t` | `2` | `pt-2` |
| `x` | `5` | `px-5` |
| `b` | `0` | `pb-0` |

**Usage in a custom template:**

```jsp
<%-- Capture the padding class only if the mixin is present --%>
<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:hasPadding')}">
    <c:set var="paddingClass"><template:include view="padding"/></c:set>
</c:if>

<div class="my-component ${paddingClass}">
    …
</div>
```

`bootstrap5mix:hasPadding` is the sentinel mixin — it is present on any node that has `bootstrap5mix:padding` because `padding` extends `hasPadding`. Checking for `hasPadding` lets you guard the `<template:include>` safely without knowing which exact mixin variant is attached.

---

### `margin` view — `bootstrap5mix:margin`

Identical pattern to `padding`, but for margins:

```groovy
def where = currentNode.properties['marginWhere'].string
def size  = currentNode.properties['marginSize'].string
if (where == "all") { where = '' }
print "m${where}-${size}"
```

Output examples:

| `marginWhere` | `marginSize` | Output class |
|---|---|---|
| `all` | `3` | `m-3` |
| `t` | `4` | `mt-4` |
| `x` | `auto` | — *(not in choicelist, use cssClass instead)* |
| `b` | `0` | `mb-0` |

**Usage in a custom template:**

```jsp
<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:hasMargin')}">
    <c:set var="marginClass"><template:include view="margin"/></c:set>
</c:if>

<div class="my-component ${marginClass}">
    …
</div>
```

---

### Combining all three in a custom component

A custom node type that extends `bootstrap5mix:imageAdvanced` and to which editors may attach `bootstrap5mix:padding` and `bootstrap5mix:margin`:

```cnd
[mymodule:hero] > jnt:content, bootstrap5mix:component, bootstrap5mix:imageAdvanced, mix:title
  - subtitle (string) i18n
```

The JSP view:

```jsp
<%-- Collect optional spacing classes --%>
<c:set var="paddingClass"
       value="${jcr:isNodeType(currentNode,'bootstrap5mix:hasPadding') ? '' : ''}"/>
<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:hasPadding')}">
    <c:set var="paddingClass"><template:include view="padding"/></c:set>
</c:if>
<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:hasMargin')}">
    <c:set var="marginClass"><template:include view="margin"/></c:set>
</c:if>

<section class="hero-banner ${paddingClass} ${marginClass}">
    <template:include view="image">
        <template:param name="class" value="hero-img img-fluid w-100"/>
    </template:include>
    <h1>${fn:escapeXml(currentNode.properties['jcr:title'].string)}</h1>
    <p class="lead">${fn:escapeXml(currentNode.properties['subtitle'].string)}</p>
</section>
```

The template handles the structure; the editor controls spacing and image presentation through mixin settings — without any JSP changes.

---

## Custom taglib (b5:)

The module provides a custom taglib `uri="http://www.jahia.org/b5"`:

### `b5:switchToLanguageLink`

Renders a link to the current page in a different language.

```jsp
<b5:switchToLanguageLink languageCode="${languageCode}"/>
```

### `b5:replaceAll`

Replaces all occurrences of a pattern in a string (regex-capable).

```jsp
<b5:replaceAll value="${myString}" pattern="[^a-z0-9]" replacement="-"/>
```

### `b5:isRtlLanguage`

Returns `true` if the current language uses a right-to-left script (Arabic, Hebrew, Persian, etc.).

```jsp
<c:set var="isRtl" value="${b5:isRtlLanguage(renderContext.mainResourceLocale.language)}"/>
<div class="${isRtl ? 'dir-rtl' : ''}">...</div>
```

---

## Customizing components via mixins

### Navbar CSS customization

Add `bootstrap5mix:customizeNavbar` to override default CSS classes at every level of the navbar:

| Property | Default | Target element |
|---|---|---|
| `navClass` | `navbar navbar-expand-lg navbar-light bg-light` | `<nav>` |
| `togglerClass` | `navbar-toggler navbar-toggler-right` | Toggler `<button>` |
| `brandLinkClass` | `navbar-brand` | Brand text `<a>` |
| `brandImageClass` | `navbar-brand` | Brand image `<a>` |
| `divClass` | `collapse navbar-collapse` | Collapsible `<div>` |
| `ulClass` | `navbar-nav me-auto` | Navigation `<ul>` |
| `liClass` | `nav-item` | Each `<li>` |
| `navLinkClass` | `nav-link` | Each `<a>` |
| `loginMenuULClass` | `navbar-nav ms-auto` | Sign-in `<ul>` |

Example — dark navbar:

In the Jahia content editor, add the `bootstrap5mix:customizeNavbar` mixin and set `navClass` to `navbar navbar-expand-lg navbar-dark bg-dark`.

### Navbar-only view (footer use case)

The navbar component has a dedicated **"Only display the navigation list"** view, which outputs only the `<ul>` navigation list — useful for footer navigation.

Example: set `ulClass` to `footer-links` and `maxlevel` to `1`. The output will be a plain `<ul class="footer-links">` list.

---

## Creating a custom component using Bootstrap 5 base

To create a custom component that participates in Bootstrap 5's mixin ecosystem:

**1. Define the node type** in your module's `definitions.cnd`:

```cnd
[mymodule:myComponent] > jnt:content, bootstrap5mix:component
 - myTitle (string) i18n
 - myStyle (string, choicelist[resourceBundle]) = 'primary' autocreated indexed=no
   < 'primary', 'secondary', 'success', 'danger'
```

**2. Create the JSP view** at `src/main/resources/mymodule_myComponent/html/myComponent.jsp`:

```jsp
<%@ taglib prefix="c"        uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>

<template:addResources type="css" resources="bootstrap.min.css"/>

<c:set var="title" value="${currentNode.properties['myTitle'].string}"/>
<c:set var="style" value="${currentNode.properties['myStyle'].string}"/>

<div class="alert alert-${style}">
    <c:out value="${title}"/>
</div>
```

**3. Declare the resource folder** in your `pom.xml`:

```xml
<Private-Package>mymodule_myComponent.*</Private-Package>
```

Your component automatically inherits spacing mixins (`bootstrap5mix:padding`, `bootstrap5mix:margin`) because it extends `bootstrap5mix:component`.

---

## Overriding an existing view

To override a Bootstrap 5 component view in your own module:

1. Create the same directory structure in your module:
   `src/main/resources/bootstrap5nt_navbar/html/navbar.jsp`

2. Declare `bootstrap5-components` as a dependency in your `pom.xml`

3. Set a higher module priority than `bootstrap5-components` (priority 5):
   ```xml
   <Jahia-Module-Priority>10</Jahia-Module-Priority>
   ```

Jahia will use your view in place of the default one.

---

## RTL support

The `bootstrap5-templates-starter` module includes RTL template variants. The `b5:isRtlLanguage` function detects RTL languages by checking Unicode script ranges (Arabic, Hebrew, Persian, Syriac, etc.).

To add RTL support in a custom template:

```jsp
<c:set var="isRtl" value="${b5:isRtlLanguage(renderContext.mainResourceLocale.language)}"/>
<html lang="${renderContext.mainResourceLocale.language}" ${isRtl ? 'dir="rtl"' : ''}>
<head>
    <c:choose>
        <c:when test="${isRtl}">
            <template:addResources type="css" resources="bootstrap.rtl.min.css"/>
        </c:when>
        <c:otherwise>
            <template:addResources type="css" resources="bootstrap.min.css"/>
        </c:otherwise>
    </c:choose>
</head>
```

---

## Using `bootstrap5mix:text` in custom definitions

You can use the `bootstrap5mix:text` rich-text mixin in your own node type definitions to get a CKEditor field with Bootstrap-aware formatting:

**CND definition:**

```cnd
[mymodule:myComponent] > jnt:content, bootstrap5mix:component
 - myTitle (string) i18n
```

**Add the text mixin to your component:**

```cnd
[mymodule:myComponent] > jnt:content, bootstrap5mix:component, bootstrap5mix:text
 - myTitle (string) i18n
```

**Display `bootstrap5mix:text` in a JSP view:**

```jsp
<c:set var="text" value="${currentNode.properties['text'].string}"/>
<c:if test="${not empty text}">
    <div class="bs5-text-content">
        ${text}
    </div>
</c:if>
```

> The `text` property stores raw HTML from CKEditor. Output it unescaped (no `fn:escapeXml`) — it is sanitized by CKEditor at input time.

---

## Content editor forms (fieldsets)

The content editor UI is controlled by JSON fieldsets in `META-INF/jahia-content-editor-forms/`. To customize the editor for a component in your module, create a fieldset override:

`src/main/resources/META-INF/jahia-content-editor-forms/fieldsets/bootstrap5nt_navbar.json`

```json
{
  "name": "bootstrap5nt:navbar",
  "priority": 1.0,
  "sections": [
    {
      "name": "content",
      "fieldSets": [
        {
          "name": "bootstrap5nt:navbar",
          "fields": [
            {
              "name": "root",
              "rank": 1
            }
          ]
        }
      ]
    }
  ]
}
```

---

[← Back to README](../README.md)
