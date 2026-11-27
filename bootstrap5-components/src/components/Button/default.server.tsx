/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:button — six buttonType variants (internalLink, externalLink, modal,
 * collapse, popover, Offcanvas), each producing different HTML.
 *
 * react-bootstrap's Button component replaces the manual buildButtonClass helper.
 * Modal and Offcanvas overlay HTML is kept as-is because show/hide is driven by
 * Bootstrap.js (data-bs-* attributes); only their inner sub-components are used.
 * Collapse and Popover are fully Bootstrap.js–driven and unchanged.
 */
import {
  AddResources,
  buildNodeUrl,
  jahiaComponent,
  RenderChildren,
  useServerContext,
} from "@jahia/javascript-modules-library";
/** The server context a view receives as second argument. */
type ServerContext = ReturnType<typeof useServerContext>;
import { useTranslation } from "react-i18next";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Button } from "react-bootstrap";
import { BootstrapJS } from "../../utils/bootstrap-resources.js";
import { safeUrl } from "../../utils/safe-url.js";
import { TooltipScript } from "../../utils/tooltip.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ButtonBaseProps {
  /** jcr:title via mix:title — visible label */
  "jcr:title"?: string;
  /** Drives which mixin was injected by ButtonTypeInitializer */
  buttonType: "internalLink" | "externalLink" | "modal" | "collapse" | "popover" | "Offcanvas";
  // bootstrap5mix:buttonAdvancedSettings
  style?: string;
  size?: string;
  outline?: boolean;
  block?: boolean;
  state?: "default" | "active" | "disabled";
  cssClass?: string;
  disableTextWrapping?: boolean;
  stretchedLink?: boolean;
  tooltip?: string;
  tooltipPlacement?: string;
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

/**
 * Derives react-bootstrap Button props from the Jahia advanced settings.
 * Returns null when style === "custom" (caller must render plain HTML).
 */
function buttonProps(props: ButtonBaseProps) {
  const style = props.style ?? "primary";
  if (style === "custom") return null;

  // There is no outline variant of the link style (btn-outline-link does not exist)
  const variant = props.outline && style !== "link" ? `outline-${style}` : style;
  // The stored values are "btn-lg" / "btn-sm" (2.x choicelist); react-bootstrap wants "lg" / "sm".
  const storedSize = props.size?.replace(/^btn-/, "");
  const size: "lg" | "sm" | undefined = storedSize === "lg" || storedSize === "sm" ? storedSize : undefined;
  const active = props.state === "active";
  const disabled = props.state === "disabled";
  const extraClass = [
    // Full-width button: btn-block was removed in Bootstrap 5, utilities replace it
    props.block ? "d-block w-100" : "",
    props.cssClass ?? "",
    props.disableTextWrapping ? "text-nowrap" : "",
    props.stretchedLink ? "stretched-link" : "",
  ].filter(Boolean).join(" ") || undefined;

  // No aria-pressed for the "active" state: it is a visual state, not a toggle, and the attribute
  // is not allowed on links
  const aria: Record<string, string> = {};
  if (props.state === "disabled") aria["aria-disabled"] = "true";

  return { variant, size, active, disabled, className: extraClass, ...aria, ...tooltipAttributes(props) };
}

/**
 * Attributes of the optional tooltip (bootstrap5mix:buttonAdvancedSettings). The text goes in
 * data-bs-title, never in title (a title would show a second, native tooltip and be read twice).
 * Not on a popover button (one overlay per trigger) nor on a disabled one (it cannot be focused).
 */
function tooltipAttributes(props: ButtonBaseProps): Record<string, string> {
  const text = (props.tooltip ?? "").trim();
  if (!text || props.buttonType === "popover" || props.state === "disabled") return {};
  return {
    "data-b5-tooltip": "true",
    "data-bs-title": text,
    "data-b5-tooltip-placement": props.tooltipPlacement ?? "top",
  };
}

/**
 * Attributes of a link styled as a button. react-bootstrap's <Button as="a"> adds role="button"
 * and tabindex to a real link, which makes it announce as a button: the classes are written here.
 */
function linkProps(bsProps: NonNullable<ReturnType<typeof buttonProps>>): Record<string, string> {
  const { variant, size, active, disabled, className, ...attributes } = bsProps;
  const classes = ["btn", `btn-${variant}`, size ? `btn-${size}` : "", active ? "active" : "", disabled ? "disabled" : "", className ?? ""]
    .filter(Boolean).join(" ");
  return {
    ...(attributes as Record<string, string>),
    className: classes,
    // A disabled link cannot be followed nor reached with the keyboard
    ...(disabled ? { tabIndex: "-1" } : {}),
  };
}

/** Fallback for style === "custom": plain class string */
function customClass(props: ButtonBaseProps): string {
  return props.cssClass ?? "";
}

// ---------------------------------------------------------------------------
// View
// ---------------------------------------------------------------------------

/**
 * What a view renders of a button that opens a panel (modal, collapse, offcanvas):
 * - "all": the trigger and its panel (a button on its own);
 * - "trigger": the trigger only, and "panel": the panel only. A button group renders the triggers
 *   side by side and the panels after the group: a panel between two buttons breaks the group.
 */
type ButtonPart = "all" | "trigger" | "panel";

const PANEL_TYPES = ["modal", "collapse", "Offcanvas"];

const buttonView = (part: ButtonPart | "auto") =>
  (props: ButtonBaseProps, { renderContext, currentNode }: ServerContext) => {
    const { t } = useTranslation();
    const title = props["jcr:title"];
    const bsProps = buttonProps(props);
    const id = `button_${currentNode.getIdentifier()}`;

    // Inside a button group the default view only renders the trigger
    let resolvedPart: ButtonPart = part === "auto" ? "all" : part;
    if (part === "auto") {
      try {
        if (currentNode.getParent().isNodeType("bootstrap5nt:buttonGroup")) resolvedPart = "trigger";
      } catch {
        resolvedPart = "all";
      }
    }
    const showTrigger = resolvedPart !== "panel";
    const showPanel = resolvedPart !== "trigger";
    if (!showTrigger && !PANEL_TYPES.includes(props.buttonType ?? "")) return null;
    const hasTooltip = showTrigger && Object.keys(tooltipAttributes(props)).length > 0;

    const renderButton = () => {
    switch (props.buttonType) {

      // ── Internal link ──────────────────────────────────────────────────
      case "internalLink": {
        const linkNode = props.internalLink;
        if (!linkNode) {
          return renderContext.isEditMode() ? (
            <span className="badge text-bg-warning">{t("bootstrap5nt_button.noLink")}</span>
          ) : null;
        }
        const href = buildNodeUrl(linkNode);
        const label = title || linkNode.getDisplayableName();
        return bsProps
          ? <a href={href} id={id} {...linkProps(bsProps)}>{label}</a>
          : <a href={href} className={customClass(props)} {...tooltipAttributes(props)} id={id}>{label}</a>;
      }

      // ── External link ──────────────────────────────────────────────────
      case "externalLink": {
        // safeUrl turns javascript:, data: and other non-http(s)/mailto/tel schemes into "#" (as in 2.x)
        const href = safeUrl(props.externalLink);
        const label = title || t("bootstrap5nt_button.readMore");
        const isBlank = href === "#" || href === "http://";
        if (isBlank && renderContext.isEditMode()) {
          return <span className="badge text-bg-warning">{t("bootstrap5nt_button.noUrl")}</span>;
        }
        if (isBlank) {
          // No usable URL in live: a disabled button rather than a link that goes nowhere
          return bsProps
            ? <Button id={id} {...bsProps} disabled>{label}</Button>
            : <button type="button" className={customClass(props)} {...tooltipAttributes(props)} id={id} disabled>{label}</button>;
        }
        return bsProps
          ? <a href={href} id={id} {...linkProps(bsProps)}>{label}</a>
          : <a href={href} className={customClass(props)} {...tooltipAttributes(props)} id={id}>{label}</a>;
      }

      // ── Modal ──────────────────────────────────────────────────────────
      // Trigger uses react-bootstrap Button; overlay HTML stays as-is for Bootstrap.js.
      // Modal.Header / Modal.Body / Modal.Footer are used for the inner structure.
      case "modal": {
        const label = title || t("bootstrap5nt_button.readMore");
        const closeLabel = props.closeText || t("bootstrap5nt_button.close");
        const sizeClass = props.modalSize && props.modalSize !== "default"
          ? ` modal-${props.modalSize}` : "";
        const centeredClass = props.verticallyCentered ? " modal-dialog-centered" : "";
        const modalId = `modal-${currentNode.getIdentifier()}`;
        const modalLabelId = `modalLabel_${currentNode.getIdentifier()}`;
        return (
          <>
            <BootstrapJS />
            {showTrigger && (bsProps
              ? (
                <Button
                  id={id}
                  data-bs-toggle="modal"
                  data-bs-target={`#${modalId}`}
                  aria-haspopup="dialog"
                  {...bsProps}
                >
                  {label}
                </Button>
              ) : (
                <button
                  type="button"
                  className={customClass(props)} {...tooltipAttributes(props)}
                  data-bs-toggle="modal"
                  data-bs-target={`#${modalId}`}
                  aria-haspopup="dialog"
                  id={id}
                >
                  {label}
                </button>
              ))}
            {/* Overlay — Bootstrap.js manages show/hide via data-bs-toggle above.
                In edit mode: shown inline (class "show" + display:block + position:static)
                so editors can reach the Area inside the modal body. */}
            {showPanel && (<div
              className="modal fade"
              id={modalId}
              tabIndex={-1}
              role="dialog"
              // Named by its title, or by the text of its button when it has no title
              {...(props.modalTitle ? { "aria-labelledby": modalLabelId } : { "aria-label": label })}
              aria-hidden="true"
              {...(props.staticBackdrop
                ? { "data-bs-backdrop": "static", "data-bs-keyboard": "false" }
                : {})}
            >
              <div
                className={`modal-dialog modal-dialog-scrollable${centeredClass}${sizeClass}`}
                style={renderContext.isEditMode() ? { margin: "5px" } : undefined}
              >
                <div className="modal-content">
                  {props.modalTitle && (
                    <div className="modal-header">
                      <h5 className="modal-title" id={modalLabelId}>{props.modalTitle}</h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label={t("bootstrap5nt_button.close")}
                      />
                    </div>
                  )}
                  <div className="modal-body">
                    {/* The droppable content is the button's direct children, as in 2.x; "Add content" in edit mode */}
                    <RenderChildren filter="jmix:droppableContent" />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className={`btn btn-${!props.style || props.style === "custom" ? "secondary" : props.style}`}
                      data-bs-dismiss="modal"
                    >
                      {closeLabel}
                    </button>
                  </div>
                </div>
              </div>
            </div>)}
          </>
        );
      }

      // ── Collapse ───────────────────────────────────────────────────────
      // Uses <button> (not <a href="#...">) to avoid Jahia edit-frame link interception.
      case "collapse": {
        const label = title || t("bootstrap5nt_button.readMore");
        const collapseId = `collapse-${currentNode.getIdentifier()}`;
        const isExpanded = props.show ? "true" : "false";
        return (
          <>
            <BootstrapJS />
            {showTrigger && (bsProps
              ? (
                <Button
                  id={id}
                  data-bs-toggle="collapse"
                  data-bs-target={`#${collapseId}`}
                  aria-expanded={isExpanded}
                  aria-controls={collapseId}
                  {...bsProps}
                >
                  {label}
                </Button>
              ) : (
                <button
                  type="button"
                  id={id}
                  className={customClass(props)} {...tooltipAttributes(props)}
                  data-bs-toggle="collapse"
                  data-bs-target={`#${collapseId}`}
                  aria-expanded={isExpanded}
                  aria-controls={collapseId}
                >
                  {label}
                </button>
              ))}
            {showPanel && (<div className={`collapse${props.show ? " show" : ""}`} id={collapseId}>
              {/* The droppable content is the button's direct children, as in 2.x; "Add content" in edit mode */}
              <RenderChildren filter="jmix:droppableContent" />
            </div>)}
          </>
        );
      }

      // ── Popover ────────────────────────────────────────────────────────
      // Requires Bootstrap.js initialisation — no SSR-compatible react-bootstrap equivalent.
      // A popover dismissed on the next click (data-bs-trigger="focus") must be an <a> with a
      // tabindex, not a <button>: browsers do not all give the focus to a clicked button
      // (Bootstrap docs, Popovers, "Dismiss on next click").
      case "popover": {
        const label = title || t("bootstrap5nt_button.readMore");
        // Popovers are opt-in in Bootstrap. The script may be inserted in the head: wait for the page
        // and for Bootstrap's script (2.x did the same through jQuery's ready handler).
        const initScript = `(function () {
  function init() {
    if (!window.bootstrap) { return; }
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(function (el) {
      window.bootstrap.Popover.getOrCreateInstance(el);
    });
  }
  if (document.readyState === 'complete') { init(); } else { window.addEventListener('load', init); }
})();`;
        return (
          <>
            <BootstrapJS />
            {bsProps
              ? (
                <a
                  id={id}
                  role="button"
                  tabIndex={0}
                  data-bs-toggle="popover"
                  {...(props.popoverTitle ? { "data-bs-title": props.popoverTitle } : {})}
                  {...(props.popoverContent ? { "data-bs-content": props.popoverContent } : {})}
                  {...(props.html ? { "data-bs-html": "true" } : {})}
                  data-bs-container="body"
                  data-bs-placement={props.direction ?? "top"}
                  data-bs-trigger="focus"
                  {...linkProps(bsProps)}
                >
                  {label}
                </a>
              ) : (
                <a
                  role="button"
                  tabIndex={0}
                  className={customClass(props)}
                  data-bs-toggle="popover"
                  {...(props.popoverTitle ? { "data-bs-title": props.popoverTitle } : {})}
                  {...(props.popoverContent ? { "data-bs-content": props.popoverContent } : {})}
                  {...(props.html ? { "data-bs-html": "true" } : {})}
                  data-bs-container="body"
                  data-bs-placement={props.direction ?? "top"}
                  data-bs-trigger="focus"
                  id={id}
                >
                  {label}
                </a>
              )}
            <AddResources type="inline" inlineResource={`<script>${initScript}</script>`} />
          </>
        );
      }

      // ── Offcanvas ──────────────────────────────────────────────────────
      // Trigger uses react-bootstrap Button; overlay HTML stays as-is for Bootstrap.js.
      // Offcanvas.Header / Offcanvas.Body are used for the inner structure.
      case "Offcanvas": {
        const offcanvasId = `offcanvas_${currentNode.getIdentifier()}`;
        return (
          <>
            <BootstrapJS />
            {showTrigger && (bsProps
              ? (
                <Button
                  data-bs-toggle="offcanvas"
                  data-bs-target={`#${offcanvasId}`}
                  aria-controls={offcanvasId}
                  {...bsProps}
                >
                  {title}
                </Button>
              ) : (
                <button
                  type="button"
                  className={customClass(props)} {...tooltipAttributes(props)}
                  data-bs-toggle="offcanvas"
                  data-bs-target={`#${offcanvasId}`}
                  aria-controls={offcanvasId}
                >
                  {title}
                </button>
              ))}
            {/* Overlay — Bootstrap.js manages show/hide */}
            {showPanel && (<div
              className={`offcanvas offcanvas-${props.placement ?? "start"}`}
              data-bs-scroll={props.enableBodyScrolling ? "true" : "false"}
              // As in 2.x: no backdrop unless enabled (the property is not autocreated)
              data-bs-backdrop={props.enableBackdrop === true ? "true" : "false"}
              tabIndex={-1}
              id={offcanvasId}
              // The panel is labelled by its title, or by the button text when it has none (as in 2.x)
              {...(props.OffcanvasTitle
                ? { "aria-labelledby": `${offcanvasId}Label` }
                : { "aria-label": title || t("bootstrap5nt_button.readMore") })}
            >
              {/* The close button is always there: without it, and without a backdrop, a panel
                  with no title could only be closed with Escape */}
              <div className="offcanvas-header">
                {props.OffcanvasTitle && (
                  <h5 className="offcanvas-title" id={`${offcanvasId}Label`}>
                    {props.OffcanvasTitle}
                  </h5>
                )}
                <button
                  type="button"
                  className="btn-close ms-auto"
                  data-bs-dismiss="offcanvas"
                  aria-label={t("bootstrap5nt_button.close")}
                />
              </div>
              <div className="offcanvas-body">
                {/* The droppable content is the button's direct children, as in 2.x; "Add content" in edit mode */}
                <RenderChildren filter="jmix:droppableContent" />
              </div>
            </div>)}
          </>
        );
      }

      // ── Unknown type ───────────────────────────────────────────────────
      default:
        return renderContext.isEditMode() ? (
          <span className="badge text-bg-warning">
            Unknown buttonType: {props.buttonType}
          </span>
        ) : null;
    }
    };

    return (
      <>
        {renderButton()}
        {hasTooltip && (
          <>
            <BootstrapJS />
            <TooltipScript />
          </>
        )}
      </>
    );
  };

jahiaComponent(
  {
    nodeType: "bootstrap5nt:button",
    componentType: "view",
    name: "default",
    displayName: "Button",
  },
  buttonView("auto"),
);

// The panel of a button on its own: rendered by the button group after its buttons
jahiaComponent(
  {
    nodeType: "bootstrap5nt:button",
    componentType: "view",
    name: "hidden.panel",
    displayName: "Button panel",
  },
  buttonView("panel"),
);
