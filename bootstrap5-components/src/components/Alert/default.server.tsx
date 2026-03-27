/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5mix:alert — alert skin view registered on jmix:skinnable (view name "skins.alert").
 * Wraps children in a Bootstrap Alert; dismiss is handled by Bootstrap.js (data-bs-dismiss).
 */
import { jahiaComponent, RenderChildren } from "@jahia/javascript-modules-library";
import { Alert } from "react-bootstrap";
import { BootstrapJS } from "../../utils/bootstrap-resources.js";

interface AlertProps {
  /** Bootstrap contextual colour — maps to alert-{color} */
  backgroundColor?: string;
  /** Adds a close button; dismiss state is managed by React after hydration */
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
    return (
      <>
        <BootstrapJS />
        <Alert variant={backgroundColor} dismissible={addDismissButton}>
          <RenderChildren />
        </Alert>
      </>
    );
  },
);
