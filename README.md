# Bootstrap 5 Documentation

> This project is a Bootstrap 5 implementation for the Digital Experience Platform, based on http://getbootstrap.com.

## Installation

Bootstrap 5 consists of several modules:

- **bootstrap5-core**: This module contains all the necessary assets (CSS and JS files) and the main mixin `bootstrap5mix:component`, which is used for all Bootstrap components. It also includes the *Version* component, which displays the embedded version of Bootstrap in an alert box during edit mode.
- **bootstrap5-components**: This module contains all the modules, definitions, views, and logic.
- **bootstrap5-templates-starter**: This template set allows you to explore and experiment with Bootstrap 5 components. It provides an empty page with the required dependencies and supports RTL (Right-to-Left) layout.

### Installation using the Bootstrap 5 package

The easiest way to install Bootstrap 5 on your platform is by using the package. Please refer to the dedicated tutorial on [https://academy.jahia.com/training-kb/tutorials/administrators/installing-a-module](https://academy.jahia.com/training-kb/tutorials/administrators/installing-a-module) and select the **Bootstrap 5 package** from the store.

You can also obtain the latest version of the package directly from the GitHub repository at https://github.com/Jahia/bootstrap5/releases/latest. Note that there are separate versions (2.x.x) for Jahia 8 and (1.x.x) for Jahia 7.3.

### Manual installation

If you only want to use the Bootstrap 5 components, you can install the `bootstrap5-core` and `bootstrap5-components` modules on your Jahia instance and enable the `bootstrap5-components` module on your site. For detailed instructions, please refer to the tutorial on https://academy.jahia.com/training-kb/tutorials/administrators/installing-a-module.

### Dependencies

The Bootstrap 5 modules have no external dependencies. Internally, the following dependencies exist:

- `bootstrap5-core` depends on the `default` module.
- `bootstrap5-components` depends on the `bootstrap5-core` module.
- `bootstrap5-templates-starter` depends on the `bootstrap5-components` module.

To create your own project using the Bootstrap 5 components, simply add `bootstrap5-components` as a dependency. All component views will automatically import the required CSS and/or JavaScript files.

## List of Components and Documentation

>The Bootstrap 5 components module provides a comprehensive list of components that allows you to utilize Bootstrap 5 effortlessly. The logic and syntax are handled automatically.

### [Accordions](docs/accordion.md)

This component enables you to create vertically collapsing accordions using the Bootstrap Collapse JavaScript plugin. [more >>](docs/accordion.md)

### [Breadcrumb](docs/breadcrumb.md)

Indicate the current page's location within a navigational hierarchy, automatically adding separators via CSS. [more >>](docs/breadcrumb.md)

### [Button](docs/button.md)

This versatile component allows you to create buttons with various styles, sizes, and functionalities. [more >>](docs/button.md)

### [Card](docs/card.md)

Bootstrap's cards provide flexible and extensible content containers with multiple variants and options. They can include headers, footers, different content types, contextual background colors, and more. [more >>](docs/card.md)

### [Carousel](docs/carousel.md)

A slideshow component for cycling through elements, such as images or slides of text, like a carousel. [more >>](docs/carousel.md)

### [Figure and Images](docs/figure.md)

Whenever you need to display content, such as an image with an optional caption, consider using

the figure component. [more >>](docs/figure.md)

### [Layout and Grid](docs/grid.md)

Bootstrap's grid system uses containers, rows, and columns to create flexible and responsive layouts. It is built with flexbox and adapts to different screen sizes. [more >>](docs/grid.md)

### [Navbar](docs/navbar.md)

The navbar component provides simple navigation for your site, including sign-in options, language switching, and more. [more >>](docs/navbar.md)

### [Pagination](docs/pagination.md)

Indicate the existence of a series of related content across multiple pages. [more >>](docs/pagination.md)

### [Tabs and Pills](docs/tabs.md)

Tabs and pills are navigation components that enhance website clarity and improve user experience.

### [Text](docs/text.md)

This component provides Bootstrap styles and CK templates. [more >>](docs/text.md)

### Version

Displays an alert during edit mode with the version of Bootstrap being used.

## Compliance

Starting from version 2.2.0, the `bootstrap5-core` bundle no longer provides mappings for uncompressed assets. As a result, you need to ensure that all your views use either of the following resources for a Bootstrap 5 project:

- bootstrap.min.css
- bootstrap.bundle.min.js

If you suspect that your code or some third-party bundles are still using uncompressed resources such as bootstrap.css, bootstrap.js, popper.js, or popper.min.js, you may need to add the following mappings in a spring file:

```xml
<bean class="org.jahia.services.render.StaticAssetMapping">
    <property name="mapping">
        <map>
            <entry key="bootstrap.css" value="bootstrap.min.css"/>
            <entry key="bootstrap.js" value="bootstrap.bundle.min.js"/>
            <entry key="bootstrap.min.js" value="bootstrap.bundle.min.js"/>
            <entry key="popper.js" value="bootstrap.bundle.min.js"/>
            <entry key="popper.min.js" value="bootstrap.bundle.min.js"/>
        </map>
    </property>
</bean>
```

For best practices, it is recommended to use the following code when adding Bootstrap 5 resources to your templates:

```html
<template:addResources type="css" resources="bootstrap.min.css"/>
<template:addResources type="javascript" resources="bootstrap.bundle.min.js" targetTag="${renderContext.editMode?'head':'body'}"/>
```

## Useful Mixin

TODO...