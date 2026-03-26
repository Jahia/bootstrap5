# Integrator / Template Developer Guide

This guide is for developers who build and customize page templates, theme assets, and site structures using the Bootstrap 5 JS module stack.

## Contents

- [Template structure](template-structure.md) — How page templates are composed and what areas they expose
- [Areas reference](areas.md) — Naming conventions and droppable area configuration
- [Mixins reference](mixins.md) — Complete list of opt-in mixins and their fields
- [Customization](customization.md) — Theming, CSS overrides, and module-level static resources

## Architecture overview

The template set is a pure JavaScript module (`bootstrap5-templates-starter`) with `module-type: templatesSet`. It declares:

- The site structure via `settings/import.xml` (template hierarchy, initial home page)
- Two page templates implemented as TSX server components
- A dependency on `bootstrap5-core` for Bootstrap CSS/JS assets

Component views (accordion, card, grid, etc.) live in a separate module, `bootstrap5-components`, which is automatically activated on new sites via `j:installedModules` in `import.xml`.

```
Request
  └─ Jahia rendering engine
       ├─ bootstrap5-templates-starter  ← page template (html, head, body, areas)
       └─ bootstrap5-components          ← component views (accordion, card, grid…)
```

## Module dependencies

```
bootstrap5-templates-starter
  └─ bootstrap5-core  (Bootstrap CSS/JS assets, choicelist initializers)

bootstrap5-components
  └─ bootstrap5-core
```
