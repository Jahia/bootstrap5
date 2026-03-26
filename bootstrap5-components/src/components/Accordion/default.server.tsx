/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:accordions — accordion group wrapper.
 * Renders all panels inline via getChildNodes() so that react-bootstrap's
 * Accordion context is shared across the whole component tree.
 * The accordion-item.server.tsx view serves as a fallback for standalone rendering.
 */
import {
  AddContentButtons,
  getChildNodes,
  jahiaComponent,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Accordion } from "react-bootstrap";

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
    const panels = getChildNodes(currentNode as JCRNodeWrapper, 100).filter(n =>
      n.isNodeType("bootstrap5nt:accordion"),
    );

    // The first panel marked show=true becomes the default open panel
    const defaultOpenIndex = panels.findIndex(
      n => n.getPropertyAsString("show") === "true",
    );
    const defaultActiveKey = defaultOpenIndex >= 0 ? String(defaultOpenIndex) : undefined;

    return (
      <>
        <Accordion defaultActiveKey={defaultActiveKey} flush={flush}>
          {panels.map((panel, index) => {
            const title =
              panel.getPropertyAsString("jcr:title") ?? panel.getDisplayableName();
            const text = panel.getPropertyAsString("text") ?? "";

            return (
              <Accordion.Item key={panel.getIdentifier()} eventKey={String(index)}>
                <Accordion.Header>{title}</Accordion.Header>
                <Accordion.Body>
                  {text && <div dangerouslySetInnerHTML={{ __html: text }} />}
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>

        {/* Edit-mode drop zone for new panels */}
        <AddContentButtons />
      </>
    );
  },
);
