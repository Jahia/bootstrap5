# Developer Guide — Module Contributors

This guide is for developers who work on the Bootstrap 5 module itself: adding features, fixing bugs, writing tests, and releasing.

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Java JDK | 11+ | Maven build |
| Maven | 3.6+ | Build system |
| Node.js | v18.x | Frontend asset build (downloaded automatically) |
| Jahia | 8.2.0.0+ | Local test server |
| Git | Any | Version control |

Node.js is **not required to be installed manually** — the `frontend-maven-plugin` downloads a local copy into `bootstrap5-core/node/` at build time.

---

## Local setup

```bash
# Clone the repository
git clone https://github.com/Jahia/bootstrap5.git
cd bootstrap5

# Build all modules
mvn clean package

# Build a single module
mvn package -pl bootstrap5-core
mvn package -pl bootstrap5-components
```

After the build, install the JARs on your local Jahia instance:

```
bootstrap5-core/target/bootstrap5-core-{version}.jar
bootstrap5-components/target/bootstrap5-components-{version}.jar
```

---

## Project structure

```
bootstrap5/
├── pom.xml                              Parent POM (version, shared config)
├── bootstrap5-core/
│   ├── pom.xml                          OSGi bundle config, frontend-maven-plugin
│   ├── package.json                     Bootstrap npm dependency
│   ├── copy-bootstrap.js                Copies Bootstrap dist assets at build time
│   └── src/main/resources/
│       ├── META-INF/definitions.cnd     Core node types (bootstrap5mix:component)
│       ├── bootstrap5nt_version/        Version component JSP
│       ├── css/                         Generated at build time — do not edit
│       └── javascript/                  Generated at build time — do not edit
├── bootstrap5-components/
│   ├── pom.xml
│   └── src/main/
│       ├── java/org/jahia/modules/bootstrap5/
│       │   ├── Functions.java                        JSP EL functions
│       │   ├── initializers/
│       │   │   ├── AbstractSimpleChoiceInitializer.java
│       │   │   ├── ButtonTypeInitializer.java
│       │   │   ├── GridTypeInitializer.java
│       │   │   └── NavbarRootInitializer.java
│       │   └── taglibs/
│       │       └── SwitchToLanguageTag.java
│       └── resources/
│           ├── META-INF/
│           │   ├── definitions.cnd              All component node types
│           │   ├── bootstrap5-components.tld    Custom taglib definition
│           │   └── jahia-content-editor-forms/  Content editor fieldsets (JSON)
│           ├── bootstrap5nt_*/html/             Component JSP views
│           ├── bootstrap5mix_*/html/            Mixin JSP views
│           ├── css/multilevel-nav.css
│           ├── javascript/multilevel-nav.js
│           └── resources/bootstrap5-components.properties  i18n labels
├── bootstrap5-templates-starter/        Sample template set
└── bootstrap5-package/                  Store package assembly
```

---

## Asset build pipeline

Bootstrap CSS and JS assets are **not committed** to the repository. They are downloaded and copied at build time:

1. Maven triggers `frontend-maven-plugin` during the `generate-resources` phase
2. The plugin downloads Node.js v18 locally into `bootstrap5-core/node/`
3. `npm install` runs, which triggers the `postinstall` hook
4. `copy-bootstrap.js` copies Bootstrap dist files from `node_modules/bootstrap/dist/` to:
   - `src/main/resources/css/`
   - `src/main/resources/javascript/`
5. It also generates `bootstrap5nt_version/html/_bootstrap-version.jspf` with the actual installed Bootstrap version

The generated files are in `.gitignore`. Never commit them manually.

To update the Bootstrap version, change the version in `bootstrap5-core/package.json`:

```json
{
  "dependencies": {
    "bootstrap": "5.3.8"
  }
}
```

---

## Java architecture

### Choice List Initializers

Choice list initializers provide dynamic behaviour in the Jahia content editor — they populate dropdown options and can trigger side-effects when a value is selected.

All initializers extend `AbstractSimpleChoiceInitializer` and are registered as OSGi services:

```java
@Component(
    service = ModuleChoiceListInitializer.class,
    property = {"j:choiceList.name=buttonTypeInitializer5"},
    immediate = true
)
public class ButtonTypeInitializer extends AbstractSimpleChoiceInitializer {
    // ...
}
```

**`ButtonTypeInitializer`** — populates the `buttonType` choice list and, crucially, adds a mixin to the node when the selection changes:

| Selected value | Mixin added |
|---|---|
| `internalLink` | `bootstrap5mix:internalLink` |
| `externalLink` | `bootstrap5mix:externalLink` |
| `collapse` | `bootstrap5mix:collapse` |
| `modal` | `bootstrap5mix:modal` |
| `popover` | `bootstrap5mix:popover` |
| `Offcanvas` | `bootstrap5mix:Offcanvas` |

**`GridTypeInitializer`** — manages grid type selection (predefined vs. custom), adding `bootstrap5mix:predefinedGrid` or `bootstrap5mix:customGrid` as appropriate.

**`NavbarRootInitializer`** — populates the starting page options for the navbar and handles the `customRootPage` mixin injection.

### Adding a new initializer

1. Create a class extending `AbstractSimpleChoiceInitializer`
2. Add the `@Component` annotation with a unique `j:choiceList.name`
3. Reference the name in `definitions.cnd`: `choicelist[yourInitializerName, resourceBundle]`
4. Add i18n labels in `bootstrap5-components.properties`

### Custom taglib (`SwitchToLanguageTag`)

`SwitchToLanguageTag` renders a language-switching link for the current page. It resolves the URL by looking up the page's available translations in JCR and building a render URL for the target locale.

The tag is declared in `bootstrap5-components.tld` and exposed as `<b5:switchToLanguageLink>`.

### `Functions.java`

Provides EL functions exposed via the `b5:` taglib prefix:

| Function | Signature | Description |
|---|---|---|
| `replaceAll` | `String replaceAll(String, String, String)` | Regex replace on a string |
| `isRtlLanguage` | `boolean isRtlLanguage(String)` | True if the language code uses a RTL script |

`isRtlLanguage` uses Unicode script range detection (Arabic, Hebrew, Syriac, Thaana, etc.) to avoid maintaining a hardcoded list of language codes.

---

## Content node type definitions (CND)

Node types are defined in `definitions.cnd` files. Key conventions:

```cnd
[bootstrap5nt:myComponent] > jnt:content, bootstrap5mix:component
  <%-- Properties --%>
  - myProp (string) = 'default' autocreated indexed=no

  <%-- Dynamic mixin injection via initializer --%>
  - myType (string, choicelist[myInitializer5, resourceBundle])
    = 'optionA' autocreated indexed=no
    < 'optionA', 'optionB'

  <%-- Droppable child area --%>
  + * (jmix:droppableContent) = jmix:droppableContent

[bootstrap5mix:myAdvancedSettings] mixin
  extends = bootstrap5nt:myComponent
  itemtype = content
  - advancedProp (boolean) = 'false' indexed=no
```

**Conventions:**
- Component node types: `bootstrap5nt:` prefix
- Mixin node types: `bootstrap5mix:` prefix
- Advanced settings mixins: always `extends = bootstrap5nt:componentName`
- All properties: `indexed=no` unless search is required
- i18n properties: add `i18n` keyword and a `bootstrap5-components.properties` entry

---

## i18n labels

All user-visible labels are in `bootstrap5-components.properties`. The key pattern is:

```properties
# Choice list values
mix_or_nt.propertyName.choiceValue=Human-readable label

# Component labels
bootstrap5nt_button.buttonType.internalLink=Internal link
bootstrap5nt_button.buttonType.modal=Modal

# Mixin labels
bootstrap5mix_buttonAdvancedSettings.style.primary=Primary
```

---

## Adding a new component

This walkthrough shows how to add a brand-new Bootstrap 5 component to the `bootstrap5-components` module from scratch. The example component is a **Quote** (`bootstrap5nt:quote`) that renders a Bootstrap `<blockquote>`, supports an optional author attribution, an advanced settings mixin, and the shared colours mixin.

Every step includes the actual code to write and an explanation of the conventions behind it.

---

### Step 1 — Define the node type (`definitions.cnd`)

All component and mixin node types live in:

```
bootstrap5-components/src/main/resources/META-INF/definitions.cnd
```

#### Naming conventions

| Prefix | Used for | Example |
|---|---|---|
| `bootstrap5nt:` | Concrete, droppable content types | `bootstrap5nt:quote` |
| `bootstrap5mix:` | Mixin types — optional trait bundles | `bootstrap5mix:quoteAdvancedSettings` |

#### The concrete node type

```cnd
// =============================================================================
// QUOTE
// =============================================================================
// Renders a Bootstrap <blockquote> with optional author attribution.
// Related mixins:
//   bootstrap5mix:quoteAdvancedSettings — alignment and extra CSS class
//   bootstrap5mix:colors                — background / text / border colour
// =============================================================================

[bootstrap5nt:quote] > jnt:content, bootstrap5mix:component, mix:title
  // Quote body — rich text stored per language
  - text (string,
          richtext[ckeditor.toolbar='Tinny',
                   ckeditor.customConfig='$context/modules/bootstrap5-components/javascript/ckconfig.js']
         ) i18n
  // Optional attribution line (e.g. "— Jane Doe, Acme Corp")
  - author (string) i18n indexed=no
```

Key points:

- **`> jnt:content, bootstrap5mix:component, mix:title`** — every droppable component must extend `jnt:content` and `bootstrap5mix:component`. The `bootstrap5mix:component` marker mixin (defined in `bootstrap5-core`) is what makes the type appear in the component picker. `mix:title` provides the built-in `jcr:title` property at no extra cost.
- **`i18n`** — tells Jahia to store a separate value per language. Use it for any human-readable text that editors may need to translate (quote body, author, captions). Omit it for structural/technical properties (CSS classes, booleans, alignment choices).
- **`indexed=no`** — suppresses Lucene/Solr indexing for this property. Add it to every property that does not need to appear in full-text search results. Omitting it on a string property means the value is indexed, which wastes index space for properties like CSS class names.
- **`autocreated`** — creates the property with its default value when a new node is created. Use it on choice-list properties (or any property with a meaningful default) so the node is never missing a required value. The `text` and `author` properties above are optional, so `autocreated` is intentionally absent.

#### The advanced settings mixin

```cnd
[bootstrap5mix:quoteAdvancedSettings] mixin
  extends = bootstrap5nt:quote
  itemtype = content
  // Bootstrap text-alignment utility class
  - align (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no
    < 'default', 'text-start', 'text-center', 'text-end'
  // Arbitrary extra CSS class(es) appended to the <figure> wrapper
  - cssClass (string) indexed=no
```

Key points:

- **`extends = bootstrap5nt:quote`** — restricts this mixin to nodes of type `bootstrap5nt:quote`. A mixin with the wrong (or missing) `extends` clause will not appear as an option on a Quote node in the content editor. This also means the same mixin name **cannot** be re-used across different component types — create a separate mixin per component.
- **`itemtype = content`** — required for Jahia to display the mixin's properties inside the content editor form. Without it the properties are hidden.
- **`autocreated`** on `align` ensures the default value `'default'` is always written to the node, so the JSP never receives a null.

#### The colours mixin extension

`bootstrap5mix:colors` already exists in `definitions.cnd` and `extends = bootstrap5nt:card`. To make it available on `bootstrap5nt:quote` as well, add a second `extends` target for the quote type. CND allows a mixin to appear on multiple concrete types by repeating the `extends` declaration:

```cnd
// Add this block immediately after the existing bootstrap5mix:colors definition.
// It re-opens the mixin to extend it to bootstrap5nt:quote as well.
[bootstrap5mix:colors] mixin
  extends = bootstrap5nt:quote
  itemtype = content
```

> **Note:** This block does **not** redeclare the properties — it only adds another `extends` target. Jahia merges the two declarations. The existing properties (`backgroundColor`, `textColor`, `borderColor`) become available on `bootstrap5nt:quote` nodes automatically.

---

### Step 2 — Create the JSP view

#### File location

The default view for a node type named `bootstrap5nt:quote` must be placed at:

```
bootstrap5-components/src/main/resources/bootstrap5nt_quote/html/quote.jsp
```

The folder naming rule is: replace the colon in the node type name with an underscore (`bootstrap5nt:quote` → `bootstrap5nt_quote`), then create an `html/` sub-folder. The file name (`quote.jsp`) matches the local part of the node type name. This is the **default** view — Jahia selects it whenever no explicit view name is requested.

#### Complete JSP

```jsp
<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c"        uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn"       uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="jcr"      uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="fmt"      uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%--@elvariable id="currentNode"     type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="renderContext"   type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>

<template:addResources type="css" resources="bootstrap.min.css"/>

<%-- ── Read base properties ─────────────────────────────────────────────── --%>
<c:set var="title"  value="${currentNode.properties['jcr:title'].string}"/>
<c:set var="text"   value="${currentNode.properties.text.string}"/>
<c:set var="author" value="${currentNode.properties.author.string}"/>

<%-- ── Advanced settings mixin ────────────────────────────────────────────--%>
<c:set var="align"    value=""/>
<c:set var="cssClass" value=""/>
<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:quoteAdvancedSettings')}">
    <c:set var="align"    value="${currentNode.properties.align.string}"/>
    <c:set var="cssClass" value="${currentNode.properties.cssClass.string}"/>
    <c:if test="${align eq 'default'}">
        <c:set var="align" value=""/>
    </c:if>
</c:if>

<%-- ── Colours mixin ───────────────────────────────────────────────────────--%>
<c:set var="backgroundColor" value=""/>
<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:colors')}">
    <c:set var="backgroundColor" value=" bg-${currentNode.properties.backgroundColor.string}"/>
    <c:if test="${backgroundColor eq ' bg-default'}">
        <c:set var="backgroundColor" value=""/>
    </c:if>
</c:if>

<%-- ── Assemble wrapper classes ───────────────────────────────────────────--%>
<c:set var="wrapperClass" value="blockquote-wrapper${empty align ? '' : ' '}${align}${backgroundColor}${empty cssClass ? '' : ' '}${cssClass}"/>

<%-- ── Render ───────────────────────────────────────────────────────────── --%>
<figure class="${wrapperClass}">
    <c:if test="${not empty title}">
        <p class="blockquote-title">${fn:escapeXml(title)}</p>
    </c:if>
    <blockquote class="blockquote">
        <%-- text is rich HTML from CKEditor — output unescaped --%>
        <c:if test="${not empty text}">${text}</c:if>
    </blockquote>
    <c:if test="${not empty author}">
        <figcaption class="blockquote-footer">
            ${fn:escapeXml(author)}
        </figcaption>
    </c:if>
</figure>
```

Points to note:

- **Taglib declarations** — always declare every `prefix` used in the file. Missing a declaration causes a JSP compile error at deploy time.
- **`@elvariable` hints** — not required at runtime, but they allow IDEs to type-check EL expressions and suppress false warnings.
- **`jcr:isNodeType(currentNode, 'bootstrap5mix:...')`** — the correct way to test for an optional mixin before reading its properties. Reading a property that belongs to a mixin not present on the node returns `null`, which causes a NullPointerException in EL.
- **Unescaped rich text** — `${text}` (no `fn:escapeXml`) is intentional for the CKEditor-managed body because the content is already sanitised HTML. By contrast, `author` and `title` are plain strings and must be escaped with `fn:escapeXml`.
- **No scriptlets** — Jahia's render pipeline processes JSPs in a non-standard class loader context. Using `<% %>` scriptlets can cause `ClassCastException` errors that are hard to diagnose. Always use JSTL tags and EL expressions.
- **`template:addResources`** — this injects the Bootstrap CSS link into the page `<head>` via the resource aggregator, regardless of where in the DOM this component is placed.

---

### Step 3 — Add i18n labels

Labels live in:

```
bootstrap5-components/src/main/resources/resources/bootstrap5-components.properties   (default / English)
bootstrap5-components/src/main/resources/resources/bootstrap5-components_fr.properties (French)
```

The key pattern is `{namespace}_{localName}[.{propertyName}[.{choiceValue}]] = Label`.

#### English (`bootstrap5-components.properties`)

Add a new block, keeping the file organised by component:

```properties
# -----------------------------------------------------------------------------
# QUOTE
# -----------------------------------------------------------------------------
bootstrap5nt_quote=Quote
bootstrap5nt_quote.text=Quote body
bootstrap5nt_quote.author=Attribution (author / source)

bootstrap5mix_quoteAdvancedSettings=Advanced settings
bootstrap5mix_quoteAdvancedSettings.align=Alignment
bootstrap5mix_quoteAdvancedSettings.align.default=Default
bootstrap5mix_quoteAdvancedSettings.align.text-start=Start
bootstrap5mix_quoteAdvancedSettings.align.text-center=Center
bootstrap5mix_quoteAdvancedSettings.align.text-end=End
bootstrap5mix_quoteAdvancedSettings.cssClass=Extra CSS class(es)
```

The entry with **no property suffix** (`bootstrap5nt_quote=Quote`) is the node type display name shown in the component picker and the content editor header. Without it, the UI shows the raw technical name `bootstrap5nt:quote`.

#### French (`bootstrap5-components_fr.properties`)

Non-ASCII characters must be escaped as `\uXXXX` in `.properties` files (Java's `native2ascii` convention). The Maven build converts them automatically via the `native2ascii-maven-plugin`, but writing them escaped directly is the safest approach:

```properties
# -----------------------------------------------------------------------------
# CITATION
# -----------------------------------------------------------------------------
bootstrap5nt_quote=Citation
bootstrap5nt_quote.text=Corps de la citation
bootstrap5nt_quote.author=Attribution (auteur\u00a0/ source)

bootstrap5mix_quoteAdvancedSettings=Param\u00e8tres avanc\u00e9s
bootstrap5mix_quoteAdvancedSettings.align=Alignement
bootstrap5mix_quoteAdvancedSettings.align.default=Par d\u00e9faut
bootstrap5mix_quoteAdvancedSettings.align.text-start=Gauche
bootstrap5mix_quoteAdvancedSettings.align.text-center=Centr\u00e9
bootstrap5mix_quoteAdvancedSettings.align.text-end=Droite
bootstrap5mix_quoteAdvancedSettings.cssClass=Classe(s) CSS suppl\u00e9mentaires
```

Common Unicode escapes used in this codebase:

| Character | Escape |
|---|---|
| `é` | `\u00e9` |
| `è` | `\u00e8` |
| `à` | `\u00e0` |
| `ê` | `\u00ea` |
| `ô` | `\u00f4` |
| `û` | `\u00fb` |
| `ç` | `\u00e7` |
| non-breaking space | `\u00a0` |
| em dash `—` | `\u2014` |

The `bootstrap5mix:colors` mixin labels (`bootstrap5mix_colors.*`) already exist in the properties file — no new entries are needed for the colours mixin itself.

---

### Step 4 — Register in `jahia-content-editor-forms` (optional but recommended)

#### What fieldset JSON files do

Jahia's content editor builds its form automatically from the CND, but without guidance it groups all properties from all active mixins into a single flat list. A **fieldset JSON** file tells the editor how to order and visually group the fieldsets (tabs/sections) for a given node type or mixin. This is optional — the component works without it — but it dramatically improves the editing experience.

#### File location

```
bootstrap5-components/src/main/resources/META-INF/jahia-content-editor-forms/fieldsets/bootstrap5nt_quote.json
```

One file per node type or mixin (named after the type, colon replaced by underscore). Create one file for the concrete type to control the ordering of the Content fieldset, and one per mixin if you need to control mixin field ordering separately.

#### `bootstrap5nt_quote.json`

```json
{
  "name": "bootstrap5nt:quote",
  "priority": 1.0,
  "rank": -3.0
}
```

#### `bootstrap5mix_quoteAdvancedSettings.json`

```json
{
  "name": "bootstrap5mix:quoteAdvancedSettings",
  "priority": 1.0,
  "rank": -2.0
}
```

The `rank` field controls the vertical order of fieldsets in the editor sidebar: lower (more negative) values appear first. The pattern used throughout this module is:

| Fieldset | Typical rank |
|---|---|
| Main content fieldset (concrete type) | `-3.0` |
| Advanced settings mixin | `-2.0` |
| Colours mixin | `-1.0` |

The `bootstrap5mix:colors` JSON (`bootstrap5mix_colors.json`) already exists in the repository with `"rank": -1.0`, so it will be ordered correctly without changes.

---

### Step 5 — Build and test

#### Build

```bash
# Build only the components module (fastest iteration loop)
mvn package -pl bootstrap5-components
```

The compiled JAR is written to:

```
bootstrap5-components/target/bootstrap5-components-{version}.jar
```

#### Deploy

Copy the JAR to your local Jahia instance's hot-deploy folder:

```bash
cp bootstrap5-components/target/bootstrap5-components-*.jar \
   /path/to/jahia/digital-factory-data/karaf/deploy/
```

Jahia watches that folder and reloads the module automatically — no server restart is needed in most cases. You can monitor the reload in the Jahia logs or the OSGi console (`System > OSGi console > Bundles`).

#### What to verify

| Where | What to check |
|---|---|
| **Component picker (edit mode)** | `Quote` appears in the picker under the expected category |
| **Content editor** | All fields render with correct labels; the Advanced settings and Colors sections appear when their checkboxes are ticked |
| **Edit mode rendering** | The `<figure>` / `<blockquote>` HTML is present in the page source; alignment classes are applied |
| **Live mode rendering** | Same as edit mode but without the Jahia edit-mode wrappers |
| **French site (if applicable)** | Labels in the content editor appear in French |
| **Browser console** | No JavaScript errors from Bootstrap |

---

### Tips and common mistakes

**Forgetting `bootstrap5mix:component` on the concrete type**

```cnd
// Wrong — component will not appear in the picker
[bootstrap5nt:quote] > jnt:content, mix:title
```

```cnd
// Correct
[bootstrap5nt:quote] > jnt:content, bootstrap5mix:component, mix:title
```

**Forgetting `indexed=no` on structural properties**

Every property that does not need to appear in search results should carry `indexed=no`. Forgetting it causes the property value to be written to the Lucene/Solr index on every content save, bloating the index with CSS class names, alignment tokens, and boolean flags.

**Using scriptlets instead of JSTL**

```jsp
<%-- Wrong — scriptlets break in Jahia's non-standard class loader --%>
<% String author = currentNode.getProperty("author").getString(); %>
```

```jsp
<%-- Correct — use EL and JSTL --%>
<c:set var="author" value="${currentNode.properties.author.string}"/>
```

**Not adding the i18n key for the node type itself**

If `bootstrap5nt_quote=Quote` is missing from the properties file, the component picker and the editor header both display the raw type name `bootstrap5nt:quote`. Always add the bare node-type key.

**Mixin `extends` targeting the wrong type**

```cnd
// Wrong — this mixin will NEVER appear on bootstrap5nt:quote nodes
[bootstrap5mix:quoteAdvancedSettings] mixin
  extends = bootstrap5nt:card
```

The `extends` value must exactly match the concrete node type that should carry this mixin. A mixin without `extends`, or with the wrong target, is either invisible in the editor or appears on the wrong component type.

**Reading a mixin property without checking `jcr:isNodeType` first**

```jsp
<%-- Wrong — throws NullPointerException if the mixin is not present --%>
<c:set var="align" value="${currentNode.properties.align.string}"/>
```

```jsp
<%-- Correct — guard with jcr:isNodeType before reading mixin properties --%>
<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:quoteAdvancedSettings')}">
    <c:set var="align" value="${currentNode.properties.align.string}"/>
</c:if>
```

---

## Testing changes locally

1. Build the changed module: `mvn package -pl bootstrap5-components`
2. Copy the JAR to your Jahia instance's `digital-factory-data/karaf/deploy/` (or use the admin UI)
3. Jahia hot-reloads the module — no server restart needed in most cases
4. Test in edit mode and live mode

---

## Contributing

### Branching

- `main` — stable, released code
- Feature branches: `feature/description`
- Bug fix branches: `fix/description`

### Pull requests

1. Fork the repository
2. Create a branch from `main`
3. Make your changes with clear, focused commits
4. Open a pull request against `main`
5. Use the [PR template](../PULL_REQUEST_TEMPLATE.md)

### Commit messages

Follow Conventional Commits:

```
feat: add underline tab style
fix: close <a> tag in language switcher
docs: update navbar brand resolution section
refactor: simplify multilevel nav groovy script
chore: update Bootstrap to 5.3.8
```

### Code style

- **JSP**: use JSTL tags; avoid scriptlets (`<% %>`); always declare EL variable types with `@elvariable`
- **Java**: standard Jahia OSGi patterns; Javadoc on all public methods
- **Groovy**: favour readability over cleverness; extract helper methods for recursive logic
- **CND**: keep properties `indexed=no`; document non-obvious constraints with comments

---

## Release process

1. **Update version** in all `pom.xml` files:
   ```bash
   mvn versions:set -DnewVersion=2.4.5
   ```

2. **Update Bootstrap version** in `bootstrap5-core/package.json` if needed

3. **Update `CHANGELOG.md`** with all changes since the last release

4. **Build and test** locally:
   ```bash
   mvn clean package
   ```

5. **Commit and tag**:
   ```bash
   git add -A
   git commit -m "chore: release 2.4.5"
   git tag bootstrap5-modules-2.4.5
   git push origin main --tags
   ```

6. **Create GitHub release** — use the CHANGELOG entry as the release description

---

[← Back to README](../README.md)
