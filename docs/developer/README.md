# Module Developer Guide

This guide is for developers who extend the Bootstrap 5 module stack — adding new components, modifying existing ones, or building modules that depend on it.

## Contents

- [Architecture](architecture.md) — Module structure, rendering pipeline, JS engine interop constraints
- [Adding a component](adding-components.md) — Step-by-step guide to adding a new component view
- [CND definitions](cnd-definitions.md) — How to define node types and mixins
- [Build system](build.md) — Build, package, and deploy workflow

## Quick start

```bash
# Build bootstrap5-components (requires Yarn 4 via corepack)
cd bootstrap5-components
yarn build:maven

# Deploy to local Jahia
curl -X POST http://localhost:8080/modules/api/provisioning \
  -u root:1234 \
  -F 'script=[{"installOrUpgradeModule":"package.tgz","ignoreChecks":true}]' \
  -F 'file=@dist/package.tgz;filename=package.tgz'
```

See [Build system](build.md) for full build options including watch mode and Maven reactor.

## Repository layout

## Internal and utility components

In addition to the 12 content-editor-visible components, `bootstrap5-components` includes:

| Component | Node type | Purpose |
|-----------|-----------|---------|
| List | `jmix:list` | Generic list renderer — renders child nodes and an edit-mode drop zone. Used internally by Tabs and other container components. |
| Version | `bootstrap5nt:version` | Displays the deployed `bootstrap5-components` package version. Useful on a diagnostic page to confirm which version is running. |
| Privacy Settings Modal | `wemnt:privacySettingsModal` | Bootstrap 5 view for the Jahia WEM GDPR consent modal. Only relevant when the WEM module is deployed. |

---

## Repository layout

```
bootstrap5/
├─ bootstrap5-core/                  Java OSGi bundle — Bootstrap assets + initializers
│   ├─ src/main/java/                Choicelist initializer classes
│   ├─ src/main/resources/          Bootstrap CSS/JS
│   └─ pom.xml
├─ bootstrap5-components/          JS module — component views + CND
│   ├─ src/
│   │   ├─ components/               TSX view files + per-component CND (one folder per component)
│   │   │   ├─ Accordion/
│   │   │   │   ├─ default.server.tsx
│   │   │   │   └─ definition.cnd    Node type definition for this component
│   │   │   └─ … (15 component folders)
│   │   ├─ utils/                    Shared utilities (ImageTag, etc.)
│   │   └─ test/                     Vitest unit tests
│   ├─ settings/
│   │   └─ definitions.cnd           Namespaces + shared mixins (image, padding, margin)
│   ├─ META-INF/
│   │   └─ jahia-content-editor-forms/  Content Editor form customizations (13 JSON files)
│   ├─ resources/                    i18n .properties files
│   ├─ img/                          Thumbnail images for choicelist pickers
│   ├─ javascript/                   CKEditor config + static JS libs
│   ├─ package.json
│   └─ vite.config.js
├─ bootstrap5-templates-starter/  JS templatesSet — page templates
│   ├─ src/templates/                TSX template files
│   ├─ settings/
│   │   └─ import.xml                Site structure import
│   └─ package.json
├─ bootstrap5-package/             OSGi package bundle — embeds + auto-installs all modules
│   ├─ src/main/java/                Bootstrap5PackageActivator (BundleActivator)
│   ├─ src/main/resources/          bootstrap5-package.properties (version placeholder)
│   └─ pom.xml
├─ package.json                      Yarn 4 workspace root
└─ pom.xml                           Maven reactor
```
