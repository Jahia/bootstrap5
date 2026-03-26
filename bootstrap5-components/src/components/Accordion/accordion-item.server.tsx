/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:accordion — single accordion panel.
 * Parent node id is obtained via currentNode.getParent().getIdentifier()
 * to build the data-bs-parent="#accordion-{parentId}" binding.
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
