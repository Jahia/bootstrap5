# CND Definitions

CND definitions in `bootstrap5-components` are split across two locations:

| File | Content |
|------|---------|
| `settings/definitions.cnd` | Namespace declarations + shared cross-component mixins (image, padding, margin) |
| `src/components/<Name>/definition.cnd` | Node types and mixins specific to one component (14 files) |

`package.json` includes both locations via:
```json
"files": ["src/**/*.cnd", "settings", ...]
```

## Namespaces

```cnd
<bootstrap5mix = 'http://www.jahia.org/bootstrap5/mix/1.0'>
<bootstrap5nt  = 'http://www.jahia.org/bootstrap5/nt/1.0'>
```

## Base mixin

```cnd
[bootstrap5mix:component] > jmix:droppableContent, jmix:accessControllableContent, jmix:editorialContent mixin
```

Declared in `bootstrap5-core` (`src/main/resources/META-INF/definitions.cnd`). All Bootstrap 5 node types extend this marker mixin. It allows other modules to query "is this a Bootstrap 5 component?" via `isNodeType("bootstrap5mix:component")`.

## Choicelist initializers

Three Java classes in `bootstrap5-core` (OSGi services, `bootstrap5-core/src/main/java/org/jahia/modules/bootstrap5/initializers/`) inject mixins automatically when a choicelist property is set:

### `gridTypeInitializer5`

Used on `bootstrap5mix:createRow#typeOfGrid`.

| Selected value | Auto-injected mixin |
|---------------|---------------------|
| `nogrid` | (none) |
| `predefinedGrid` | `bootstrap5mix:predefinedGrid` |
| `customGrid` | `bootstrap5mix:customGrid` |

CND usage:

```cnd
- typeOfGrid (string, choicelist[gridTypeInitializer5,resourceBundle])
    < 'nogrid', 'predefinedGrid', 'customGrid'
```

### `buttonTypeInitializer5`

Used on `bootstrap5nt:button#buttonType`.

| Selected value | Auto-injected mixin |
|---------------|---------------------|
| `externalLink` | `bootstrap5mix:externalLink` |
| `internalLink` | `bootstrap5mix:internalLink` |
| `modal` | `bootstrap5mix:modal` |
| `collapse` | `bootstrap5mix:collapse` |
| `popover` | `bootstrap5mix:popover` |
| `Offcanvas` | `bootstrap5mix:Offcanvas` |

### `navbarRootInitializer5`

Used on `bootstrap5nt:navbar#root`.

| Selected value | Auto-injected mixin |
|---------------|---------------------|
| `homePage` | (none) |
| `currentPage` | (none) |
| `parentPage` | (none) |
| `customRootPage` | `bootstrap5mix:customRootPage` |

## Adding a new choicelist initializer

Choicelist initializers are Java classes in `bootstrap5-core`. To add one:

1. Create a class extending `AbstractSimpleChoiceInitializer` in `bootstrap5-core/src/main/java/org/jahia/modules/bootstrap5/initializers/`
2. Annotate it with `@Component` (OSGi DS)
3. Override `getChoices()` returning a list of `ChoiceSpec.of(name)` or `ChoiceSpec.of(name, mixinToInject)`
4. Reference it by bean name in the CND property declaration

## CKEditor configuration

The `text` property on `bootstrap5nt:text` uses a custom CKEditor config:

```cnd
- text (string, richtext[ckeditor.toolbar='Tinny',
         ckeditor.customConfig='$context/modules/bootstrap5-components/javascript/ckconfig.js'])
    i18n
```

The config file is at `bootstrap5-components/javascript/ckconfig.js`. It defines the `Tinny` toolbar and references additional plugins (`cktemplates.js`, `beautify-html.min.js`, `purify.min.js`) from the same `javascript/` folder.

## Thumbnail images

Property values shown as image tiles in the Content Editor (e.g. grid ratio pickers, alignment pickers) use the `moduleImage` option of the choicelist, `'png'` or `'svg'`:

```cnd
- grid (string, choicelist[resourceBundle, moduleImage='png']) = '4_8' autocreated indexed=no
    < '2_10', '3_9', '4_8', '4_4_4', ...
```

The images are in `bootstrap5-components/img/`, one per value (for example `img/4_8.png`; see the folder for the exact names).
