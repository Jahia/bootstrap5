# Navbar

>The navbar provides simple navigation for your site with login options, language switch, and more.

The navigation bar is made of four distinct sections: brand, navigation, sign in, and language.

![alt_text](../images/navigation.png "Navigation" )

- The **brand** section allows displaying a clickable logo and/or a text that will go to the starting page. 
- The **navigation** list will display the subpage and can also display a deeper level using some dropdown menus. 
- The **sign in** section allows an anonymous user to sign in; the login form will appear in a modal. Once logged, this part will allow switching to edit mode or preview the page. 
- The **language** section will allow switching to other languages.

On small devices, a toggle button will be shown to display or hide all these different sections.

![alt_text](../images/navigation-toggleable.png "Toggleable" )

Here is the toggler button on small device

![alt_text](../images/navigation-toggler.png "Toggler" )


In terms of HTML, this can look like this

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
                    <a href="#" class="dropdown-toggle nav-link" id="languageSwitchButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" aria-label="Choose your preferred language" aria-owns="language-menu">
                        FR
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="languageSwitchButton" role="menu" id="language-menu">
                        <li><a class="dropdown-item" title="English" href="[link-to-en]" role="menuitem" lang="en">English</a></li>
                        <li><a class="dropdown-item" title="Deutsch" href="[link-to-de]" role="menuitem" lang="en">Deutsch</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>
```
## Properties

This component is configurable on multiple levels. The mandatory property allows you to choose the start node. By default, it’s the home page, but you can change it.

Here is the related property

| Label | Name | Description | Default value |
| --- | --- | --- | --- |
| **Starting point** | `root` | Choose your starting point: Home, Current page, Parent page or Custom page | Home |

- **Home**: The navigation list will display the level 1 pages (the direct subpages of the home page)
- **Current Page**: The navigation list will display subpages of the current page
- **Parent page**: The navigation list will display the sibling pages.
- **Custom pages**: A page picker will be used to choose your starting page

## Definition 

```cnd
[bootstrap5mix:customRootPage] > jmix:templateMixin mixin
 extends = bootstrap5nt:navbar
 - customRootPage (weakreference, picker[type='page']) < 'jnt:page'

[bootstrap5nt:navbar] > jnt:content, bootstrap5mix:component, jmix:navMenuComponent
 - root (string, choicelist[navbarRootInitializer,resourceBundle]) = 'homePage' autocreated indexed=no   < 'homePage', 'currentPage', 'parentPage','customRootPage'
```
Also, there are a bunch of advanced features to customize your navbar

![alt_text](../images/navigation-options.png "Options" )

You can enable the following mixin

-  Global settings  `bootstrap5mix:navbarGlobalSettings`
-  Customize brand `bootstrap5mix:brand`
-  Customize the navbar `bootstrap5mix:customizeNavbar`

## Global settings

Here are the global settings properties `bootstrap5mix:navbarGlobalSettings`. You can enable or disable some options, depending of the type of menu that you want to use.

| Label | Name | Description | Default value |
| --- | --- | --- | --- |
| Display the sign in button | `addLoginButton` | Display a sign in button for anonymous users that open a modal with the sign in form <br/> ![alt_text](../images/navigation-signin.png "Sign in" )<br> Once logged, a drop menu allows to switch to edit and preview<br/>  ![alt_text](../images/navigation-edit.png "edit" )| true | 
| How many level to display | `maxlevel` | Display subpages as a dropdown menu for level > 1<br/> ![alt_text](../images/navigation-recursive.png "Sub pages" ) | 2 |
| Display the languages | `addLanguageButton` | Display the switch language menu. The current language is display using the 2 chars ISO code, and other languages are displayed using the language name (translated)<br/>![alt_text](../images/navigation-language.png "Languages" ) | true |
| Wrap the the navbar in a container | `addContainerWithinTheNavbar` | Wrap the content of the navbar in a container to center it on a page. This will add the `<div class="container">` inside the `nav` tag | false | 

### Global setting definition

```cnd
[bootstrap5mix:navbarGlobalSettings] mixin
 extends = bootstrap5nt:navbar
 itemtype = content
 - addLoginButton (boolean) = 'true' autocreated indexed=no
 - addLanguageButton (boolean) = 'true' autocreated indexed=no
 - maxlevel (string, choicelist[resourceBundle]) = '2' autocreated indexed=no < '1', '2', '3', '4', '5'
 - addContainerWithinTheNavbar (boolean) = 'false' autocreated indexed=no
```
## Customize brand

Here are the Customize brand properties `bootstrap5mix:brand`.

| Label | Name | Description |
| --- | --- | --- | 
| Brand text | `brandText` | Set the text used on the brand section | 
| Brand image | `brandImage` | Image used on the brand section | 
| Brand image for small devices | `brandImageMobile` | Image used for small devices |

These 3 properties can be set when you use a navbar. You can also override the settings (typically if the navbar is included in a template set, in the studio) by editing the site node. 

### Customize brand definition
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

## Customize the navbar

Here are a few properties to fully configure your navigation bar by setting CSS classes on all levels

| Label | Name | Description | Default value |
| --- | --- | --- | --- |
| Class(es) for the main nav  | `navClass` | CSS classes to set on the main `<nav>` tag | `navbar navbar-expand-lg navbar-light bg-light` |
| Class(es) for the toggle button | `togglerClass` | CSS classes to set on the `<button>` used as a toggler | `navbar-toggler navbar-toggler-right` | 
| Class(es) for the toggleable section | `divClass` | CSS classes to set on toggleable section (on the `nav > div` tag) | `collapse navbar-collapse`|
| Class(es) for the navigation list | `ulClass` | CSS classes to set on navigation list | `navbar-nav me-auto`|
| Class(es) for the sign in section | `loginMenuULClass` | CSS classes to set on sign in section| `navbar-nav ms-auto`|

### Definition of Customize the navbar

```cnd
[bootstrap5mix:customizeNavbar] mixin
 extends = bootstrap5nt:navbar
 itemtype = content
 - navClass (string) = 'navbar navbar-expand-lg navbar-light bg-light' autocreated indexed=no
 - togglerClass (string) = 'navbar-toggler navbar-toggler-right' indexed=no
 - divClass (string) = 'collapse navbar-collapse' autocreated indexed=no
 - ulClass (string) = 'navbar-nav me-auto' autocreated indexed=no
 - loginMenuULClass (string) = 'navbar-nav ms-auto'
```

## Usage of the dedicated view

Also, you can use this component with another existing view. This view is called “Only display the navigation list”

![alt_text](../images/navigation-view.png "View" )

As a result, the generated HTML will only contain the navigation list. This can be used for instance on a footer section, to only display the main sections of the website.

On the following example, the *Class(es) for the navigation list* is set to `footer-links` and the *Display sub pages* is set to `false`
 
```html
<ul class="footer-link">
    <li class="nav-item ">
        <a class="nav-link" href="/cms/render/default/en/sites/myCorp/home/page-1.html">Page 1</a>
    </li>
    <li class="nav-item ">
        <a class="nav-link" href="/cms/render/default/en/sites/myCorp/home/page-2.html">Page 2</a>
    </li>
    <li class="nav-item ">
        <a class="nav-link" href="/cms/render/default/en/sites/myCorp/home/page-3.html">Page 3</a>
    </li>
</ul>
```
[Back to README](../README.md)
