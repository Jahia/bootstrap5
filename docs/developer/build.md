# Build System

## Tools

| Tool | Version | Role |
|------|---------|------|
| Node.js | v22.12.0 (via Maven) | JavaScript runtime |
| Yarn | 4.x (via corepack) | Package management (day-to-day dev) |
| npm | bundled with Node | Package management (Maven build) |
| Vite + `@jahia/vite-plugin` | latest | TSX → CommonJS compilation |
| TypeScript | ^5.0.0 | Type checking |
| react-bootstrap | ^2.10.0 | React component library |
| Maven | 3.x | Orchestrates JS builds, packages the reactor |

The repository root is a **Yarn 4 workspace** (`package.json` with `"workspaces": ["bootstrap5-components", "bootstrap5-templates-starter"]`). For day-to-day development use Yarn; Maven builds use a locally-installed Node (`frontend-maven-plugin` downloads Node v22.12.0 to `.node/` inside each JS module on first build).

## Build commands

### Day-to-day development (Yarn 4)

Requires Yarn 4 — enable via `corepack enable` if you haven't already.

```bash
# From the repository root — build all workspaces
yarn build

# Or from within a module
cd bootstrap5-components
yarn build       # type-check + compile + pack TGZ
yarn dev         # watch mode (recompiles on file change)
yarn test        # run Vitest suite once
yarn test:watch  # Vitest watch mode
```

**Output:** `dist/package.tgz` in each module.

### Full Maven reactor build

```bash
# From the repository root — builds all modules in dependency order
mvn clean install

# Build only the Java modules (skip JS workspaces)
mvn clean install -pl bootstrap5-core,bootstrap5-package -am
```

The `frontend-maven-plugin` in each JS module's `pom.xml` installs Node v22.12.0 to `.node/` (on first run) and invokes `npm run build:maven` during the Maven `compile` phase.

## TGZ contents

The TGZ artifact is what Jahia installs. It contains exactly what is listed in the `files` array of `package.json`.

### `bootstrap5-components` TGZ

```
package/
├─ dist/server/index.js          Compiled TSX views
├─ src/components/*/definition.cnd  Per-component node type definitions (15 files)
├─ settings/
│   └─ definitions.cnd           Namespaces + shared mixins
├─ META-INF/
│   └─ jahia-content-editor-forms/  13 Content Editor form JSON files
├─ resources/                    i18n .properties (6 languages)
├─ img/                          ~60 thumbnail images
├─ javascript/                   ckconfig.js + libs
└─ package.json
```

### `bootstrap5-templates-starter` TGZ

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
  -F 'script=[{"installOrUpgradeModule":"package.tgz","ignoreChecks":true}]' \
  -F 'file=@dist/package.tgz;filename=package.tgz'
```

`ignoreChecks: true` allows deploying SNAPSHOT versions.

## Node version constraint

Maven builds download **Node v22.12.0** to `.node/` inside each JS module (via `frontend-maven-plugin`). This happens automatically on `mvn compile` or `mvn install`.

For Yarn-based dev, the system Node must be ≥ 18. Yarn 4 is managed via `corepack` — run `corepack enable` once to activate it.

## Unit tests

`bootstrap5-components` includes a Vitest suite covering component views:

```bash
cd bootstrap5-components

# Run all tests once
yarn test

# Watch mode
yarn test:watch
```

Tests live in `src/test/components/`. Mocks for `@jahia/javascript-modules-library`, `react-bootstrap`, and `react-i18next` are in `src/test/mocks/`. The test `tsconfig.test.json` extends the main tsconfig with test-only path aliases.

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

Type checking runs as part of `build:maven` via `tsc --noEmit`. Fix all type errors before deploying. Test files are excluded from the main tsconfig via `"exclude": ["src/test"]` — they are checked by `tsconfig.test.json` instead.

## Troubleshooting build failures

| Error | Cause | Fix |
|-------|-------|-----|
| `command not found: yarn` | corepack not enabled | Run `corepack enable` |
| `tsc` errors on Java interop | `?.()` on Java method | Replace with explicit null guard (see [Architecture](architecture.md)) |
| TGZ missing files | Directory not in `files` | Add to `files` array in `package.json` |
| Maven `npm: command not found` | `.node/` not yet populated | Run `mvn install` once to download Node |
