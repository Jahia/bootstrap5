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

| Fichier source | Enregistre |
|---|---|
| `bootstrap5-js-rendering/src/components/Breadcrumb/default.server.tsx` | `bootstrap5nt:breadcrumb` / `"default"` |

La collection des ancêtres utilise `currentNode.getAncestors().filter(n => n.isNodeType("jnt:page"))` (équivalent de `jcr:getParentsOfType`). Fallback : si la liste est vide (composant hors arborescence de pages), les ancêtres `jmix:navMenuItem` du `mainNode` sont utilisés.

Affiche un `<ol class="breadcrumb">` renversé (racine en premier). Chaque item :
- Chemin == `mainNode.getPath()` → `<li class="breadcrumb-item active" aria-current="page">`
- Nœud non-affichable (approximé par `!isNodeType("jnt:page")`) → `<a href="#">`
- Sinon → `<a href="{path}.html">`

Quand le `mainNode` n'est pas une page, un item supplémentaire est ajouté pour la ressource elle-même (nom tronqué à 15–30 caractères).

> **Questions ouvertes :** préfixe `url.base` non validé (rendu relatif en attendant) ; pas d'équivalent JS à `jcr:findDisplayableNode`.

---

[← Back to README](../README.md)
