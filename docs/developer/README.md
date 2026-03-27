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
