# Module Developer Guide

This guide is for developers who extend the Bootstrap 5 module stack — adding new components, modifying existing ones, or building modules that depend on it.

## Contents

- [Architecture](architecture.md) — Module structure, rendering pipeline, JS engine interop constraints
- [Adding a component](adding-components.md) — Step-by-step guide to adding a new component view
- [CND definitions](cnd-definitions.md) — How to define node types and mixins
- [Build system](build.md) — Build, package, and deploy workflow

## Quick start

```bash
# Build bootstrap5-components
cd bootstrap5-components
node/node node/node_modules/.bin/npm run build:maven

# Deploy to local Jahia
curl -X POST http://localhost:8080/modules/api/provisioning \
  -u root:1234 \
  -F 'script=[{"installOrUpgradeModule":"package.tgz","ignoreChecks":true}]' \
  -F 'file=@dist/package.tgz;filename=package.tgz'
```

## Repository layout

```
bootstrap5/
├─ bootstrap5-core/                  Java OSGi bundle — Bootstrap assets + initializers
│   ├─ src/main/java/                Choicelist initializer classes
│   ├─ src/main/resources/          Bootstrap CSS/JS (built by npm postinstall)
│   └─ pom.xml
├─ bootstrap5-components/          JS module — component views + CND
│   ├─ src/
│   │   ├─ components/               TSX view files + per-component CND (one folder per component)
│   │   │   ├─ Accordion/
│   │   │   │   ├─ default.server.tsx
│   │   │   │   └─ definition.cnd    Node type definition for this component
│   │   │   └─ … (12 component folders)
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
└─ pom.xml                           Maven reactor
```
