# Installation

## Prerequisites

- Jahia 8.2.3.0 or later
- The `default` module must be running (it is shipped with Jahia)

## Installing the full stack

The package is a ZIP file (`bootstrap5-package-3.0.0-SNAPSHOT.zip`) containing all modules and a `provisioning.yaml` install script. It must be deployed via the **provisioning API** — not the module manager UI, which only handles OSGi JARs.

```bash
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:PASSWORD \
  -F 'script=@bootstrap5-package-3.0.0-SNAPSHOT.zip'
```

The `provisioning.yaml` is embedded inside the ZIP — Jahia extracts it automatically. Do not pass it as a separate file.

The provisioning script installs all modules in the correct order:
1. `skins` (dependency)
2. `bootstrap5-core` (OSGi bundle — CND definitions, Java initializers)
3. `bootstrap5-components` (JS module — TSX component views)
4. `bootstrap5-templates-starter` (JS module — page templates)

### Installing modules individually

If needed, each module can be deployed separately:

```bash
# 1. bootstrap5-core (via module manager or provisioning)
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:PASSWORD \
  -F 'script=[{"installOrUpgradeModule":"bootstrap5-core.jar"}]' \
  -F 'file=@bootstrap5-core-3.0.0-SNAPSHOT.jar;filename=bootstrap5-core.jar'

# 2. bootstrap5-components
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:PASSWORD \
  -F 'script=[{"installOrUpgradeModule":"package.tgz","ignoreChecks":true}]' \
  -F 'file=@bootstrap5-components-3.0.0-SNAPSHOT.tgz;filename=package.tgz'

# 3. bootstrap5-templates-starter
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:PASSWORD \
  -F 'script=[{"installOrUpgradeModule":"package.tgz","ignoreChecks":true}]' \
  -F 'file=@bootstrap5-templates-starter-3.0.0-SNAPSHOT.tgz;filename=package.tgz'
```

## Activating on a site

When creating a **new site**, select `bootstrap5-templates-starter` as the template set. Jahia automatically activates `bootstrap5-components` and `bootstrap5-templates-starter` via `j:installedModules` declared in `settings/import.xml`.

To activate the modules on an **existing site**:

```bash
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:PASSWORD \
  -H 'Content-Type: text/yaml' \
  --data-binary '
- enable: "bootstrap5-components"
  site: "YOUR_SITE_KEY"
- enable: "bootstrap5-templates-starter"
  site: "YOUR_SITE_KEY"
'
```

Or use the Jahia administration UI under **Sites → Your Site → Installed modules**.

## Verifying the installation

Check the Jahia logs for these lines after deploying `bootstrap5-components`:

```
[TemplatePackageRegistry] Registered 'bootstrap5-components (javascript module)'
[javascript-modules-engine] Registered bundle bootstrap5-components
[StaticDefinitionsRegistry] Successfully loaded static fieldSets for name bootstrap5mix:brand ...
Registered Jahia component: bootstrap5-components_view_bootstrap5nt:accordion_default
...
```

And for `bootstrap5-templates-starter`:

```
[TemplatePackageRegistry] Registered 'bootstrap5-templates-starter (javascript module)'
Registered Jahia component: bootstrap5-templates-starter_view_jnt:template_bootstrap5-templates-starter
Registered Jahia component: bootstrap5-templates-starter_view_jnt:template_bootstrap5-templates-starter.sticky-footer
```
