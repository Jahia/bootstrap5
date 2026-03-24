/**
 * bootstrap5mix:alert — SSR view
 *
 * ⚠️  REGISTRATION UNCERTAINTY — READ BEFORE IMPLEMENTING
 *
 * In the Java module, alert is registered as a "skin" view on jmix:skinnable:
 *   jmix_skinnable/html/skinnable.skins.alert.jsp   (view name: "skins.alert")
 *
 * bootstrap5mix:alert is a jmix:templateMixin that extends jmix:droppableContent.
 * When this mixin is applied to a grid cell or content area, Jahia switches the
 * rendering to the "skins.alert" view.
 *
 * In the JS module the equivalent registration would be:
 *   jahiaComponent({ nodeType: "jmix:skinnable", name: "skins.alert", componentType: "view" }, ...)
 * or possibly:
 *   jahiaComponent({ nodeType: "jmix:droppableContent", name: "skins.alert", componentType: "view" }, ...)
 *
 * TODO: Validate the correct nodeType for mixin-based view registration with
 * the Jahia JS engine team before deploying. This is the open question from
 * Sprint 0 / Sprint 4.
 *
 * Rendering parity checklist (from skinnable.skins.alert.jsp):
 *   [x] <div class="alert alert-{color} [alert-dismissible fade show]" role="alert">
 *   [x] {wrappedContent} — children already rendered by Jahia, inserted via RenderChildren
 *   [x] dismiss button when addDismissButton=true (data-bs-dismiss="alert")
 *   [x] No React island needed — Bootstrap JS handles dismiss via data-bs-dismiss
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
