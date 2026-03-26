/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5mix:alert — alert skin view registered on jmix:skinnable (view name "skins.alert").
 * Wraps children in a Bootstrap Alert; the dismiss button is managed by React on the client.
 */
import { jahiaComponent, RenderChildren } from "@jahia/javascript-modules-library";
import { Alert } from "react-bootstrap";

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
  ({ backgroundColor = "primary", addDismissButton = false }: AlertProps) => (
    <Alert variant={backgroundColor} dismissible={addDismissButton}>
      <RenderChildren />
    </Alert>
  ),
);
