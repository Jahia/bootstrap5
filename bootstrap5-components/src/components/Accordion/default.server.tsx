/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:accordions — accordion group wrapper.
 * Renders child panels via RenderChildren so each bootstrap5nt:accordion item
 * uses its own view (accordion-item.server.tsx) with Bootstrap.js data-bs-* attributes.
 */
import {
  Area,
  jahiaComponent,
  RenderChildren,
  useServerContext,
} from "@jahia/javascript-modules-library";
import { BootstrapJS } from "../../utils/bootstrap-resources.js";

interface AccordionsProps {
  /** Removes outer borders and rounded corners for a flat look */
  flush?: boolean;
}

jahiaComponent(
  {
    nodeType: "bootstrap5nt:accordions",
    componentType: "view",
    name: "default",
    displayName: "Accordion",
  },
  ({ flush }: AccordionsProps) => {
    const { currentNode } = useServerContext();
    const id = currentNode.getIdentifier();

    return (
      <>
        <BootstrapJS />
        <div
          id={`accordion-${id}`}
          className={["accordion", flush ? "accordion-flush" : undefined].filter(Boolean).join(" ")}
        >
          <RenderChildren filter="bootstrap5nt:accordion" />
        </div>

        {/* Edit-mode drop zone for new panels */}
        <Area name="panels" areaAsSubNode={true} />
      </>
    );
  },
);
