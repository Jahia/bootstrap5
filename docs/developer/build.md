# Build System

## Tools

| Tool | Version | Role |
|------|---------|------|
| Node.js | 20.19.0 (bundled) | JavaScript runtime |
| npm | bundled with Node | Package management |
| Vite + `@jahia/vite-plugin` | latest | TSX → CommonJS compilation |
| TypeScript | ^5.0.0 | Type checking |
| Maven | 3.x | Orchestrates JS builds, packages the reactor |

Each JS module bundles its own Node binary at `node/node` to guarantee a consistent Node version regardless of the system.

## Build commands

### `bootstrap5-js-rendering`

```bash
cd bootstrap5-js-rendering

# Type-check + compile + pack TGZ
node/node node/node_modules/.bin/npm run build:maven

# Development watch mode (recompiles on file change)
node/node node/node_modules/.bin/npm run dev
```

**Output:** `dist/package.tgz`

### `bootstrap5-templates-starter-js`

```bash
cd bootstrap5-templates-starter-js
node/node node/node_modules/.bin/npm run build:maven
```

**Output:** `dist/package.tgz`

### Full Maven reactor build

```bash
# From the repository root — builds all modules in dependency order
mvn clean install

# Build only the two Java modules
mvn clean install -pl bootstrap5-core,bootstrap5-package -am
```

The `frontend-maven-plugin` in each JS module's `pom.xml` automatically invokes `npm run build:maven` during the Maven `generate-resources` phase.

## TGZ contents

The TGZ artifact is what Jahia installs. It contains exactly what is listed in the `files` array of `package.json`.

### `bootstrap5-js-rendering` TGZ

```
package/
├─ dist/server/index.js          Compiled TSX views
├─ META-INF/
│   ├─ definitions.cnd           Node type definitions
│   └─ jahia-content-editor-forms/  13 form JSON files
├─ resources/                    i18n .properties (6 languages)
├─ img/                          ~60 thumbnail images
├─ javascript/                   ckconfig.js + libs
└─ package.json
```

### `bootstrap5-templates-starter-js` TGZ

```
package/
├─ dist/server/index.js          Compiled TSX templates
├─ settings/
│   └─ import.xml                Site import structure
├─ css/
│   └─ starter-edit.css          Edit-mode CSS tweak
└─ package.json
```

## Deploying to Jahia

```bash
AUTH=$(echo -n "root:YOUR_PASSWORD" | base64)

curl -X POST http://localhost:8080/modules/api/provisioning \
  -H "Authorization: Basic $AUTH" \
  -F 'script=[{"installOrUpgradeBundle":"package.tgz","ignoreChecks":true}]' \
  -F 'file=@dist/package.tgz;filename=package.tgz'
```

`ignoreChecks: true` allows deploying SNAPSHOT versions.

## Node version constraint

The bundled Node is v20.19.0. The system Node (if different) may be too old for `@jahia/vite-plugin` (requires Node ≥ 20). Always use the bundled binary:

```bash
# Instead of: npm run build:maven
node/node node/node_modules/.bin/npm run build:maven
```

Or set the PATH:

```bash
export PATH="$(pwd)/node:$PATH"
npm run build:maven
```

## TypeScript configuration

`tsconfig.json` in each module is standard. Notable settings:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

Type checking runs as part of `build:maven` via `tsc --noEmit`. Fix all type errors before deploying.

## Troubleshooting build failures

| Error | Cause | Fix |
|-------|-------|-----|
| `styleText` not exported from `node:util` | System Node < 20 | Use bundled `node/node` |
| `tsc` errors on Java interop | `?.()` on Java method | Replace with explicit null guard (see [Architecture](architecture.md)) |
| TGZ missing files | Directory not in `files` | Add to `files` array in `package.json` |
