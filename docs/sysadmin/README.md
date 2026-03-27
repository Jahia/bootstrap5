# System Administrator Guide

This guide covers installation, deployment, configuration, and troubleshooting of the Bootstrap 5 JS module stack for Jahia.

## Contents

- [Installation & Deployment](installation.md) — Installing, updating, and managing modules on a Jahia instance
- [Troubleshooting](troubleshooting.md) — Common errors and how to resolve them

## Module stack overview

Three modules must be running to get a fully functional Bootstrap 5 JS site. A fourth module (`bootstrap5-package`) bundles them all for easy deployment:

| Module | Artifact type | Role |
|--------|--------------|------|
| `bootstrap5-core` | `.jar` (OSGi bundle) | Bootstrap CSS/JS assets + Java choicelist initializers |
| `bootstrap5-components` | `.tgz` (JS module) | All component views + CND definitions + Content Editor forms |
| `bootstrap5-templates-starter` | `.tgz` (JS module, templatesSet) | Page templates; required to create new sites |
| `bootstrap5-package` | `.jar` (OSGi bundle) | Embeds and auto-installs all three modules above — single-JAR deployment |

## Minimum Jahia version

Jahia **8.2.3.0** or later. The JS rendering engine is required and available from this version.

> GraalVM has been replaced by OpenJDK in Jahia 8.2.3+ Docker images. No code changes are required — all `?.()` optional-call syntax has been removed from these modules.

## Supported Node.js

The modules bundle their own Node binary (v20.19.0). No system Node is required at runtime — Node is only needed at build time.
