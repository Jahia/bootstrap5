# System Administrator Guide

This guide covers installation, deployment, configuration, and troubleshooting of the Bootstrap 5 JS module stack for Jahia.

## Contents

- [Installation & Deployment](installation.md) — Installing, updating, and managing modules on a Jahia instance, and enabling CKEditor 5 for a site
- [Troubleshooting](troubleshooting.md) — Common errors and how to resolve them

## Module stack overview

Three modules must be running to get a fully functional Bootstrap 5 JS site. A fourth module (`bootstrap5-package`) bundles them all for easy deployment:

| Module | Artifact type | Role |
|--------|--------------|------|
| `bootstrap5-core` | `.jar` (OSGi bundle) | Bootstrap CSS/JS assets + Java choicelist initializers |
| `bootstrap5-components` | `.tgz` (JS module) | All component views + CND definitions + Content Editor forms |
| `bootstrap5-templates-starter` | `.tgz` (JS module, templatesSet) | Page templates; required to create new sites |
| `bootstrap5-package` | `.jar` (OSGi bundle) | Embeds and installs the three modules above and `skins`, which Jahia does not install by default |

## Minimum Jahia version

Jahia **8.2.3.0** or later. The JavaScript modules run on the `javascript-modules-engine` that Jahia 8.2.3 installs and starts by default (1.2.0); the stack does not install it. In Jahia 8.2.3 the JavaScript runtime (GraalJS) is provided by that engine.

## Node.js

Node.js is only needed to build the modules (the Maven build downloads Node 22). Jahia does not use Node.js at runtime: the views run in the engine.
