# Tabs and Pills

Tabbed navigation that splits content into labelled panels — keeping your page clean when you have multiple distinct sections to show.

![Tabs](../images/tabs.png)

---

## Setting up tabs

![Adding tabs in edit mode](../images/tabs-add.gif)

1. Add a **Tabs** component to your page.
2. Add **content lists** inside it — each list becomes a tab. The list's title is the tab label.
3. Drop your content inside each list.

---

## Properties

| Property | Name | Description | Default |
|---|---|---|---|
| **Style** | `type` | Visual style: Tab, Pill, Link, or Underline. | Tab |
| **Fade effect** | `fade` | Fades the panel in when switching tabs. | true |
| **Alignment** | `align` | Horizontal position of the tab bar: Start, Center, End, Fill, or Justified. | Start |
| **Use list name as anchor** | `useListNameAsAnchor` | Uses the list's node name as the URL fragment (`#my-tab`). Disable to use the UUID instead. | true |

```cnd
[bootstrap5nt:tabs] > jnt:content, bootstrap5mix:component, jmix:manuallyOrderable,
    jmix:list, jmix:siteContent, jmix:browsableInEditorialPicker orderable
  - type  (string, choicelist[resourceBundle, moduleImage='png']) = 'tab' autocreated indexed=no
    < 'tab', 'pill', 'link', 'underline'
  - fade  (boolean) = 'true' autocreated indexed=no
  - align (string, choicelist[resourceBundle, moduleImage='svg'])
    = 'justify-content-start' indexed=no
    < 'justify-content-start', 'justify-content-center', 'justify-content-end',
      'nav-fill', 'nav-justified'
  - useListNameAsAnchor (boolean) = 'true' autocreated indexed=no
  + * (jnt:contentList) = jnt:contentList
```

---

## FAQ

### How do I change the style or alignment after creating the tabs?

Right-click the **Content List** button → **Edit**.

![Editing the tabs component](../images/edit-tabs.png)

### How do I rename a tab?

Right-click the **+ Any Content** button of the list you want to rename → **Edit**.

![Editing a single tab label](../images/edit-tab.png)

---

## JS Rendering

| Fichier source | Enregistre |
|---|---|
| `bootstrap5-js-rendering/src/components/Tabs/default.server.tsx` | `bootstrap5nt:tabs` / `"default"` |

Les enfants sont des nœuds `jnt:contentList` récupérés via `getChildNodes(currentNode, "jnt:contentList")`. Chaque liste devient un panneau rendu via `<Render content={listNode} />`.

**`toAnchor(name)`** — fonction locale remplaçant le taglib Java `b5:replaceAll` : remplace `[^A-Za-z0-9_]` par `-`, préfixe `tab-` si le premier caractère n'est pas une lettre.

Le deep-linking (hash URL ↔ onglet actif) est géré par `DEEP_LINK_SCRIPT`, un snippet vanilla JS injecté via `<AddResources type="inline">` (dans `<head>` en mode édition, `<body>` en live). Aucun island React nécessaire.

---

[← Back to README](../README.md)
