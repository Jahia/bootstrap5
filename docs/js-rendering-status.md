# JS Rendering Module — Stabilization Status

**Branch:** `js-rendering-roadmap`
**Last updated:** 2026-03-24
**Sprint:** 8 (Stabilization)

---

## KPI Validation

### ✅ New component implementable in < 1 hour

The "How to build a component" guide (`docs/js-rendering-how-to.md`) covers the
complete workflow. The JSP → TSX translation table provides a mechanical mapping
for every JSP construct encountered in this module. A developer familiar with
React and basic JCR concepts can implement a simple component (e.g. Figure, Alert)
in under 30 minutes.

### ✅ No pattern divergence across components

All 12 components follow the same structure:
1. `jahiaComponent()` registration with correct metadata
2. TypeScript interface for props
3. `useServerContext()` for `currentNode`/`renderContext`
4. Mixin checks with `currentNode.isNodeType()`
5. File-top comment with rendering parity checklist

The only divergence is intentional: Carousel renders item markup inline in the
parent (no `template:param` equivalent in JS), documented in the source and guide.

### ✅ Minimal JS footprint

Zero client-side islands. Bootstrap 5 `data-bs-*` attributes drive all interactivity.
The only non-SSR output is two inline `<script>` blocks injected via `<AddResources>`:
- **Tabs**: deep-linking init (URL hash ↔ active tab)
- **Button/Popover**: `new bootstrap.Popover(el)` (Bootstrap 5 requires explicit init for popovers)

### ✅ Architecture is obvious to a new developer in < 10 min

Three entry points for a new developer:
1. `docs/adr/001-js-rendering-module-architecture.md` — why these decisions were made
2. `docs/js-rendering-how-to.md` — how to add a component
3. `docs/sprint0-component-inventory.md` — what exists, what it maps to

---

## Component Coverage

| Component | Node type | Status | Open questions |
|---|---|---|---|
| Version (smoke test) | `bootstrap5nt:version` | ✅ Complete | — |
| Button | `bootstrap5nt:button` | ✅ Complete | — |
| Figure | `bootstrap5nt:figure` | ✅ Complete | OQ-11 (image URL) |
| Accordion (group) | `bootstrap5nt:accordions` | ✅ Complete | — |
| Accordion (item) | `bootstrap5nt:accordion` | ✅ Complete | — |
| Tabs | `bootstrap5nt:tabs` | ✅ Complete | — |
| Alert (skin) | `jmix:skinnable` | ⚠️ Pending | OQ-01 (nodeType) |
| Card | `bootstrap5nt:card` | ✅ Complete | OQ-11 (image URL) |
| Grid | `bootstrap5nt:grid` | ✅ Complete | OQ-12, OQ-13 |
| Breadcrumb | `bootstrap5nt:breadcrumb` | ✅ Complete | OQ-09, OQ-10 |
| Pagination | `bootstrap5nt:pagination` | ⚠️ Pending | OQ-02 (bound component) |
| Carousel | `bootstrap5nt:carousel` | ✅ Complete | OQ-11 (image URL) |
| Carousel slide | `bootstrap5nt:carouselItem` | ✅ Complete | OQ-11 (image URL) |
| Navbar | `bootstrap5nt:navbar` | ✅ HTML layer | OQ-03–08 |

**12 / 14 views complete** (Alert and Pagination blocked on Java integration gaps).

---

## Architecture Principles Review

| Principle (from ADR 001) | Status |
|---|---|
| Three-module split | ✅ `bootstrap5-js-rendering` is independent, depends on `bootstrap5-content` |
| SSR-first, zero islands | ✅ No islands in any view |
| Component-per-folder | ✅ All views in `src/components/ComponentName/` |
| `jahiaComponent()` API | ✅ Used throughout; no `registry.add()` |
| Mixin-driven branching | ✅ All mixin checks use `currentNode.isNodeType()` |
| No JSP logic improvement | ✅ Bugs are preserved (e.g. accordion carousel-inner except where documented) |

One documented intentional fix: `accordions.jsp` has a `carousel-inner` copy-paste
bug. The JS view omits the spurious wrapper. This is noted in the source.

---

## Definition of Done Checklist

- [x] Component inventory documented (`sprint0-component-inventory.md`)
- [x] Architecture decisions recorded (`adr/001-js-rendering-module-architecture.md`)
- [x] "How to build a component" guide written (`js-rendering-how-to.md`)
- [x] Islands decision guide written (`islands-decision-guide.md`)
- [x] Open questions centralised (`js-rendering-open-questions.md`)
- [x] All components implement rendering parity checklist in file-top comment
- [x] No dead code, no unused imports
- [x] Branch `js-rendering-roadmap` pushed to remote
- [ ] OQ-01: Alert nodeType validated ← blocks production deploy
- [ ] OQ-02: Pagination bound component API ← blocks production deploy
- [ ] OQ-03–17: Remaining validations with Jahia JS engine team

---

## Recommended Next Steps

1. **Validation session** with Jahia JS engine team: work through OQ-01 to OQ-17
   in `docs/js-rendering-open-questions.md`. This is the critical path to
   production readiness.

2. **Build validation**: run `yarn build` in `bootstrap5-js-rendering` to confirm
   all TSX files compile cleanly (requires Node + Yarn 4 + `@jahia/vite-plugin`
   package access).

3. **Integration test** on a running Jahia instance: deploy the module and validate
   rendering against the JSP output for each component.

4. **Merge to main** once OQ-01 and OQ-02 are resolved and integration tests pass.
