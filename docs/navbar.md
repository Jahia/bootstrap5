# Navbar

The navbar is a user interface component that provides simple navigation for your site. It includes options for branding, navigation, sign-in functionality, and language switching.

## Overview

The navbar consists of four distinct sections: brand, navigation, sign in, and language.

![Navigation](../images/navigation.png)

- The **brand** section displays a clickable logo and/or text that links to the starting page of your site.
- The **navigation** section presents a list of subpages and may include dropdown menus for deeper navigation.
- The **sign in** section allows anonymous users to sign in. Clicking on the sign-in button opens a modal with a login form. Once logged in, this section provides options to switch to edit mode or preview the page.
- The **language** section allows users to switch between different languages on the site.

On small devices, a toggle button is shown to display or hide these sections.

![Toggleable](../images/navigation-toggleable.png)

Here is an example of the toggle button on a small device:

![Toggler](../images/navigation-toggler.png)

In HTML, the navbar can be implemented as follows:

```html
<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
        <!-- brand section -->
        <a class="navbar-brand" href="/fr/sites/mySite/home.html">MyCorp</a>

        <!-- toggler -->
        <button class="navbar-toggler navbar-toggler-right" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbar-currentid" aria-controls="navbar-currentid" aria-expanded="false"
                aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <!-- toggleable section -->
        <div class="collapse navbar-collapse" id="navbar-currentid">
            <!-- navigation list -->
            <ul class="navbar-nav me-auto">
                <li class="nav-item "><a class="nav-link" href="/fr/sites/mySite/home/p1.html">Page 1</a></li>
                <li class="nav-item "><a class="nav-link" href="/fr/sites/mySite/home/page-2.html">Page 2</a></li>
                <li class="nav-item "><a class="nav-link" href="/fr/sites/mySite/home/page-3.html">Page 3</a></li>
            </ul>

            <!-- sign in section -->
            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <a data-bs-target="#login-modal" class="nav-link py-2 login" href="#" role="button" data-bs-toggle="modal" >
                        Sign in
                    </a>
                </li>
            </ul>
            <!-- modal login form -->
            <div class="modal fade" id="login-modal" tabindex="-1" aria-labelledby="login-modal-label" aria-hidden="true">
                [login form here]
            </div>

            <!-- language section -->
            <ul class="navbar-nav language-nav">
                <li class="nav-item dropdown">
                    <a href="#" class="dropdown-toggle nav-link" id="languageSwitchButton" data-bs-toggle="dropdown"
                       aria-haspopup="true" aria-expanded="false"
                       aria-label="Choose your preferred language">
                        FR
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="languageSwitchButton" role="menu" id="language-menu">
                        <li><a class="dropdown-item" title="English" href="[link-to-en]" role="menuitem" lang="en">English</a></li>
                        <li><a class="dropdown-item" title="Deutsch" href="[link-to-de]" role="menuitem" lang="de">Deutsch</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>
```
## Properties

This component provides multiple levels of configurability. The mandatory property allows you to choose the start node, which is set to the home page by default but can be changed.

Here are the related properties:

| Label | Name | Description | Default Value |
| --- | --- | --- | --- |
| **Starting point** | `root` | Choose your starting point: Home, Current page, Parent page, or Custom page | Home |

- **Home**: The navigation list will display level 1 pages (the direct subpages of the home page).
- **Current Page**: The navigation list will display subpages of the current page.
- **Parent Page**: The navigation list will display sibling pages.
- **Custom Pages**: A page picker will be used to choose your starting page.

## Definition

```cnd
[bootstrap5mix:customRootPage] > jmix:templateMixin mixin
 extends = bootstrap5nt:navbar
 - customRootPage (weakreference, picker[type='page']) < 'jnt:page'

[bootstrap5nt:navbar] > jnt:content, bootstrap5mix:component, jmix:navMenuComponent
 - root (string, choicelist[navbarRootInitializer5,resourceBundle]) = 'homePage' autocreated indexed=no   < 'homePage', 'currentPage', 'parentPage','customRootPage'
```

Additionally, there are several advanced features available to customize your navbar:

![Options](../images/navigation-options.png "Options")

You can enable the following mixins:

- Global settings: `bootstrap5mix:navbarGlobalSettings`
- Customize brand: `bootstrap5mix:brand`
- Customize the navbar: `bootstrap5mix:customizeNavbar`

## Global Settings

The `bootstrap5mix:navbarGlobalSettings` mixin provides the following global settings properties. You can enable or disable specific options based on the type of menu you want to use.

| Label | Name | Description | Default Value |
| --- | --- | --- | --- |
| Display the sign-in button | `addLoginButton` | Display a sign-in button for anonymous users that opens a modal with the sign-in form. Once logged in, a dropdown menu allows switching to edit and preview modes. | true |
| Maximum levels to display | `maxlevel` | Display subpages as a dropdown menu for levels greater than 1. | 2 |
| Display the languages | `addLanguageButton` | Display a language switch menu. The current language is displayed using the 2-character ISO code, and other languages are displayed using their translated names. | true |
| Wrap the navbar in a container | `addContainerWithinTheNavbar` | Wrap the content of the navbar in a Bootstrap `.container` to constrain its width and prevent dropdown overflow on wide screens. This adds `<div class="container">` inside the `<nav>` tag. | **true** |
| Display sub-pages | `recursive` | Include sub-pages in the navigation tree (shown as dropdown menus when `maxlevel` > 1). Disable to show only the top level. | true |

### Global Settings Definition

```cnd
[bootstrap5mix:navbarGlobalSettings] mixin
 extends = bootstrap5nt:navbar
 itemtype = content
 - addLoginButton (boolean) = 'true' autocreated indexed=no
 - addLanguageButton (boolean) = 'true' autocreated indexed=no
 - maxlevel (string, choicelist[resourceBundle]) = '2' autocreated indexed=no < '1', '2', '3', '4', '5'
 - addContainerWithinTheNavbar (boolean) = 'true' autocreated indexed=no
 - recursive (boolean) = 'true' autocreated indexed=no
```

## Customize Brand

The `bootstrap5mix:brand` mixin provides the following properties to customize the brand section:

| Label | Name | Description |
| --- | --- | --- | 
| Brand text | `brandText` | Set the text used in the brand section. | 
| Brand image | `brandImage` | Image used in the brand section. | 
| Brand image for small devices | `brandImageMobile` | Image used for small devices. |

These three properties can be set directly on the navbar component (`bootstrap5mix:brand`), or at the site level via `bootstrap5mix:siteBrand`.

> **Important — brand resolution order (mutually exclusive):**
>
> The **site-level mixin takes priority**. If `bootstrap5mix:siteBrand` is present on the site node, the component-level `bootstrap5mix:brand` settings are **entirely ignored**, even if they are set.
>
> | Scenario | Settings used |
> |---|---|
> | `bootstrap5mix:siteBrand` is present on the site node | Site-level settings (component settings ignored) |
> | `bootstrap5mix:siteBrand` is absent | Component-level `bootstrap5mix:brand` settings |
>
> **When to use which:**
> - **`bootstrap5mix:siteBrand`** — when the navbar is part of a shared template (Studio) and you want one global brand definition for the whole site.
> - **`bootstrap5mix:brand`** — for per-navbar branding (e.g. a secondary navbar with a different logo). To activate it, make sure `bootstrap5mix:siteBrand` is **not** added to the site node (Administration → Site settings → Mixins).

### Customize Brand Definition
```cnd
[bootstrap5mix:brand] mixin
 extends = bootstrap5nt:navbar
 - brandText (string) i18n
 - brandImage (weakreference, picker[type='image']) < 'jmix:image'
 - brandImageMobile (weakreference, picker[type='image']) < 'jmix:image'

[bootstrap5mix:siteBrand] mixin
 extends = jnt:virtualsite
 itemtype = content
 - brandText (string) i18n
 - brandImage (weakreference, picker[type='image']) < 'jmix:image'
 - brandImageMobile (weakreference, picker[type='image']) < 'jmix:image'
```

## Customize the Navbar

The following properties allow you to fully configure your navigation bar by setting CSS classes on different levels:

| Label                                   | Name | Description                                                            | Default Value |
|-----------------------------------------| --- |------------------------------------------------------------------------| --- |
| Class(es) for the main nav              | `navClass` | CSS classes to set on the main `<nav>` tag.                            | `navbar navbar-expand-lg navbar-light bg-light` |
| Class(es) for the toggle button         | `togglerClass` | CSS classes to set on the `<button>` used as a toggler.                | `navbar-toggler navbar-toggler-right` |
| Class(es) for the brand link            | `brandLinkClass` | CSS classes to set on the brand text link.                             | `navbar-brand` |
| Class(es) for the brand image           | `brandImageClass` | CSS classes to set on the brand image link.                            | `navbar-brand` |
| Class(es) for the toggleable section    | `divClass` | CSS classes to set on the toggleable section (on the `nav > div` tag). | `collapse navbar-collapse` |
| Class(es) for the navigation list       | `ulClass` | CSS classes to set on the navigation list `<ul>`.                      | `navbar-nav me-auto` |
| Class(es) for the navigation list items | `liClass` | CSS classes to set on the navigation list items `<li>`.                | `nav-item` |
| Class(es) for the navigation links      | `navLinkClass` | CSS classes to set on the navigation links `<a>`.                      | `nav-link` |
| Class(es) for the sign-in section       | `loginMenuULClass` | CSS classes to set on the sign-in section.                             | `navbar-nav ms-auto` |

### Definition of Customize the Navbar

```cnd
[bootstrap5mix:customizeNavbar] mixin
 extends = bootstrap5nt:navbar
 itemtype = content
 - navClass (string) = 'navbar navbar-expand-lg navbar-light bg-light' autocreated indexed=no
 - togglerClass (string) = 'navbar-toggler navbar-toggler-right' indexed=no
 - brandLinkClass (string) = 'navbar-brand' autocreated indexed=no
 - brandImageClass (string) = 'navbar-brand' autocreated indexed=no
 - divClass (string) = 'collapse navbar-collapse' autocreated indexed=no
 - ulClass (string) = 'navbar-nav me-auto' autocreated indexed=no
 - liClass (string) = 'nav-item' autocreated indexed=no
 - navLinkClass (string) = 'nav-link' autocreated indexed=no
 - loginMenuULClass (string) = 'navbar-nav ms-auto'
```

## Usage of the Dedicated View

In addition to its default usage, this component can be utilized with another existing view called "Only display the navigation list". This view is designed to exclusively show the navigation list without any additional elements.

![View](../images/navigation-view.png "View")

By using this view, the generated HTML will solely consist of the navigation list. This can be particularly useful when incorporating the component in a footer section to display only the main sections of the website.

For example, the *Class(es) for the navigation list* is set to `footer-links`, and the *Display sub pages* is set to `false`. The resulting HTML code is as follows:

```html
<ul class="footer-link">
    <li class="nav-item">
        <a class="nav-link" href="/cms/render/default/en/sites/myCorp/home/page-1.html">Page 1</a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="/cms/render/default/en/sites/myCorp/home/page-2.html">Page 2</a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="/cms/render/default/en/sites/myCorp/home/page-3.html">Page 3</a>
    </li>
</ul>
```

---

## JS Rendering

| Fichier source | Enregistre |
|---|---|
| `bootstrap5-js-rendering/src/components/Navbar/default.server.tsx` | `bootstrap5nt:navbar` / `"default"` |

Consolide quatre JSPs en un seul fichier : `navbar.jsp`, `navbar.hidden.basenav.jsp`, `navbar.hidden.login.jsp`, `navbar.hidden.languages.jsp`.

**Résolution de la marque :** `bootstrap5mix:siteBrand` sur le nœud site prend la priorité sur `bootstrap5mix:brand` sur le composant. Les images desktop/mobile utilisent des classes de visibilité responsive déduites du breakpoint extrait de `navClass` (ex : `"navbar-expand-lg"` → `expand = "lg"` → `d-none d-lg-inline-block`).

**Arborescence de navigation :** `getChildNodes(rootNode, "jmix:navMenuItem")`. Chaque item est routé par type de nœud : `jnt:navMenuText` → `#`, `jnt:externalLink` → URL brute, `jnt:page` → `node.getUrl()`, `jnt:nodeLink` → URL du nœud lié. La propriété multi-valeur `j:displayInMenuName` filtre les items par navbar. Dropdown de niveau 2 rendu quand `maxlevel ≥ 2`.

**Points d'intégration non validés :** état de connexion (`renderContext.isLoggedIn()`), URLs de workspace (`url.logout`, `url.live`, etc.), action du formulaire de login (`ui:loginArea` n'a pas d'équivalent JS), liste des langues (`siteNode.getLanguages()`), URL de changement de langue (`b5:switchToLanguageLink`).

[Back to README](../README.md)
