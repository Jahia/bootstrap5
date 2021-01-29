# Layout and Grid

Bootstrap’s grid system uses a series of containers, rows, and columns to layout and align content. It’s built with flexbox and is fully responsive.

In bootstrap, a standard layout is made of HTML5 Element > Container > Row > Columns and could look like this
```html
<section id="copyright">
    <div class="container">
        <div class="row">
            <div class="col">
                [content here]
            </div>
            <div class="col">
                [content here]
            </div>
        </div>
    </div>
</main>
```

This complex component will allow to generate any type of layout, by enabling different mixins. In the content editor, it looks like this:

![alt_text](../images/grid-layout.png "Grid" )

Let’s see the different mixin in detail.

## Create HTML5 Semantic Elements

This part will create a HTML5 Semantic.

Here are the properties of the mixin Create HTML5 Semantic Elements `bootstrap5mix:createSection`

| Label | Name | Description |
| --- | --- | --- | 
| **Html element type** | `sectionElement`|  Select the HTML element to use: section, article, aside, hgroup, header, footer, aside, nav, div, figure, figcaption, main.|
| **ID set on this HTML element** | `sectionId`|  This optional property will create an `id` attribute on the HTML Element <br/>Ex: `<section id="copyright">`|
| **Class(es) set on this HTML element** | `sectionCssClass`|  This optional property will add a `class` attribute on the Html Element with the value<br/>Ex: `<div class="doc">`|
| **Style** | `sectionStyle`|  This optional property will add a `style` attribute on the Html Element with the value <br/>Ex: `<div style="background-color:pink">`|
| **Aria** | `sectionAria`|  This optional property will add an `aria-label` attribute on the Html Element with the value <br/>Ex: `<div aria-label="projects">`|

Here is the definition of this mixin

```cnd
[bootstrap5mix:createSection] mixin
extends = bootstrap5nt:grid
itemtype = content
- sectionElement (string, choicelist[resourceBundle]) = 'div' autocreated indexed=no < 'section', 'article', 'aside', 'hgroup', 'header', 'footer', 'aside', 'nav', 'div', 'figure', 'figcaption', 'main'
- sectionId (string) indexed=no < '[a-zA-Z0-9-_]+'
- sectionCssClass (string) indexed=no
- sectionStyle (string) indexed=no
- sectionRole (string) indexed=no
- sectionAria (string) indexed=no
```

## Create Container

This part will create a bootstrap container. Containers are the most basic layout element in Bootstrap and are required when using the grid system.

Here is the different properties of the mixin Create Container `bootstrap5mix:createContainer`
Bootstrap comes with three different containers:

| Label | Name | Description |
| --- | --- | --- | 
| **ID set on this container** |`containerId`| This optional property will create an `id` attribute on the container<br/>Ex: `<div class=”container” id="copyright">`|
| **Class(es) set on this container** |`containerCssClass`| This optional property will add a `class` attribute on the container with the value<br/>Ex: `<div class="container custom-class">`|
| **Container width** | `containerType` | Bootstrap comes with three different containers: Fluid container, Fixed container and 100% wide until the breakpoint.|

Here is the definition of this mixin

```cnd
[bootstrap5mix:createContainer] mixin
 extends = bootstrap5nt:grid
 itemtype = content
 - containerId (string) < '[a-zA-Z0-9-_]+'
 - containerCssClass (string) indexed=no
 - containerType (string, choicelist[resourceBundle]) = 'container' autocreated indexed=no < 'container', 'container-fluid', 'container-sm', 'container-md', 'container-lg', 'container-xl', 'container-xxl'
```

## Create Row and Columns

This part will create a row with several options such as alignment, gutters. You can also choose the type of columns that you want to create. It can be one of predefined columns or custom ones. You can also not create any columns. The initializer will add on the fly the mixin `bootstrap5mix:predefinedGrid` or `bootstrap5mix:customGrid` to the curent node.

Here are the different properties of the mixin Create Row and Columns `bootstrap5mix:createRow`

| Label | Name | Description | 
| --- | --- | --- | 
| **Select the type of grid that you want to create** |`typeOfGrid`| Choose to create an *empty row (no column)*, a *predefined grid* or a *custom grid*. Depending on your choice a mixin will be added (see more details below)|
| **ID set on this row** |`rowId`| This optional property will create an `id` attribute on the row <br/>Ex: `<div class=”row” id="copyright">`|
| **Class(es) set on this row** |`rowCssClass`| This optional property will add a `class` attribute on the row with the value <br/>Ex: `<div class="row custom-class">`|
| **Vertical alignment** |`rowVerticalAlignment`| choose to align the content of the row on Top (default), Middle, or Bottom|
| **Horizontal alignment** |`rowHorizontalAlignment`| Choose to align the content on Start, Center, End or Around, Between, Evenly (similar to around with equal space on the edges) 'justify-content-end','justify-content-around','justify-content-between','justify-content-evenly'|
| **Horizontal Gutter (padding between your columns)** |`horizontalGutters`| Choose a value between 0 (no gutter) and 5 (large) or use the default one|
| **Vertical Gutter (padding between your rows)** |`verticalGutters`| Choose a value between 0 (no gutter) and 5 (large) or use the default one|

### Type of grid: Empty row (no column)

This will create a row with no columns. The name of the area is `main`.

```html
<div class="row">
    [main area here]
</div>
```

### Type of grid: The predefined grid
The predefined grid will propose a few pre mashed grids. As you know, there are 12 template columns available per row, allowing you to create different combinations of elements that span any number of columns.  The predefined columns will propose the following layouts:

- 12 (one single column)
- 6 / 6 (2 equal columns)
- 4 / 4 / 4  (3 equal columns)
- 3 / 3 / 3 / 3  (4 equal columns)

and also a few other ones _

- 10 / 2 and 2 / 10 (a very smal and a extra large)
- 3 / 9 and 9 / 3 (a smal and a large)
- 4 / 8 and  8 / 4 (another smal and a large)
- 3 / 6 / 3 (a large with 2 small)

Each time the breakpoint used is made for the medium breakpoint (≥768px). So for instance, if you choose the layout 3 / 6 / 3, then the component will generate the following code:
```html
<div class=”row”>
    <div class="col-md-3">
        [side area here]
    </div>
    <div class="col-md-6">
        [main area here]
    </div>
    <div class="col-md-3">
        [extra area here]
    </div>
</div>
```
On the The predefined grid, the name of the Jahia area is automatic. Here is the name of the different columns:
- `main` first columns (larger column)
- `side` second columns (smaller column) which is often a side column.
- `extra` third column
- `extra2` last column (only used on the 3 / 3 / 3 / 3 layout)

Note that if you use an RTL language, then the first column will be in the first position.

### Type of grid: The custom grid
For the custom grid, you can use any bootstrap compliant classes and use the `,` as a separator between 2 columns.

So if you use this value `col col-md-8,col-6 col-md-4` then the component will generate the following code:

```html
<div class=”row”>
    <div class="col col-md-8">
        [col1 area here]
    </div>
    <div class="col-6 col-md-4">
        [col3 area here]
    </div>
    <div class="col-6 col-md-4">
        [col3 area here]
    </div>
</div>
```
The name of the different areas is `colx` wher `x` is the index of the column, starting with 1

So as you can see there are no limits on it. Also, you may embed a *grid and layout component* in another one to create any type of layout.

### Create Row and Columns definition

Here is the definition for this mixin

```cnd
[bootstrap5mix:predefinedGrid] > jmix:templateMixin mixin
 extends = bootstrap5nt:grid
 - grid (string, choicelist[resourceBundle, moduleImage='png']) = '4_8' autocreated indexed=no < '2_10', '3_9', '4_8', '4_4_4', '3_6_3', '3_3_3_3', '6_6', '8_4', '9_3', '10_2', '12'

[bootstrap5mix:customGrid] > jmix:templateMixin mixin
 extends = bootstrap5nt:grid
 - gridClasses (string) = 'col col-md-8,col-6 col-md-4' indexed=no

[bootstrap5mix:createRow] mixin
 extends = bootstrap5nt:grid
 itemtype = content
 - typeOfGrid (string, choicelist[gridTypeInitializer, resourceBundle]) = 'nogrid' autocreated indexed=no < 'nogrid', 'predefinedGrid', 'customGrid'
 - rowId (string) < '[a-zA-Z0-9-_]+'
 - rowCssClass (string) indexed=no
 - rowVerticalAlignment (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no < 'default', 'align-items-start', 'align-items-center', 'align-items-end'
 - rowHorizontalAlignment (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no < 'default', 'justify-content-start', 'justify-content-center', 'justify-content-end','justify-content-around','justify-content-between','justify-content-evenly'
 - horizontalGutters (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no < 'default','gx-0','gx-1','gx-2','gx-3','gx-4','gx-5'
 - verticalGutters (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no < 'default','gy-0','gy-1','gy-2','gy-3','gy-4','gy-5'
```

## Limit the number of elements

You can limit the number of content that you want to create in your element (row, column or section). This option will improve the edit mode for users, as we won’t see all the “Add content” placeholders once the limit is granted.

Here is an example of 2 columns (6 / 6 predefined layout) with a limit of 1.  On the first column, there is already text content, and the 2nd column is empty.
As a result, we only see the “Add content” placeholder on the second column.

![alt_text](../images/grid-limit.png "Limit" )

### Limit the number of elements properties

Here are the properties of the mixin Limit the number of elements `bootstrap5mix:listLimit`

| Label | Name | Description | Default value |
| --- | --- | --- | --- |
| **Max elements** | `listLimit` | You can limit the list with 1, 2, 3, 4, 5 or 10 content | No limitation | 

### Limit the number of elements definition

Here is the definition of the mixin Limit the number of elements `bootstrap5mix:listLimit`

```cnd
[bootstrap5mix:listLimit] mixin
 extends = bootstrap5nt:grid
 itemtype = content
 - listLimit (string, choicelist[resourceBundle]) = '-1' autocreated indexed=no < '-1', '1', '2', '3', '4', '5', '10'
```
## Create Absolute Areas

On Jahia you get the content from a parent page node.

For instance, imagine that you are the `page111`, and here is the breadcrumb to this page:  `home > page1 > page11 > page111`.
If so, then from `page111` you can display some content of any parent page. To be able to do it, you will need to specify the level to look at.

- `home` Home is on level **0**
- `home > page1` Page1 is on level **1**
- `home > page1 > page11` Page11 is on level **2**
- `home > page1 > page11 > page111` Page111 is on level **3**

This option is very useful on the studio side when you declare areas such as a footer that should **display the exact same value on all site pages**. To do it, set the level to 0 (Home page).

On edit mode, if you want to edit such absolute content, then you first need to go to the parent page where the content has been defined (the home page in the previous example).
Absolute areas are displayed in red.

### Create Absolute Areas properties

Here is the properties of the mixin Create Absolute Areas `bootstrap5mix:createAbsoluteAreas`

| Label | Name | Description | Default value |
| --- | --- | --- | --- |
| **Level** | `level` | Set a value from 0 (Homepage) to 5 | 0 |

### Create Absolute Areas definition

Here is the definition of the mixin Create Absolute Areas `bootstrap5mix:createAbsoluteAreas`

```cnd
[bootstrap5mix:createAbsoluteAreas] mixin
 extends = bootstrap5nt:grid
 itemtype = content
 - level (string, choicelist[resourceBundle]) = '0' autocreated indexed=no < '0', '1', '2', '3', '4', '5'
```
[Back to README](../README.md)
