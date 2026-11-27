# Installation & Deployment

## Prerequisites

- Jahia 8.2.3.0 or later. The modules declare this version and Jahia refuses them on an older one.
- `javascript-modules-engine` 1.2.0 or later, **active**. Jahia 8.2.3 installs and starts the engine 1.2.0 by default; nothing to install. The stack does not install nor replace the engine: it is a platform module shared by every JavaScript module of the server.
- The `default` module (shipped with Jahia).

---

## First install

### Option A: the package (recommended)

Deploy `bootstrap5-package` only. When it starts, it installs and starts, in this order:

1. `skins` (embedded: Jahia 8.2.3 does not install it by default, and the Alert skin needs it);
2. `bootstrap5-core`;
3. once an active `javascript-modules-engine` 1.2.0 or later is found (it waits up to one minute for it): `bootstrap5-components` and `bootstrap5-templates-starter`.

```bash
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:YOUR_ROOT_PASSWORD \
  --form-string 'script=[{"installOrUpgradeBundle":"bootstrap5-package-3.0.3.jar","autoStart":true}]' \
  -F 'file=@bootstrap5-package-3.0.3.jar'
```

The log shows the steps:

```
Bootstrap5 package: installed skins-8.2.0.jar
Bootstrap5 package: installed bootstrap5-core-3.0.3.jar
Bootstrap5 package: javascript-modules-engine 1.2.0 found
Bootstrap5 package: installed bootstrap5-components-3.0.3.tgz
Bootstrap5 package: installed bootstrap5-templates-starter-3.0.3.tgz
```

When no active engine of the required version is found, the package logs the following error and does not install the two JavaScript modules; start or install the engine, then redeploy the package:

```
Bootstrap5 package: javascript-modules-engine 1.2.0 or later is required (found: none). bootstrap5-components and bootstrap5-templates-starter are NOT installed.
```

Redeploying the package is safe: on stop, it uninstalls the JavaScript modules it installed; on start, it installs or updates them.

### Option B: each module

Install in this order: `skins`, `bootstrap5-core`, `bootstrap5-components`, `bootstrap5-templates-starter`. One provisioning call can do it:

```bash
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -u root:YOUR_ROOT_PASSWORD \
  --form-string 'script=[
    {"installOrUpgradeBundle":"mvn:org.jahia.modules/skins/8.2.0","autoStart":true},
    {"installOrUpgradeBundle":"bootstrap5-core-3.0.3.jar","autoStart":true},
    {"installOrUpgradeBundle":"bootstrap5-components-3.0.3.tgz","autoStart":true},
    {"installOrUpgradeBundle":"bootstrap5-templates-starter-3.0.3.tgz","autoStart":true}]' \
  -F 'file=@bootstrap5-core-3.0.3.jar' \
  -F 'file=@bootstrap5-components-3.0.3.tgz' \
  -F 'file=@bootstrap5-templates-starter-3.0.3.tgz'
```

The `mvn:` form needs a Maven repository that holds the artifact (the Jahia public repository does): add `{"addMavenRepository":"https://devtools.jahia.com/nexus/content/groups/public/@id=Public"}` at the start of the script if Jahia does not know it.

---

## Upgrading from 2.x

A site built with the 2.x modules keeps its content when 3.x replaces them: the content definitions are kept, and the 3.x views read the content where 2.x stored it. The path below was tested from the 2.4.7 modules (`bootstrap5-core`, `bootstrap5-components`, `bootstrap5-templates-starter`) on Jahia 8.2.3.2: every piece of content was still displayed, in the same column, tab, panel or card part, the content editor forms kept their behaviour, and the pager, tabs, modals and edit mode worked.

1. **Upgrade Jahia first** to 8.2.3.0 or later if needed, and check that `javascript-modules-engine` is active (see [Checking module status](#checking-module-status)).
2. **Back up** the repository, and run the upgrade on a copy of the production data first.
3. **Deploy `bootstrap5-package` 3.x** as in [Option A](#option-a-the-package-recommended), without uninstalling 2.x. The package updates `bootstrap5-components` and `bootstrap5-templates-starter` in place, and installs and starts `bootstrap5-core` 3.x.
4. **Remove the old core**: `bootstrap5-core` 2.x stays installed, stopped, next to 3.x. Uninstall it:

   ```bash
   curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
     -u root:YOUR_ROOT_PASSWORD \
     --form-string 'script=[{"uninstallBundle":"org.jahiacommunity.modules/bootstrap5-core/2.4.7"}]'
   ```

5. **Check the sites**: open the main pages in live and in edit mode.

Known differences after the upgrade, on purpose:

- A collapse marked "open on load" is now open on load (2.x put the `show` class on the button, so the panel stayed closed).
- A popover button is rendered as a link with `role="button"`, which Bootstrap requires for a popover that closes on the next click.
- Classes removed in Bootstrap 5.3 are replaced by their 5.3 equivalents (for example `text-muted` by `text-body-secondary`).

See the [changelog](../../CHANGELOG.md) for the full list.

The repository holds an automated version of this test (`tests/ci.migration.sh`): it seeds a site with the 2.x modules, installs 3.x and compares both renderings.

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

## Rich text editor (CKEditor 5)

The rich text fields (the [Text](../content-editor/components/text.md) component) use CKEditor 4 by default. CKEditor 5 is provided by the Jahia module `richtext-ckeditor5`. Once that module is installed, enable it for each site in its configuration, `org.jahia.modules.richtextCKEditor5.cfg`:

```properties
# Enable CKEditor 5 for the listed sites (one line per site key)
includeSites[0]=YOUR_SITE_KEY
includeSites[1]=ANOTHER_SITE_KEY

# or enable it for every site
enabledByDefault=true
```

- `includeSites[n]=<siteKey>` enables CKEditor 5 for one site.
- `enabledByDefault=true` enables it for all sites.

Sites that are not enabled keep CKEditor 4.

`bootstrap5-core` registers the Bootstrap styles (lead, colours, alerts, badges, tables) in the CKEditor 5 configurations of the Jahia UI, under the same option as CKEditor 4, so the same field definition serves both editors. Nothing happens when `richtext-ckeditor5` is not installed.

---

## Updating modules

Deploy the new `bootstrap5-package`, as for a first install: it updates the modules it contains. To update one module only, use the same provisioning call as in [Option B](#option-b-each-module) with that file.

---

## Checking module status

The module management API returns the version and state of a module:

```bash
curl -s -u root:YOUR_ROOT_PASSWORD \
  'http://YOUR_JAHIA/modules/api/bundles/org.jahiacommunity.modules/bootstrap5-components/*/_localInfo'
# {"org.jahiacommunity.modules/bootstrap5-components/3.0.3":{"type":"MODULE","osgiState":"ACTIVE","moduleState":"STARTED"}}
```

Check `org.jahia.modules/javascript-modules-engine`, `org.jahia.modules/skins` and the four `org.jahiacommunity.modules/bootstrap5-*` modules: each must be `ACTIVE` / `STARTED`.

---

## Verifying the installation

Check the Jahia logs for these lines after deploying `bootstrap5-components`:

```
[TemplatePackageRegistry] Registered 'bootstrap5-components (javascript module)'
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
