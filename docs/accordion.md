# Accordion

Vertically collapsing content panels — great for FAQs, step-by-step guides, or anything where you want to show one section at a time.

![Accordion](../images/accordion_default.png)

```html
<div class="accordion" id="accordion-xyz">
    <div class="accordion-item">
        <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" data-bs-target="#panel-xyz">
                Panel title
            </button>
        </h2>
        <div id="panel-xyz" class="accordion-collapse collapse">
            <div class="accordion-body">
                Panel content goes here.
            </div>
        </div>
    </div>
</div>
```

---

## Setting up an accordion

1. Add an **Accordions** component (`bootstrap5nt:accordions`) to your page.
2. Inside it, add one or more **Accordion** items (`bootstrap5nt:accordion`).
3. Each item gets a title (the clickable header) and a content area where you can drop any component.

---

## Accordions container properties

| Property | Name | Description | Default |
|---|---|---|---|
| **Flush** | `flush` | Removes the default border and rounded corners, creating a seamless look against the page background. | false |

![Flush variant](../images/accordion_flush.png)

```cnd
[bootstrap5nt:accordions] > jnt:content, bootstrap5mix:component,
    jmix:list, jmix:siteContent, jmix:browsableInEditorialPicker orderable
  - flush (boolean) = 'false' indexed=no
  + * (bootstrap5nt:accordion)
```

---

## Accordion item properties

| Property | Name | Description | Default |
|---|---|---|---|
| **Title** | `jcr:title` | The clickable header text. | — |
| **Expanded by default** | `show` | Opens this panel on page load. | false |

```cnd
[bootstrap5nt:accordion] > jnt:content, mix:title, bootstrap5mix:text
  - show (boolean) = 'false' indexed=no
  + * (jmix:droppableContent) = jmix:droppableContent
```

> Each accordion item also inherits `bootstrap5mix:text`, so you can add a rich-text body directly without dropping a separate Text component inside.

---

## JS Rendering

| Source file | Registers |
|---|---|
| `bootstrap5-js-rendering/src/components/Accordion/default.server.tsx` | `bootstrap5nt:accordions` / `"default"` |
| `bootstrap5-js-rendering/src/components/Accordion/accordion-item.server.tsx` | `bootstrap5nt:accordion` / `"default"` |

The group wrapper (`accordions`) renders `<div class="accordion [accordion-flush]" id="accordion-{uuid}">` and delegates panels via `<RenderChildren nodeTypes="bootstrap5nt:accordion" />`.

Each panel (`accordion`) reads `jcr:title`, `show`, and `text` (CKEditor rich-text via `dangerouslySetInnerHTML`). `data-bs-parent="#accordion-{parentUuid}"` is built from `currentNode.getParent().getIdentifier()`.

> **JSP divergence:** `accordions.jsp` has a copy-paste bug — the inner wrapper carries class `carousel-inner`. The JS view removes this spurious wrapper; accordion items sit directly inside the `.accordion` div.

---

[← Back to README](../README.md)
