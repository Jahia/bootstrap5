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

- [ ] `definitions.cnd` — new/changed node types follow naming conventions (`bootstrap5nt:` / `bootstrap5mix:`)
- [ ] All new CND properties have `indexed=no` (unless search is explicitly required)
- [ ] JSP views use JSTL tags only — no `<% scriptlets %>`
- [ ] EL variables are typed with `<%--@elvariable id="..." type="..."--%>` declarations
- [ ] No hardcoded strings in JSPs — all user-visible text goes through i18n
- [ ] New Java classes have Javadoc on all public methods

### i18n

- [ ] All new CND properties and choice values have keys in `bootstrap5-components.properties`
- [ ] Non-ASCII characters are escaped as `\uXXXX` in all `.properties` files
- [ ] The node type itself has a label key (e.g. `bootstrap5nt_myComponent=My Component`)

### Tests

- [ ] Tested in **edit mode** (component appears in picker, properties form works, no console errors)
- [ ] Tested in **live mode** (HTML output is correct, no Jahia errors in logs)
- [ ] Tested with **no optional mixins** set (defaults render cleanly)
- [ ] Tested with **all optional mixins** enabled

### Documentation

- [ ] New component has a doc page in `docs/` (or an existing page is updated)
- [ ] `CHANGELOG.md` entry added under `[Unreleased]`
- [ ] `docs/reference/node-types.md` updated if new node types were added

## Related issues

<!-- Closes #... -->

## Screenshots / HTML output

<!-- Paste relevant HTML output or a screenshot of the component in edit and live mode -->
