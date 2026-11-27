## Summary

<!-- What does this PR do? 1-3 bullet points. -->

-
-

## Type of change

<!-- Check all that apply -->

- [ ] Bug fix
- [ ] New feature / component
- [ ] Documentation update
- [ ] Dependency update (Bootstrap, Jahia parent POM, …)
- [ ] Refactoring (no functional change)
- [ ] Release / version bump

## Checklist

### Code

- [ ] New/changed node types follow the naming conventions (`bootstrap5nt:` / `bootstrap5mix:`) in the component's `definition.cnd` or `settings/definitions.cnd`
- [ ] New CND properties have `indexed=no` (unless search is explicitly required)
- [ ] Views (`*.server.tsx`) write editor values through React props, not through `dangerouslySetInnerHTML` or inline scripts built from values
- [ ] Links set by editors go through `safeUrl`
- [ ] JSP views kept in `bootstrap5-core` use JSTL only (no scriptlets) and escape values with `fn:escapeXml`
- [ ] No hardcoded user-visible strings: labels go through i18n
- [ ] New Java classes have Javadoc on all public methods

### i18n

- [ ] New CND properties and choice values have keys in `bootstrap5-components/resources/bootstrap5-components*.properties` (six languages), with a help text (`.ui.tooltip`) when the label is not self-explanatory
- [ ] Texts rendered by the views have keys in `settings/locales/*.json`
- [ ] Non-ASCII characters are escaped as `\uXXXX` in all `.properties` files
- [ ] The node type itself has a label key (e.g. `bootstrap5nt_myComponent=My Component`)

### Tests

- [ ] Tested in **edit mode** (component appears in picker, properties form works, no console errors)
- [ ] Tested in **live mode** (HTML output is correct, no Jahia errors in logs)
- [ ] Tested with **no optional mixins** set (defaults render cleanly)
- [ ] Tested with **all optional mixins** enabled
- [ ] `yarn test` (vitest) passes in `bootstrap5-components`; Cypress spec added or updated in `tests/cypress/e2e/` for new behaviour

### Documentation

- [ ] New component has a doc page in `docs/` (or an existing page is updated)
- [ ] `CHANGELOG.md` entry added under `[Unreleased]`
- [ ] `docs/developer/cnd-definitions.md` updated if new node types were added
- [ ] Screenshots regenerated with `tests/ci.screenshots.sh` if the rendering changed

## Related issues

<!-- Closes #... -->

## Screenshots / HTML output

<!-- Paste relevant HTML output or a screenshot of the component in edit and live mode -->
