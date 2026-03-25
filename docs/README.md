# Bootstrap 5 for Jahia — Documentation

This documentation covers the Bootstrap 5 JS rendering stack for Jahia. It is organized by audience.

## Guides

| Audience | Description |
|----------|-------------|
| [Content Editor](content-editor/README.md) | How to create and configure page content using Bootstrap 5 components |
| [Integrator / Template Developer](integrator/README.md) | How to build and customize page templates, areas, and theme integration |
| [Module Developer](developer/README.md) | How to extend the module, add new components, and understand the architecture |
| [System Administrator](sysadmin/README.md) | How to install, deploy, configure, and troubleshoot the module stack |

## Module stack

The Bootstrap 5 rendering stack consists of three modules:

| Module | Type | Role |
|--------|------|------|
| `bootstrap5-core` | Java OSGi bundle | Bootstrap 5 CSS/JS assets + Java choicelist initializers |
| `bootstrap5-js-rendering` | JS module | Component CND definitions, TSX views, Content Editor forms, i18n |
| `bootstrap5-templates-starter-js` | JS templatesSet | Page templates (standard + sticky-footer), site import structure |
