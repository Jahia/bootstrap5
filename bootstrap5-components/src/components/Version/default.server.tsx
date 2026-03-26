/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
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
      bootstrap5-components
      {renderContext.isEditMode() && (
        <span style={{ marginLeft: "0.5rem", opacity: 0.6 }}>[edit mode]</span>
      )}
    </div>
  ),
);
