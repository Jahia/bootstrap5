# Bootstrap 5

> This project is a Bootstrap 5 implementation of http://getbootstrap.com for the Digital Experience Platform.

## Installation

Bootstrap 5 is made of several modules:

-   **bootstrap5-core**: This module contains all assets (CSS and JS files), and also the main mixin `bootstrap5mix:component` which is used on all bootstrap components. \
    This module also contains the component *Version* that display the embedded version of bootstrap in an alert box, on edit mode.
-   **bootstrap5-components**: This module contains all the modules, definitions, views, and logic.
-   **bootstrap5-templates-starter**: This template set allows you to play with the Bootstrap 5 components. This template set provides an empty page but add the related dependencies, and supports the RTL.

### Installation using the Bootstrap 5 package

The easiest way to install Bootstrap 5 on your platform using the package. Please read the dedicated tutorial on [https://academy.jahia.com/training-kb/tutorials/administrators/installing-a-module](https://academy.jahia.com/training-kb/tutorials/administrators/installing-a-module) and select the **Bootstrap 5 package** from the store.

You can also get the latest version of this package directly from the GitHub repository https://github.com/Jahia/bootstrap5/releases/latest
Note that there are versions 1.0.x for Jahia 8 and version 1.1.x for Jahia 7.3. Sorry for this strange naming, but Bootstrap 5 was initially developed for Jahia 8.

### Manual installation

If you want to use the Bootstrap 5 components only, you can install `bootstrap5-core` and the `bootstrap5-components` modules to your Jahia, then enable at least the bootstrap5-components modules on your site. Please read the dedicated tutorial on https://academy.jahia.com/training-kb/tutorials/administrators/installing-a-module  for more information.

### Dependencies

The Bootstrap 5 modules have no external dependencies. Internally, here are the dependencies:

-   `bootstrap5-core` depends on the `default` module
-   `bootstrap5-components` depends on the `bootstrap5-core` module
-   `bootstrap5-templates-starter` depends on the `bootstrap5-components` module

If you want to create your own project and use the Bootstrap 5 components, you simply need to add a bootstrap5-components as a dependency. All components view will import the needed resources (CSS and/or JavaScript file)

_________________

## List of components and documentation

>The Bootstrap 5 components module provides a list of components that will allow you to use Bootstrap 5 without thinking about it, as all the logic and syntax will be done automatically.

### [Accordions](docs/accordion.md) 

This component builds vertically collapsing accordions in combination with the Bootstrap Collapse JavaScript plugin.  [more >>](docs/accordion.md)

### [Breadcrumb](docs/breadcrumb.md)

Indicate the current page’s location within a navigational hierarchy that automatically adds separators via CSS.  [more >>](docs/breadcrumb.md)

### [Button](docs/button.md)

This is a multifunction component that will allow several actions, by creating a button with multiple styles, sizes, and more.  [more >>](docs/button.md)


### [Card](docs/card.md)

Bootstrap’s cards provide a flexible and extensible content container with multiple variants and options. It includes options for headers and footers, a wide variety of content, contextual background colors, and powerful display options.  [more >>](docs/card.md)


### [Carousel](docs/carousel.md)

A slideshow component for cycling through elements—images or slides of text—like a carousel.  [more >>](docs/carousel.md)

### [Figure and images](docs/figure.md)

Anytime you need to display a piece of content—like an image with an optional caption, consider using a figure. [more >>](docs/figure.md)

### [Layout and Grid](docs/grid.md)

Bootstrap’s grid system uses a series of containers, rows, and columns to layout and align content. It’s built with flexbox and is fully responsive. [more >>](docs/grid.md)

### [Navbar](docs/navbar.md)

The navbar provides simple navigation for your site with sign in options, language switch, and more. [more >>](docs/navbar.md)

### [Pagination](docs/pagination.md)

Indicate a series of related content exists across multiple pages. [more >>](docs/pagination.md)

### [Text](docs/text.md)

This component provides Bootstrap styles and CK templates [more >>](docs/text.md)

### Version

Display an alert in edit mode with the bootstrap version used.

_________________
## Useful mixin
