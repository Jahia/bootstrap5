/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:accordions — accordion group wrapper.
 * Renders the outer <div class="accordion"> and delegates panels via RenderChildren.
 */
import { Area, jahiaComponent, RenderChildren } from "@jahia/javascript-modules-library";

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
  ({ flush }: AccordionsProps, { currentNode }) => {
    const id = currentNode.getIdentifier();

    return (
      <>
        <div
          className={`accordion${flush ? " accordion-flush" : ""}`}
          id={`accordion-${id}`}
        >
          <RenderChildren filter="bootstrap5nt:accordion" />
        </div>
        {/* Edit-mode drop zone for new accordion panels */}
        <Area name="panels" nodeType="bootstrap5nt:accordion" />
      </>
    );
  },
);
