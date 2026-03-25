# System Administrator Guide

This guide covers installation, deployment, configuration, and troubleshooting of the Bootstrap 5 JS module stack for Jahia.

## Contents

- [Installation](installation.md) — Installing the module stack on a Jahia instance
- [Deployment](deployment.md) — Deploying individual modules and managing versions
- [Troubleshooting](troubleshooting.md) — Common errors and how to resolve them

## Module stack overview

Three modules must be deployed to get a fully functional Bootstrap 5 JS site:

| Module | Artifact type | Required |
|--------|--------------|----------|
| `bootstrap5-core` | `.jar` (OSGi bundle) | Yes — provides Bootstrap CSS/JS and Java initializers |
| `bootstrap5-js-rendering` | `.tgz` (JS module) | Yes — provides all component views and CND definitions |
| `bootstrap5-templates-starter-js` | `.tgz` (JS module, templatesSet) | Yes — provides page templates; required to create sites |

## Minimum Jahia version

Jahia **8.2.0.0** or later. The JS rendering engine (GraalVM polyglot) is required and available from this version.

## Supported Node.js

The modules bundle their own Node binary (v20.19.0). No system Node is required at runtime — Node is only needed at build time.
