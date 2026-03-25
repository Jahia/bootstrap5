/**
 * bootstrap5nt:accordions — SSR view (group wrapper)
 *
 * Reproduces accordions.jsp. Renders the outer <div class="accordion"> and
 * delegates each panel to the bootstrap5nt:accordion view via RenderChildren.
 *
 * Rendering parity checklist (from accordions.jsp):
 *   [x] <div class="accordion [accordion-flush]" id="accordion-{id}">
 *   [x] flush class from flush property
 *   [x] Children rendered via RenderChildren (≡ c:forEach + template:module in JSP)
 *   [x] Edit-mode add button via Area
 *
 * Bug in original JSP: the inner wrapper uses class "carousel-inner[edit]" —
 * this is a copy-paste error. The JS view omits that spurious wrapper entirely;
 * the accordion-item elements sit directly inside the accordion div.
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
