# Figure

> Anytime you need to display a piece of content—like an image with an optional caption, consider using a figure.

![alt_text](../images/figure.png "Figure" )

Here is the related HTML

````html
<figure class="figure">
  <img src="..." class="figure-img img-fluid rounded" alt="...">
  <figcaption class="figure-caption">A caption for the above image.</figcaption>
</figure>
````
## Figure properties

A figure is made of an image, a caption.
On the advanced properties, you can change the alignment of the caption.

| Label | Name | Description |
| --- | --- | --- |
| Caption |`jcr:title`|  This optional caption will be display after the image|
| Image |`image`| The image to display|
| Caption alignment |`captionAlignment`| This advanced properties can change the alignment of the caption. Value can be Start (default), Center or End|

## Figure definition

Here is the definition of a figure

```cnd
[bootstrap5mix:figureAdvancedSettings] mixin
 extends = bootstrap5nt:figure
 itemtype = content
 - captionAlignment (string, choicelist[resourceBundle]) = 'text-start' autocreated indexed=no < 'text-start', 'text-center', 'text-end'

[bootstrap5nt:figure] > jnt:content, bootstrap5mix:component, bootstrap5mix:imageAdvanced, mix:title
```

## Image advanced properties
There are a few advanced settings for the image

| Label | Name | Description | Default value |
| --- | --- | --- | --- |
| Class(es) to set on this image | `imageClass`|  A custom CSS class can be set on the IMG tag| | 
| Style(s) to set on this image | `imageStyle`|  Custom inline styles can be set on the image, in to the style attribute. For instance, if you set “width:100px” then it will add `style=”width:100px”` in the IMG tag. | | 
| ID to set on this image | `imageID`|  Allow to add an id attribute to the IMG tag with this value | | 
| Responsive image | `responsive`|  Checked by default, this will add the `img-fluid` class. This applies `max-width: 100%;` and `height: auto;` to the image so that it scales with the parent element | true |
| Alignment | `align`|  Choose to align the image on Start (default), Center or End | Default | 
| alternate text | `alt`|  If not set a default alternate text with the name of the image will be used.| | 
| Border-radius | `borderRadius`|  Add classes to an element to easily round its corners. Variants are Rounded, Only on top, Only on end, Only on bottom, Only on start, Circle, Pill, No radius <br /> ![alt_text](../images/border-radius.png "Radius" ) | No radius | 
| Border-radius size | `borderRadiusSize`|  Use the scaling classes for larger or smaller rounded corners. Variants are Small, Medium or Large<br /> ![alt_text](../images/border-radius-size.png "Size" ) | No radius | 
| Thumbnails | `thumbnails`|  In addition to the border-radius, you can use img-thumbnail to give an image a rounded 1px border appearance. <br /> ![alt_text](../images/image-thumbnail.png "Thumbnails" ) | false | 

## Image definition

Here is the definition of the image

```cnd
[bootstrap5mix:imageAdvancedSettings]  mixin
 extends = bootstrap5mix:imageAdvanced
 itemtype = content
 - imageClass (string) indexed=no
 - imageStyle (string) indexed=no
 - imageID (string) indexed=no
 - responsive (boolean) = 'true' indexed=no
 - thumbnails (boolean) = 'false' indexed=no
 - align (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no < 'default', 'start', 'end', 'center'
 - alt (string) i18n
 - borderRadius (string, choicelist[resourceBundle]) = 'rounded-0' autocreated indexed=no < 'rounded','rounded-top', 'rounded-end', 'rounded-bottom','rounded-start','rounded-circle','rounded-pill','rounded-0'
 - borderRadiusSize (string, choicelist[resourceBundle]) = 'default' < 'default','rounded-0','rounded-1','rounded-2','rounded-3'

[bootstrap5mix:imageAdvanced] > bootstrap5mix:image mixin

[bootstrap5mix:image] mixin
 - image (weakreference, picker[type='image']) < 'jmix:image'
```
[Back to README](../README.md)
