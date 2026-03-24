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

| Fichier source | Enregistre |
|---|---|
| `bootstrap5-js-rendering/src/components/Accordion/default.server.tsx` | `bootstrap5nt:accordions` / `"default"` |
| `bootstrap5-js-rendering/src/components/Accordion/accordion-item.server.tsx` | `bootstrap5nt:accordion` / `"default"` |

Le wrapper (`accordions`) rend `<div class="accordion [accordion-flush]" id="accordion-{uuid}">` et délègue les panneaux via `<RenderChildren nodeTypes="bootstrap5nt:accordion" />`.

Chaque panneau (`accordion`) lit `jcr:title`, `show`, et `text` (rich-text CKEditor via `dangerouslySetInnerHTML`). `data-bs-parent="#accordion-{uuidParent}"` est construit depuis `currentNode.getParent().getIdentifier()`.

> **Divergence JSP :** `accordions.jsp` contient un bug de copier-coller — le wrapper interne porte la classe `carousel-inner`. La vue JS supprime ce wrapper spurieux ; les `accordion-item` sont directement enfants du div `.accordion`.

---

[← Back to README](../README.md)
