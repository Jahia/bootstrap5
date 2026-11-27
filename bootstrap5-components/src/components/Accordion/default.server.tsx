/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:accordions — accordion group wrapper.
 * Renders child panels via RenderChildren so each bootstrap5nt:accordion item
 * uses its own view (accordion-item.server.tsx) with Bootstrap.js data-bs-* attributes.
 */
import {
  getChildNodes,
  jahiaComponent,
  Render,
  AddContentButtons,
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
    const { currentNode, renderContext } = useServerContext();
    const id = currentNode.getIdentifier();
    const panels = getChildNodes(currentNode, -1, 0, (n) => n.isNodeType("bootstrap5nt:accordion"));

    return (
      <>
        <BootstrapJS />
        <div
          id={`accordion-${id}`}
          className={["accordion", flush ? "accordion-flush" : undefined].filter(Boolean).join(" ")}
        >
          {panels.map((panel) => (
            <Render key={panel.getIdentifier()} node={panel} />
          ))}
        </div>

        {/* Edit mode: button to add a panel, below the accordion as in 2.x (no extra area: 3.0.x
            rendered a stray "panels" area here, in every mode) */}
        {renderContext.isEditMode() && <AddContentButtons nodeTypes={["bootstrap5nt:accordion"]} />}
      </>
    );
  },
);
