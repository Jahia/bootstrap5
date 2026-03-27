# Installation & Deployment

## Prerequisites

- Jahia 8.2.3.0 or later
- The `default` module must be running (it is shipped with Jahia)

---

## First install

### Option A — Single-JAR install (recommended)

Deploy just `bootstrap5-package`. When it starts, it automatically installs and starts `skins`, `bootstrap5-core`, `bootstrap5-components`, and `bootstrap5-templates-starter` in the correct order.

```bash
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:PASSWORD \
  -F 'script=[{"installOrUpgradeModule":"bootstrap5-package.jar"}]' \
  -F 'file=@bootstrap5-package-3.0.0-SNAPSHOT.jar;filename=bootstrap5-package.jar'
```

Redeploying the same JAR is safe — on stop, the package uninstalls the TGZ bundles it owns; on start, it reinstalls or updates them cleanly.

### Option B — Deploy each module individually

Deploy in this exact order:

```bash
# 1. skins (dependency of bootstrap5-core)
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:PASSWORD \
  -F 'script=[{"installOrUpgradeModule":"skins-8.2.0.jar"}]' \
  -F 'file=@skins-8.2.0.jar'

# 2. bootstrap5-core
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:PASSWORD \
  -F 'script=[{"installOrUpgradeModule":"bootstrap5-core.jar"}]' \
  -F 'file=@bootstrap5-core-3.0.0-SNAPSHOT.jar;filename=bootstrap5-core.jar'

# 3. bootstrap5-components
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:PASSWORD \
  -F 'script=[{"installOrUpgradeModule":"package.tgz","ignoreChecks":true}]' \
  -F 'file=@bootstrap5-components-3.0.0-SNAPSHOT.tgz;filename=package.tgz'

# 4. bootstrap5-templates-starter
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:PASSWORD \
  -F 'script=[{"installOrUpgradeModule":"package.tgz","ignoreChecks":true}]' \
  -F 'file=@bootstrap5-templates-starter-3.0.0-SNAPSHOT.tgz;filename=package.tgz'
```

Or combine all four files in a single provisioning call:

```bash
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:PASSWORD \
  -F 'script=[{"installOrUpgradeModule":"skins-8.2.0.jar"},{"installOrUpgradeModule":"bootstrap5-core-3.0.0-SNAPSHOT.jar"},{"installOrUpgradeModule":"bootstrap5-components-3.0.0-SNAPSHOT.tgz","ignoreChecks":true},{"installOrUpgradeModule":"bootstrap5-templates-starter-3.0.0-SNAPSHOT.tgz","ignoreChecks":true}]' \
  -F 'file=@skins-8.2.0.jar' \
  -F 'file=@bootstrap5-core-3.0.0-SNAPSHOT.jar' \
  -F 'file=@bootstrap5-components-3.0.0-SNAPSHOT.tgz' \
  -F 'file=@bootstrap5-templates-starter-3.0.0-SNAPSHOT.tgz'
```

---

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

To disable a module on a site:

```bash
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:PASSWORD \
  -H 'Content-Type: text/yaml' \
  --data-binary '- disable: "bootstrap5-components"
  site: "YOUR_SITE_KEY"'
```

---

## Updating modules

### Updating via bootstrap5-package

Redeploy the new `bootstrap5-package` JAR — the activator handles stopping the old TGZ bundles and installing the new versions.

### Updating individual modules

```bash
# JS module (TGZ) — ignoreChecks required for SNAPSHOT versions
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:PASSWORD \
  -F 'script=[{"installOrUpgradeModule":"package.tgz","ignoreChecks":true}]' \
  -F 'file=@bootstrap5-components-3.0.0-SNAPSHOT.tgz;filename=package.tgz'

# Java module (JAR)
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:PASSWORD \
  -F 'script=[{"installOrUpgradeModule":"module.jar"}]' \
  -F 'file=@bootstrap5-core-3.0.0-SNAPSHOT.jar;filename=module.jar'
```

---

## Checking module status

```bash
AUTH=$(echo -n "root:PASSWORD" | base64)
curl -s http://YOUR_JAHIA/modules/api/bundles \
  -H "Authorization: Basic $AUTH" | \
  python3 -c "import sys,json; [print(b['symbolicName'], b['state']) for b in json.load(sys.stdin) if 'bootstrap5' in b.get('symbolicName','')]"
```

Expected states: `bootstrap5-core`, `bootstrap5-components`, `bootstrap5-templates-starter` → `Active`

---

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

---

## Karaf console

Access the Karaf console via SSH or the Jahia tools:

```bash
# List installed bundles matching bootstrap5
osgi:list | grep bootstrap5

# Start a specific bundle by ID
osgi:start <bundle-id>

# Restart the JS engine
bundle:restart <bootstrap5-components-id>
```

---

## Clustered environments

The provisioning API broadcasts to all cluster nodes automatically via Cellar. Monitor each node's logs to confirm the module is `Active` everywhere.
