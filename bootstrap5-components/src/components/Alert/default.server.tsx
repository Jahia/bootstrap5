/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5mix:alert — alert skin view registered on jmix:skinnable (view name "skins.alert").
 * Uses plain Bootstrap 5 HTML so that the fade/show classes are only applied when
 * addDismissButton=true (react-bootstrap Alert always adds fade regardless).
 */
import { createElement } from "react";
import { jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { BootstrapJS } from "../../utils/bootstrap-resources.js";

interface AlertProps {
  /** Bootstrap contextual colour — maps to alert-{color} */
  backgroundColor?: string;
  /** Adds a close button; dismiss state is managed by Bootstrap.js */
  addDismissButton?: boolean;
}

jahiaComponent(
  {
    nodeType: "jmix:skinnable",
    name: "skins.alert",
    componentType: "view",
    displayName: "Alert",
    // A skin: listed in the skin choice of jmix:skinnable content, adding the alert settings (2.x)
    properties: { type: "skin", addMixin: "bootstrap5mix:alert" },
  },
  ({ backgroundColor = "primary", addDismissButton = false }: AlertProps) => {
    const { renderContext } = useServerContext();
    const { t } = useTranslation();
    // A skin wraps the content it is applied to: Jahia's WrapperFilter hands the content already
    // rendered in the "wrappedContent" request attribute (the ${wrappedContent} of the 2.x JSP)
    const wrappedContent = renderContext.getRequest().getAttribute("wrappedContent");
    const alertClass = [
      "alert",
      `alert-${backgroundColor}`,
      addDismissButton ? "alert-dismissible" : undefined,
      addDismissButton ? "fade" : undefined,
      addDismissButton ? "show" : undefined,
    ].filter(Boolean).join(" ");

    return (
      <>
        <BootstrapJS />
        <div role="alert" className={alertClass}>
          {wrappedContent !== null && wrappedContent !== undefined &&
            createElement("jsm-raw-html", { dangerouslySetInnerHTML: { __html: String(wrappedContent) } })}
          {addDismissButton && (
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label={t("bootstrap5nt_button.close")}
            />
          )}
        </div>
      </>
    );
  },
);
