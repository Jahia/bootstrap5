# Carousel

> A slideshow component for cycling through elements—images or slides of text—like a carousel.

![alt_text](../images/carousel.png "Carousel" )

## Carousel Properties

You can change the default settings of the carousel by updating the following properties:

![alt_text](../images/carousel_controls.png "Carousel" )

| Label | Name | Description | Default value |
| --- | --- | --- | --- |
| **Display controls** | `useLeftAndRightControls` | Add the previous and next controls | true |
| **Display indicators** | `useIndicators` | You can also add the indicators to the carousel, alongside the controls, too | false |
| **Delay between automatically cycling (ms)** | `interval`| change the amount of time to delay between automatically cycling to the next item (note that this is a global setting; delay can be set slide per slide)   | 5000ms |
| **React to keyboard events** | `keyboard`|  Whether the carousel should react to keyboard events  | true |
| **Pauses the cycling on hover** | `pause`|  If set, this will pause the cycling of the carousel on mouse enter and resumes the cycling of the carousel on mouse leave. If unset, hovering over the carousel won't pause it | true |
| **Autoplay the carousel** | `ride`|  start animating the carousel at page load | true |
| **Cycle continuously** | `wrap`|  Whether the carousel should cycle continuously or have hard stops | true |
| **Crossfade** | `fade` | Animate slides with a fade transition instead of a slide | true |
| **Custom Class(es) to set the carousel** | `carouselClass` | Allow to set a custom CSS class on the carousel |  |
| **Variant** | `variant` | Allow setting darker controls, indicators, and captions instead of the default one | white |

## Carousel Definition

Here is the definition of a carousel

```cnd
[bootstrap5mix:carouselAdvancedSettings] mixin
 extends = bootstrap5nt:carousel
 itemtype = content
 - useIndicators (boolean) = 'false' indexed=no
 - useLeftAndRightControls (boolean) = 'true' indexed=no
 - interval (long) = '5000' indexed=no
 - keyboard (boolean) = 'true' indexed=no
 - pause (boolean) = 'true' indexed=no
 - ride (boolean) = 'true' indexed=no
 - wrap (boolean) = 'true' indexed=no
 - fade (boolean) = 'true' indexed=no
 - carouselClass (string) indexed=no
 - variant (string, choicelist[resourceBundle]) = 'white' autocreated indexed=no   < 'white', 'dark'

[bootstrap5nt:carousel] > jnt:content, bootstrap5mix:component, jmix:list, jmix:siteContent, jmix:browsableInEditorialPicker orderable
 + * (bootstrap5nt:carouselItem)
```
This component will create a list of Slide of type `bootstrap5nt:carouselItem`.

## Properties of a Slide
Here are the properties that you can set on each slide `bootstrap5nt:carouselItem`

| Label | Name | Description |
| --- | --- | --- |
| **Title** |`jcr:title`| The title of the slide|
| **Image** |`image`| The image of the slide|
| **Caption** |`caption`| A text caption|

Also, you can customize each slide by enabling the advanced properties

| Label | Name | Description | Default value |
| --- | --- | --- | --- |
| **Color for Title title** | `Color` | You can set one of this color for the title: Muted, Primary, Secondary, Success, Danger, Warning, Info, Light, Dark, White, Body, Black-50, White-50||
| **Color for caption** | `captionColor` | You can set one of this color for the caption: Muted, Primary, Secondary, Success, Danger, Warning, Info, Light, Dark, White, Body, Black-50, White-50||
| **Custom Class(es) to set the slide** | `carouselItemClass` | You can set a custom CSS class on your `carousel-item` || 
| **Individual interval (delay in ms to the next item)** | `interval` | You can change the default delay between 2 slides by setting an individual delay | 5000ms | 

## Definition of a Slide

```cnd
[bootstrap5mix:advancedCarouselItem] mixin
 extends = bootstrap5nt:carouselItem
 itemtype = content
 - titleColor (string, choicelist[resourceBundle]) = 'light' autocreated indexed=no < 'muted','primary','secondary','success','danger','warning','info','light','dark','white','body','black-50','white-50'
 - captionColor (string, choicelist[resourceBundle]) = 'light' autocreated indexed=no < 'muted','primary','secondary','success','danger','warning','info','light','dark','white','body','black-50','white-50'
 - carouselItemClass (string) indexed=no
 - interval (long) indexed=no

[bootstrap5nt:carouselItem] > jnt:content, mix:title
 - image (weakreference, picker[type='image']) mandatory < 'jmix:image'
 - caption (string, textarea) i18n
```
[Back to README](../README.md)
