/**
 * bootstrap5nt:version — rendering contract smoke test
 *
 * This is the simplest possible component: it renders a version badge.
 * Its only purpose is to validate that:
 *   1. The module loads in Jahia
 *   2. jahiaComponent() registers views correctly
 *   3. Props flow from JCR → React props
 *   4. renderContext is accessible
 *
 * Once this renders in Jahia, Sprint 1 & 2 are proven. Delete or keep as
 * a permanent smoke test.
 */
import { jahiaComponent } from "@jahia/javascript-modules-library";

jahiaComponent(
  {
    nodeType: "bootstrap5nt:version",
    componentType: "view",
    name: "default",
    displayName: "Bootstrap 5 Version (JS)",
  },
  (_props, { renderContext }) => (
    <div data-testid="bs5-version">
      bootstrap5-js-rendering
      {renderContext.isEditMode() && (
        <span style={{ marginLeft: "0.5rem", opacity: 0.6 }}>[edit mode]</span>
      )}
    </div>
  ),
);
