# Card

A flexible content container with support for a header, image, body, footer, and contextual colours. Cards are great for teasers, feature highlights, and product listings.

![Card](../images/card.png)

---

## Properties

| Property | Name | Description | Default |
|---|---|---|---|
| **Title** | `jcr:title` | Displayed in the card header. | — |
| **Image** | `bootstrap5mix:image` | Optional image displayed at the top of the card. | — |
| **Heading size** | `headerSize` | HTML heading level for the title: H1–H5, or none. | none |
| **Text alignment** | `textAlign` | Aligns all text in the card: Start, Center, or End. | Start |
| **Footer** | `footer` | Text displayed in the card footer. | — |

```cnd
[bootstrap5nt:card] > jnt:content, bootstrap5mix:component, mix:title,
    jmix:list, bootstrap5mix:image, jmix:browsableInEditorialPicker
  - headerSize  (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no
    < 'default', 'h1', 'h2', 'h3', 'h4', 'h5'
  - textAlign   (string, choicelist[resourceBundle]) = 'text-start' autocreated indexed=no
    < 'text-start', 'text-end', 'text-center'
  - footer      (string) i18n
  + * (jmix:droppableContent) = jmix:droppableContent
```

---

## Advanced settings (`bootstrap5mix:cardAdvancedSettings`)

Fine-grained control over CSS classes at every level of the card:

| Property | Name | Default |
|---|---|---|
| **Card CSS class** | `cssClass` | `card` |
| **Card body CSS class** | `cardBodyCssClass` | `card-body` |
| **Card header CSS class** | `cardHeaderCssClass` | `card-header` |
| **Free footer** | `freeFooter` | false — enables dropping any component into the footer instead of plain text |

```cnd
[bootstrap5mix:cardAdvancedSettings] mixin
  extends = bootstrap5nt:card
  itemtype = content
  - cssClass           (string) = 'card'      indexed=no
  - cardBodyCssClass   (string) = 'card-body' indexed=no
  - cardHeaderCssClass (string) = 'card-header' indexed=no
  - freeFooter         (boolean) = 'false'    indexed=no
```

---

## Colours (`bootstrap5mix:colors`)

Apply Bootstrap contextual colours to background, text, and border independently:

| Property | Name | Options |
|---|---|---|
| **Background** | `backgroundColor` | default, primary, secondary, success, danger, warning, info, light, dark, white, transparent |
| **Text** | `textColor` | default, muted, primary, secondary, success, danger, warning, info, light, dark, white, body, black-50, white-50 |
| **Border** | `borderColor` | default, primary, secondary, success, danger, warning, info, light, dark, white |

```cnd
[bootstrap5mix:colors] mixin
  extends = bootstrap5nt:card
  itemtype = content
  - backgroundColor (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no
  - textColor       (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no
  - borderColor     (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no
```

---

## JS Rendering

| Fichier source | Enregistre |
|---|---|
| `bootstrap5-js-rendering/src/components/Card/default.server.tsx` | `bootstrap5nt:card` / `"default"` |

Structure rendue :
1. Image via l'utilitaire `ImageTag` avec `callerClass="card-img-top"` (uniquement si la propriété `image` est renseignée)
2. Élément d'en-tête (`headerSize` : `div`, `h1`–`h6`) quand `jcr:title` est présent
3. Corps (`cardBodyCssClass`) : enfants `jmix:droppableContent` récupérés via `getChildNodes()`, filtrés pour exclure le sous-nœud `"cardFooter"`
4. Pied de page : texte libre + `<Area name="cardFooter">` optionnelle quand `freeFooter=true`

Les classes de couleur (`bg-{color}`, `text-{color}`, `border-{color}`) issues de `bootstrap5mix:colors` sont ajoutées à la div wrapper. La valeur `"default"` est systématiquement supprimée (pas de classe CSS produite).

---

[← Back to README](../README.md)
