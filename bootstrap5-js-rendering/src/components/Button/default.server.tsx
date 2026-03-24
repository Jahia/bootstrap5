/**
 * bootstrap5nt:button — SSR view
 *
 * Faithful reproduction of button.jsp. Six buttonType variants, each producing
 * different HTML. Advanced settings are driven by the bootstrap5mix:buttonAdvancedSettings
 * mixin which is injected at save time by ButtonTypeInitializer (Java).
 *
 * Rendering parity checklist (from button.jsp):
 *   [x] buttonClass built from style, outline, size, state, block, cssClass, nowrap, stretchedLink
 *   [x] internalLink  → <a href="..."> with node URL; falls back to displayableName as title
 *   [x] externalLink  → <a href="..."> with raw URL
 *   [x] modal         → <button> + hidden .modal div with droppable body
 *   [x] collapse      → <a> + .collapse div with droppable body
 *   [x] popover       → <button data-bs-toggle="popover"> + AddResources init script
 *   [x] Offcanvas     → <button> + .offcanvas panel with droppable body
 *   [x] Edit-mode warnings for missing link / URL
 *   [x] aria-pressed / aria-disabled for active / disabled state
 *
 * Not in scope for Sprint 3:
 *   - Bootstrap CSS/JS resources (AddResources) — added once the template layer exists
 */
import {
  AddResources,
  Area,
  jahiaComponent,
  Render,
  useServerContext,
} from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import type { JCRNodeWrapper } from "org.jahia.services.content";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ButtonBaseProps {
  /** jcr:title via mix:title — visible label */
  "jcr:title"?: string;
  /** Drives which mixin was injected by ButtonTypeInitializer */
  buttonType: "internalLink" | "externalLink" | "modal" | "collapse" | "popover" | "Offcanvas";
  // bootstrap5mix:buttonAdvancedSettings (injected by mixin, may be absent)
  style?: string;
  size?: string;
  outline?: boolean;
  block?: boolean;
  state?: "default" | "active" | "disabled";
  cssClass?: string;
  disableTextWrapping?: boolean;
  stretchedLink?: boolean;
  // bootstrap5mix:internalLink
  internalLink?: JCRNodeWrapper;
  // bootstrap5mix:externalLink
  externalLink?: string;
  // bootstrap5mix:modal
  modalTitle?: string;
  closeText?: string;
  modalSize?: string;
  staticBackdrop?: boolean;
  verticallyCentered?: boolean;
  // bootstrap5mix:collapse
  show?: boolean;
  // bootstrap5mix:popover
  popoverTitle?: string;
  popoverContent?: string;
  direction?: string;
  html?: boolean;
  // bootstrap5mix:Offcanvas
  OffcanvasTitle?: string;
  placement?: string;
  enableBackdrop?: boolean;
  enableBodyScrolling?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds the btn CSS class string, mirroring the JSP logic exactly. */
function buildButtonClass(props: ButtonBaseProps): string {
  const style = props.style ?? "primary";
  const outline = props.outline ? "-outline" : "";
  const size = props.size && props.size !== "default" ? ` ${props.size}` : "";
  const state = props.state && props.state !== "default" ? ` ${props.state}` : "";
  const block = props.block ? " btn-block" : "";
  const cssClass = props.cssClass ? ` ${props.cssClass}` : "";
  const nowrap = props.disableTextWrapping ? " text-nowrap" : "";
  const stretched = props.stretchedLink ? " stretched-link" : "";

  if (style === "custom") {
    // "custom" uses cssClass verbatim as the full class string
    return props.cssClass ?? "";
  }
  return `btn btn${outline}-${style}${size}${state}${block}${cssClass}${nowrap}${stretched}`;
}

/** Returns aria attributes string based on button state. */
function ariaForState(state?: string): Record<string, string> {
  if (state === "active") return { "aria-pressed": "true" };
  if (state === "disabled") return { "aria-disabled": "true" };
  return {};
}

// ---------------------------------------------------------------------------
// View
// ---------------------------------------------------------------------------

jahiaComponent(
  {
    nodeType: "bootstrap5nt:button",
    componentType: "view",
    name: "default",
    displayName: "Button",
  },
  (props: ButtonBaseProps, { renderContext, currentNode }) => {
    const { t } = useTranslation();
    const title = props["jcr:title"];
    const buttonClass = buildButtonClass(props);
    const aria = ariaForState(props.state);
    const id = `button_${currentNode.getIdentifier()}`;

    switch (props.buttonType) {

      // ── Internal link ──────────────────────────────────────────────────
      case "internalLink": {
        const linkNode = props.internalLink;
        if (!linkNode) {
          // No target set yet — show warning in edit mode only
          return renderContext.isEditMode() ? (
            <span className="badge badge-warning">
              {t("bootstrap5nt_button.noLink")}
            </span>
          ) : null;
        }
        const href = linkNode.getUrl();
        const label = title || linkNode.getDisplayableName();
        return (
          <a href={href} className={buttonClass} role="button" {...aria} id={id}>
            {label}
          </a>
        );
      }

      // ── External link ──────────────────────────────────────────────────
      case "externalLink": {
        const href = props.externalLink ?? "";
        const label = title || t("bootstrap5nt_button.readMore");
        const isBlank = !href || href === "http://";
        if (isBlank && renderContext.isEditMode()) {
          return (
            <span className="badge badge-warning">
              {t("bootstrap5nt_button.noUrl")}
            </span>
          );
        }
        return (
          <a href={href} className={buttonClass} role="button" {...aria} id={id}>
            {label}
          </a>
        );
      }

      // ── Modal ──────────────────────────────────────────────────────────
      case "modal": {
        const label = title || t("bootstrap5nt_button.readMore");
        const closeLabel = props.closeText || t("bootstrap5nt_button.close");
        const size = props.modalSize && props.modalSize !== "default"
          ? ` modal-${props.modalSize}`
          : "";
        const centered = props.verticallyCentered ? " modal-dialog-centered" : "";
        const modalId = `modal-${currentNode.getIdentifier()}`;
        const modalLabelId = `modalLabel_${currentNode.getIdentifier()}`;
        return (
          <>
            <button
              type="button"
              className={buttonClass}
              {...aria}
              data-bs-toggle="modal"
              data-bs-target={`#${modalId}`}
              id={id}
            >
              {label}
            </button>
            <div
              className="modal fade"
              id={modalId}
              tabIndex={-1}
              role="dialog"
              aria-labelledby={modalLabelId}
              aria-hidden={renderContext.isEditMode() ? "false" : "true"}
              {...(props.staticBackdrop
                ? { "data-bs-backdrop": "static", "data-bs-keyboard": "false" }
                : {})}
            >
              <div
                className={`modal-dialog modal-dialog-scrollable${centered}${size}`}
                {...(renderContext.isEditMode() ? { style: { margin: "5px" } } : {})}
              >
                <div className="modal-content">
                  {props.modalTitle && (
                    <div className="modal-header">
                      <h5 className="modal-title" id={modalLabelId}>
                        {props.modalTitle}
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                  )}
                  <div className="modal-body">
                    {/* Render droppable child content */}
                    <Area name="modal-body" nodeTypes="jmix:droppableContent" />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className={`btn btn-${props.style ?? "primary"}`}
                      data-bs-dismiss="modal"
                    >
                      {closeLabel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      }

      // ── Collapse ───────────────────────────────────────────────────────
      case "collapse": {
        const label = title || t("bootstrap5nt_button.readMore");
        const show = props.show ? " show" : "";
        const collapseId = `collapse-${currentNode.getIdentifier()}`;
        return (
          <>
            <a
              href={`#${collapseId}`}
              className={`${buttonClass}${show}`}
              {...aria}
              role="button"
              data-bs-toggle="collapse"
              aria-expanded="false"
              aria-controls={collapseId}
              id={id}
            >
              {label}
            </a>
            <div className="collapse" id={collapseId}>
              <Area name="collapse-body" nodeTypes="jmix:droppableContent" />
            </div>
          </>
        );
      }

      // ── Popover ────────────────────────────────────────────────────────
      case "popover": {
        const label = title || t("bootstrap5nt_button.readMore");
        // Popovers require explicit JS initialisation.
        // Bootstrap 5 does not auto-init popovers unlike tooltips.
        const initScript = `document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => new bootstrap.Popover(el));`;
        return (
          <>
            <button
              type="button"
              className={buttonClass}
              {...aria}
              data-bs-toggle="popover"
              {...(props.popoverTitle ? { title: props.popoverTitle } : {})}
              {...(props.popoverContent
                ? { "data-bs-content": props.popoverContent }
                : {})}
              {...(props.html ? { "data-bs-html": "true" } : {})}
              data-bs-container="body"
              data-bs-placement={props.direction ?? "top"}
              data-bs-trigger="focus"
              id={id}
            >
              {label}
            </button>
            {/* Init script — Bootstrap 5 (no jQuery) */}
            <AddResources type="inline" inlineResource={`<script>${initScript}</script>`} />
          </>
        );
      }

      // ── Offcanvas ──────────────────────────────────────────────────────
      case "Offcanvas": {
        const offcanvasId = `offcanvas_${currentNode.getIdentifier()}`;
        return (
          <>
            <button
              className={buttonClass}
              type="button"
              {...aria}
              data-bs-toggle="offcanvas"
              data-bs-target={`#${offcanvasId}`}
              aria-controls={offcanvasId}
            >
              {title}
            </button>
            <div
              className={`offcanvas offcanvas-${props.placement ?? "start"}`}
              data-bs-scroll={props.enableBodyScrolling ? "true" : "false"}
              data-bs-backdrop={props.enableBackdrop !== false ? "true" : "false"}
              tabIndex={-1}
              id={offcanvasId}
              aria-labelledby={`${offcanvasId}Label`}
            >
              {props.OffcanvasTitle && (
                <div className="offcanvas-header">
                  <h5
                    className="offcanvas-title"
                    id={`${offcanvasId}Label`}
                  >
                    {props.OffcanvasTitle}
                  </h5>
                  <button
                    type="button"
                    className="btn-close text-reset"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                  />
                </div>
              )}
              <div className="offcanvas-body">
                <Area name="offcanvas-body" nodeTypes="jmix:droppableContent" />
              </div>
            </div>
          </>
        );
      }

      // ── Unknown type (should not happen) ───────────────────────────────
      default:
        return renderContext.isEditMode() ? (
          <span className="badge badge-warning">
            Unknown buttonType: {props.buttonType}
          </span>
        ) : null;
    }
  },
);
