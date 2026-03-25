/**
 * bootstrap5nt:accordion — SSR view (single panel)
 *
 * Reproduces accordion.jsp. Called by the parent accordions view via
 * <RenderChildren nodeType="bootstrap5nt:accordion" />.
 *
 * Rendering parity checklist (from accordion.jsp):
 *   [x] accordion-item wrapper
 *   [x] accordion-header with toggle button (data-bs-toggle, data-bs-target)
 *   [x] data-bs-parent ties this panel to its group — no React island needed
 *   [x] show class when show=true (panel starts expanded)
 *   [x] Rich-text body via dangerouslySetInnerHTML (text property is CKEditor output)
 *   [x] Droppable children via Area
 *   [x] Edit-mode add button via Area
 *
 * Note: The parent node id is obtained via currentNode.getParent().getIdentifier()
 * to reproduce data-bs-parent="#accordion-{parentId}".
 */
import { Area, jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";

interface AccordionItemProps {
  /** Panel header — jcr:title via mix:title, falls back to node displayable name */
  "jcr:title"?: string;
  /** CKEditor rich-text body from bootstrap5mix:text */
  text?: string;
  /** Whether the panel starts expanded */
  show?: boolean;
}

jahiaComponent(
  {
    nodeType: "bootstrap5nt:accordion",
    componentType: "view",
    name: "default",
    displayName: "Accordion panel",
  },
  ({ "jcr:title": title, text, show }: AccordionItemProps) => {
    const { currentNode } = useServerContext();

    const id = currentNode.getIdentifier();
    // Parent accordions node id — used for data-bs-parent to keep only one panel open at a time
    const parentId = currentNode.getParent().getIdentifier();
    const headerId = `accordion-${id}`;
    const collapseId = `collapse-${id}`;
    const parentAccordionId = `accordion-${parentId}`;

    // Title falls back to the node's displayable name (same as JSP ${currentNode.displayableName})
    const label = title ?? currentNode.getDisplayableName();

    return (
      <div className="accordion-item">
        <h2 className="accordion-header" id={headerId}>
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#${collapseId}`}
            aria-expanded="true"
            aria-controls={collapseId}
          >
            {label}
          </button>
        </h2>
        <div
          id={collapseId}
          className={`accordion-collapse collapse${show ? " show" : ""}`}
          aria-labelledby={headerId}
          data-bs-parent={`#${parentAccordionId}`}
        >
          <div className="accordion-body">
            {/* Rich-text body — CKEditor output, same as JSP ${currentNode.properties.text.string} */}
            {text && (
              <div dangerouslySetInnerHTML={{ __html: text }} />
            )}
            {/* Optional droppable area inside the panel body */}
            <Area name="content" nodeType="jmix:droppableContent" />
          </div>
        </div>
      </div>
    );
  },
);
