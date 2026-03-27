/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5mix:alert — alert skin view registered on jmix:skinnable (view name "skins.alert").
 * Uses plain Bootstrap 5 HTML so that the fade/show classes are only applied when
 * addDismissButton=true (react-bootstrap Alert always adds fade regardless).
 */
import { jahiaComponent, RenderChildren } from "@jahia/javascript-modules-library";
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
  },
  ({ backgroundColor = "primary", addDismissButton = false }: AlertProps) => {
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
      </>
    );
  },
);
