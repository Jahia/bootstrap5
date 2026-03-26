/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:accordion — fallback view for a single accordion panel.
 *
 * In normal flow the parent (bootstrap5nt:accordions) renders all panels
 * inline via react-bootstrap's Accordion context.  This view is used when
 * an individual panel is rendered directly (e.g. edit-mode single selection)
 * and therefore has no Accordion context available.
 *
 * It renders a self-contained Bootstrap 5 accordion item that relies on
 * Bootstrap.js data-bs-* attributes for the collapse toggle.
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
    const headerId = `accordion-${id}`;
    const collapseId = `collapse-${id}`;
    const label = title ?? currentNode.getDisplayableName();

    return (
      <div className="accordion-item">
        <h2 className="accordion-header" id={headerId}>
          <button
            className={`accordion-button${show ? "" : " collapsed"}`}
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#${collapseId}`}
            aria-expanded={show ? "true" : "false"}
            aria-controls={collapseId}
          >
            {label}
          </button>
        </h2>
        <div
          id={collapseId}
          className={`accordion-collapse collapse${show ? " show" : ""}`}
          aria-labelledby={headerId}
        >
          <div className="accordion-body">
            {text && <div dangerouslySetInnerHTML={{ __html: text }} />}
            {/* Droppable content area inside the panel body */}
            <Area name="content" nodeType="jmix:droppableContent" numberOfItems={0} />
          </div>
        </div>
      </div>
    );
  },
);
