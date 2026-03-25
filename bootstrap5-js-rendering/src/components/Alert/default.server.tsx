/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5mix:alert — alert skin view registered on jmix:skinnable (view name "skins.alert").
 * Wraps children in a Bootstrap alert div; optionally adds a dismiss button.
 */
import { jahiaComponent, RenderChildren } from "@jahia/javascript-modules-library";

interface AlertProps {
  /** Bootstrap contextual colour — maps to alert-{color} */
  backgroundColor?: string;
  /** Adds a close button and the alert-dismissible fade show classes */
  addDismissButton?: boolean;
}

// ⚠️ nodeType below is a best-guess — validate before deploying.
// Candidates: "jmix:skinnable", "jmix:droppableContent"
jahiaComponent(
  {
    nodeType: "jmix:skinnable",
    name: "skins.alert",
    componentType: "view",
    displayName: "Alert",
  },
  ({ backgroundColor = "primary", addDismissButton = false }: AlertProps) => {
    const dismissClasses = addDismissButton ? " alert-dismissible fade show" : "";

    return (
      <div className={`alert alert-${backgroundColor}${dismissClasses}`} role="alert">
        {/* Wrapped content — equivalent to ${wrappedContent} in JSP */}
        <RenderChildren />
        {addDismissButton && (
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
          />
        )}
      </div>
    );
  },
);
