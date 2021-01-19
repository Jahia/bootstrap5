# Card

> Bootstrap’s cards provide a flexible and extensible content container with multiple variants and options. It includes options for headers and footers, a wide variety of content, contextual background colors, and powerful display options.

![alt_text](../images/card.png "Card" )

## Card properties

| Label | Name | Description | Default value |
| --- | --- | --- | --- |
| **Title** |  `jct:title` |  Title of the card (that goes to the card-header part) ||
| **Image** | `bootstrap5mix:image` |  An image can be added to the card || 
| **Heading for the title** | `headerSize`|  Allow to set a Header from H1 to H5 or none || 
| **Alignment** | `textAlign`|  Text Alignment for the full card. This can be Start (default), End or Center|start|
| **Footer** | `footer`|   Text to display a text on the footer|| 

## Card advanced properties

You can also add more advanced properties

| Label | Name | Description | Default value |
| --- | --- | --- | --- | 
| **Class(es) to set on this Card** |`cssClass`| Add a custom CSS on the `card`| |
| **Class(es) to set on the Card Body** |`cardBodyCssClass`| Add a custom CSS on the `card-body` part | | 
| **Allow any content on the footer** |`freeFooter`| Add any content on the `card-footer` part | false |

## Card colors

You can also customize the colors of the text, the background and the borders of your card

| Label | Name | Description | 
| --- | --- | --- |
| **Text** |`textColor`| Allow choosing one of this color for the text: Muted, Primary, Secondary, Success, Danger, Warning, Info, Light, Dark, White, Body, Black-50, White-50|             
| **Border** |`borderColor`| Allow choosing one of this color for the border: Default, Primary, Secondary, Success, Danger, Warning, Info, Light, Dark, White|

## Card Definition

Here is the definition of the card:

```cnd
[bootstrap5mix:colors] mixin
extends = bootstrap5nt:card
itemtype = content
- backgroundColor (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no < 'default','primary','secondary','success','danger','warning','info','light','dark','white','transparent'
- textColor (string, choicelist[resourceBundle]) = 'dark' autocreated indexed=no < 'muted','primary','secondary','success','danger','warning','info','light','dark','white','body','black-50','white-50'
- borderColor (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no < 'default','primary','secondary','success','danger','warning','info','light','dark','white'

[bootstrap5nt:card]> jnt:content, bootstrap5mix:component, mix:title, jmix:list, bootstrap5mix:image, jmix:browsableInEditorialPicker
- headerSize (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no < 'default', 'h1', 'h2', 'h3', 'h4', 'h5'
- textAlign (string, choicelist[resourceBundle]) = 'text-start' autocreated indexed=no < 'text-start', 'text-end', 'text-center'
- footer (string) i18n
+ * (jmix:droppableContent) = jmix:droppableContent

[bootstrap5mix:cardAdvancedSettings] mixin
extends = bootstrap5nt:card
itemtype = content
- cssClass (string) = 'card' indexed=no
- cardBodyCssClass (string) = 'card-body' indexed=no
- freeFooter (boolean) = 'false' indexed=no
```

[Back to README](../README.md)
