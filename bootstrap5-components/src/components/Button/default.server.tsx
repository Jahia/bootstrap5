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
  Area,
  jahiaComponent,
} from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Button, Modal, Offcanvas } from "react-bootstrap";

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

  const variant = props.outline ? `outline-${style}` : style;
  const size = props.size && props.size !== "default"
    ? (props.size as "sm" | "lg")
    : undefined;
  const active = props.state === "active";
  const disabled = props.state === "disabled";
  const extraClass = [
    props.block ? "btn-block" : "",
    props.cssClass ?? "",
    props.disableTextWrapping ? "text-nowrap" : "",
    props.stretchedLink ? "stretched-link" : "",
  ].filter(Boolean).join(" ") || undefined;

  const aria: Record<string, string> = {};
  if (props.state === "active") aria["aria-pressed"] = "true";
  if (props.state === "disabled") aria["aria-disabled"] = "true";

  return { variant, size, active, disabled, className: extraClass, ...aria };
}

/** Fallback for style === "custom": plain class string */
function customClass(props: ButtonBaseProps): string {
  return props.cssClass ?? "";
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
    const bsProps = buttonProps(props);
    const id = `button_${currentNode.getIdentifier()}`;

    switch (props.buttonType) {

      // ── Internal link ──────────────────────────────────────────────────
      case "internalLink": {
        const linkNode = props.internalLink;
        if (!linkNode) {
          return renderContext.isEditMode() ? (
            <span className="badge badge-warning">{t("bootstrap5nt_button.noLink")}</span>
          ) : null;
        }
        const href = String(linkNode.getUrl());
        const label = title || linkNode.getDisplayableName();
        return bsProps
          ? <Button as="a" href={href} role="button" id={id} {...bsProps}>{label}</Button>
          : <a href={href} className={customClass(props)} role="button" id={id}>{label}</a>;
      }

      // ── External link ──────────────────────────────────────────────────
      case "externalLink": {
        const href = props.externalLink ?? "";
        const label = title || t("bootstrap5nt_button.readMore");
        const isBlank = !href || href === "http://";
        if (isBlank && renderContext.isEditMode()) {
          return <span className="badge badge-warning">{t("bootstrap5nt_button.noUrl")}</span>;
        }
        return bsProps
          ? <Button as="a" href={href} role="button" id={id} {...bsProps}>{label}</Button>
          : <a href={href} className={customClass(props)} role="button" id={id}>{label}</a>;
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
            {bsProps
              ? (
                <Button
                  id={id}
                  data-bs-toggle="modal"
                  data-bs-target={`#${modalId}`}
                  {...bsProps}
                >
                  {label}
                </Button>
              ) : (
                <button
                  type="button"
                  className={customClass(props)}
                  data-bs-toggle="modal"
                  data-bs-target={`#${modalId}`}
                  id={id}
                >
                  {label}
                </button>
              )}
            {/* Overlay — Bootstrap.js manages show/hide via data-bs-toggle above.
                In edit mode: shown inline (class "show" + display:block + position:static)
                so editors can reach the Area inside the modal body. */}
            <div
              className={`modal fade${renderContext.isEditMode() ? " show" : ""}`}
              id={modalId}
              tabIndex={-1}
              role="dialog"
              aria-labelledby={modalLabelId}
              aria-hidden="false"
              style={renderContext.isEditMode()
                ? { display: "block", position: "static", zIndex: "auto" }
                : undefined}
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
                    <Modal.Header>
                      <Modal.Title id={modalLabelId}>{props.modalTitle}</Modal.Title>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </Modal.Header>
                  )}
                  <Modal.Body>
                    <Area name="modal-body" nodeType="jmix:droppableContent" numberOfItems={0} />
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant={props.style ?? "primary"}
                      data-bs-dismiss="modal"
                    >
                      {closeLabel}
                    </Button>
                  </Modal.Footer>
                </div>
              </div>
            </div>
          </>
        );
      }

      // ── Collapse ───────────────────────────────────────────────────────
      // Entirely Bootstrap.js–driven — no react-bootstrap equivalent for SSR.
      case "collapse": {
        const label = title || t("bootstrap5nt_button.readMore");
        const showClass = props.show ? " show" : "";
        const collapseId = `collapse-${currentNode.getIdentifier()}`;
        const cls = bsProps
          ? [
              "btn",
              `btn-${props.outline ? `outline-${props.style ?? "primary"}` : (props.style ?? "primary")}`,
              props.size && props.size !== "default" ? props.size : "",
              props.state && props.state !== "default" ? props.state : "",
              props.cssClass ?? "",
              showClass.trim(),
            ].filter(Boolean).join(" ")
          : `${customClass(props)}${showClass}`;
        return (
          <>
            <a
              href={`#${collapseId}`}
              className={cls}
              role="button"
              data-bs-toggle="collapse"
              aria-expanded="false"
              aria-controls={collapseId}
              id={id}
            >
              {label}
            </a>
            <div className="collapse" id={collapseId}>
              <Area name="collapse-body" nodeType="jmix:droppableContent" numberOfItems={0} />
            </div>
          </>
        );
      }

      // ── Popover ────────────────────────────────────────────────────────
      // Requires Bootstrap.js initialisation — no SSR-compatible react-bootstrap equivalent.
      case "popover": {
        const label = title || t("bootstrap5nt_button.readMore");
        const initScript = `document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => new bootstrap.Popover(el));`;
        return (
          <>
            {bsProps
              ? (
                <Button
                  id={id}
                  data-bs-toggle="popover"
                  {...(props.popoverTitle ? { title: props.popoverTitle } : {})}
                  {...(props.popoverContent ? { "data-bs-content": props.popoverContent } : {})}
                  {...(props.html ? { "data-bs-html": "true" } : {})}
                  data-bs-container="body"
                  data-bs-placement={props.direction ?? "top"}
                  data-bs-trigger="focus"
                  {...bsProps}
                >
                  {label}
                </Button>
              ) : (
                <button
                  type="button"
                  className={customClass(props)}
                  data-bs-toggle="popover"
                  {...(props.popoverTitle ? { title: props.popoverTitle } : {})}
                  {...(props.popoverContent ? { "data-bs-content": props.popoverContent } : {})}
                  {...(props.html ? { "data-bs-html": "true" } : {})}
                  data-bs-container="body"
                  data-bs-placement={props.direction ?? "top"}
                  data-bs-trigger="focus"
                  id={id}
                >
                  {label}
                </button>
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
            {bsProps
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
                  className={customClass(props)}
                  data-bs-toggle="offcanvas"
                  data-bs-target={`#${offcanvasId}`}
                  aria-controls={offcanvasId}
                >
                  {title}
                </button>
              )}
            {/* Overlay — Bootstrap.js manages show/hide */}
            <div
              className={`offcanvas offcanvas-${props.placement ?? "start"}`}
              data-bs-scroll={props.enableBodyScrolling ? "true" : "false"}
              data-bs-backdrop={props.enableBackdrop !== false ? "true" : "false"}
              tabIndex={-1}
              id={offcanvasId}
              aria-labelledby={`${offcanvasId}Label`}
            >
              {props.OffcanvasTitle && (
                <Offcanvas.Header>
                  <Offcanvas.Title id={`${offcanvasId}Label`}>
                    {props.OffcanvasTitle}
                  </Offcanvas.Title>
                  <button
                    type="button"
                    className="btn-close text-reset"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                  />
                </Offcanvas.Header>
              )}
              <Offcanvas.Body>
                <Area name="offcanvas-body" nodeType="jmix:droppableContent" numberOfItems={0} />
              </Offcanvas.Body>
            </div>
          </>
        );
      }

      // ── Unknown type ───────────────────────────────────────────────────
      default:
        return renderContext.isEditMode() ? (
          <span className="badge badge-warning">
            Unknown buttonType: {props.buttonType}
          </span>
        ) : null;
    }
  },
);
