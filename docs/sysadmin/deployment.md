# Deployment

## Provisioning API

All module operations use the Jahia provisioning API at `POST /modules/api/provisioning`. Authentication requires a Jahia administrator account.

```bash
# Basic auth helper
AUTH=$(echo -n "root:PASSWORD" | base64)
curl -H "Authorization: Basic $AUTH" ...
```

## Deploying a module update

```bash
# JS module (TGZ)
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -H "Authorization: Basic $AUTH" \
  -F 'script=[{"installOrUpgradeBundle":"package.tgz","ignoreChecks":true}]' \
  -F 'file=@dist/package.tgz;filename=package.tgz'

# Java module (JAR)
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -H "Authorization: Basic $AUTH" \
  -F 'script=[{"installOrUpgradeBundle":"module.jar"}]' \
  -F 'file=@bootstrap5-core-2.4.5.jar;filename=module.jar'
```

`ignoreChecks: true` is required for SNAPSHOT versions to bypass the version check.

## Enabling / disabling on a site

```yaml
# Enable
- enable: "bootstrap5-js-rendering"
  site: "my-site"

# Disable
- disable: "bootstrap5-js-rendering"
  site: "my-site"
```

```bash
curl -X POST http://YOUR_JAHIA/modules/api/provisioning \
  -H "Authorization: Basic $AUTH" \
  -H 'Content-Type: text/yaml' \
  --data-binary '- enable: "bootstrap5-js-rendering"
  site: "my-site"'
```

## Checking module status

```bash
curl -s http://YOUR_JAHIA/modules/api/bundles \
  -H "Authorization: Basic $AUTH" | \
  python3 -c "import sys,json; [print(b['symbolicName'], b['state']) for b in json.load(sys.stdin) if 'bootstrap5' in b.get('symbolicName','')]"
```

Expected states:
- `bootstrap5-core` → `Active`
- `bootstrap5-js-rendering` → `Active`
- `bootstrap5-templates-starter-js` → `Active`

## Module startup order

Jahia resolves OSGi dependencies automatically. However, if `bootstrap5-js-rendering` is deployed before `bootstrap5-core`, it will fail to start with:

```
Bundle bootstrap5-js-rendering has unresolved dependency bootstrap5-core and won't be started
```

Deploy `bootstrap5-core` first, then start the JS modules:

```yaml
- installOrUpgradeBundle: "bootstrap5-core.jar"
- start: "bootstrap5-js-rendering"
- start: "bootstrap5-templates-starter-js"
```

## Using the Karaf console

Access the Karaf console via SSH or the Jahia tools:

```bash
# List installed bundles matching bootstrap5
osgi:list | grep bootstrap5

# Start a specific bundle by ID
osgi:start <bundle-id>

# Restart the JS engine
bundle:restart <bootstrap5-js-rendering-id>
```

## Clustered environments

In a clustered Jahia setup, the provisioning API broadcasts the operation to all cluster nodes automatically via Cellar. Monitor each node's logs to confirm the module is started everywhere.
