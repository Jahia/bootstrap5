# Bootstrap 5 for Jahia

> ⚠️ **This branch (`main`) is under active development.**
>
> It is being migrated to a full JavaScript/React rendering stack. **Do not use this branch in production.**
>
> **Breaking changes** — the module names, CND definitions, and rendering pipeline have all changed significantly from the previous version.
>
> For stable, production-ready code use the **[`2_X` branch](https://github.com/Jahia/bootstrap5/tree/2_X)**.

---

A Bootstrap 5 implementation for the [Jahia Digital Experience Platform](https://www.jahia.com), being rewritten as a JavaScript module stack.

[![Jahia 8.2.3+](https://img.shields.io/badge/Jahia-8.2.3%2B-blue)](https://www.jahia.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Where do you want to go?

| I am… | My doc |
|---|---|
| ✍️ **Content editor** — I add and edit content in Jahia | [Content Editor Guide](docs/content-editor/README.md) |
| 🏗️ **Integrator / template developer** — I build Jahia templates | [Integrator Guide](docs/integrator/README.md) |
| 🔧 **Module developer** — I contribute to or extend this module | [Developer Guide](docs/developer/README.md) |
| 🖥️ **System administrator** — I install and operate Jahia | [SysAdmin Guide](docs/sysadmin/README.md) |

---

## Module stack

Four modules make up the full stack:

| Module | Artifact | Role |
|--------|----------|------|
| `bootstrap5-core` | `.jar` (OSGi) | Bootstrap CSS/JS assets, Java initializers |
| `bootstrap5-components` | `.tgz` (JS module) | All component views, CND definitions, Content Editor forms |
| `bootstrap5-templates-starter` | `.tgz` (JS module, templatesSet) | Page templates; required to create sites |
| `bootstrap5-package` | `.jar` (OSGi) | Self-contained installer — embeds and auto-installs all three modules above |

## Components

[Accordion](docs/content-editor/components/accordion.md) · [Alert](docs/content-editor/components/alert.md) · [Breadcrumb](docs/content-editor/components/breadcrumb.md) · [Button](docs/content-editor/components/button.md) · [Card](docs/content-editor/components/card.md) · [Carousel](docs/content-editor/components/carousel.md) · [Figure](docs/content-editor/components/figure.md) · [Grid & Layout](docs/content-editor/components/grid.md) · [Navbar](docs/content-editor/components/navbar.md) · [Pagination](docs/content-editor/components/pagination.md) · [Tabs](docs/content-editor/components/tabs.md) · [Text](docs/content-editor/components/text.md)

## Reference

[Mixin catalog](docs/integrator/mixins.md) · [Architecture](docs/developer/architecture.md) · [Build system](docs/developer/build.md) · [Changelog](CHANGELOG.md)

---

## Installation in 30 seconds

**From the Jahia Store:** Administration → Modules → Available modules → search *Bootstrap 5 package* → Install.

**From GitHub:** download the [latest release](https://github.com/Jahia/bootstrap5/releases/latest), then either:
- Deploy the single `bootstrap5-package` JAR — it auto-installs everything, or
- Deploy individually in order: `bootstrap5-core` (JAR) → `bootstrap5-components` (TGZ) → `bootstrap5-templates-starter` (TGZ)

> Requires **Jahia 8.2+** with GraalVM polyglot JS engine.

Full installation details → [SysAdmin Guide](docs/sysadmin/installation.md)
