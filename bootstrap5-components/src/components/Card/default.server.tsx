/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:card — card component with optional image, header, body, and footer.
 * Image rendering is handled by the shared ImageTag helper.
 * Droppable children exclude the reserved "cardFooter" subnode name.
 */
import {
  Area,
  getChildNodes,
  jahiaComponent,
  Render,
  useServerContext,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Card } from "react-bootstrap";
import { ImageTag } from "../../utils/image.js";

interface CardProps {
  /** Card title — jcr:title via mix:title */
  "jcr:title"?: string;
  /** Header element tag — "default" maps to "div", or h1–h6 */
  headerSize?: string;
  /** Horizontal text alignment — "text-start" is the default and is omitted */
  textAlign?: string;
  /** Resolved image node (weakref via bootstrap5mix:imageAdvanced) */
  image?: JCRNodeWrapper;
  /** Plain-text footer content */
  footer?: string;
}

jahiaComponent(
  {
    nodeType: "bootstrap5nt:card",
    componentType: "view",
    name: "default",
    displayName: "Card",
  },
  ({ "jcr:title": title, headerSize, textAlign, image, footer }: CardProps) => {
    const { currentNode, renderContext } = useServerContext();

    // headerSize: "default" → render as <div>
    const HeaderTag = (!headerSize || headerSize === "default" ? "div" : headerSize) as
      | "div"
      | "h1"
      | "h2"
      | "h3"
      | "h4"
      | "h5"
      | "h6";

    // textAlign: "text-start" is default — omit to match JSP behaviour
    const alignClass = textAlign && textAlign !== "text-start" ? textAlign : undefined;

    // bootstrap5mix:colors — all three properties present when mixin is applied
    let bgClass: string | undefined;
    let textColorClass: string | undefined;
    let borderClass: string | undefined;
    if (currentNode.isNodeType("bootstrap5mix:colors")) {
      const bg = currentNode.getPropertyAsString("backgroundColor") ?? "";
      if (bg && bg !== "default") bgClass = `bg-${bg}`;
      const tc = currentNode.getPropertyAsString("textColor") ?? "";
      if (tc) textColorClass = `text-${tc}`;
      const bc = currentNode.getPropertyAsString("borderColor") ?? "";
      if (bc && bc !== "default") borderClass = `border-${bc}`;
    }

    // bootstrap5mix:cardAdvancedSettings
    let cardBsPrefix = "card";
    let cardBodyBsPrefix = "card-body";
    let cardHeaderBsPrefix = "card-header";
    let freeFooter = false;
    if (currentNode.isNodeType("bootstrap5mix:cardAdvancedSettings")) {
      cardBsPrefix = currentNode.getPropertyAsString("cssClass") || "card";
      cardBodyBsPrefix = currentNode.getPropertyAsString("cardBodyCssClass") || "card-body";
      cardHeaderBsPrefix = currentNode.getPropertyAsString("cardHeaderCssClass") || "card-header";
      freeFooter = currentNode.getPropertyAsString("freeFooter") === "true";
    }

    // Droppable children: jmix:droppableContent children, excluding the "cardFooter" subnode
    const bodyChildren = getChildNodes(currentNode, 50).filter(
      (child) => child.isNodeType("jmix:droppableContent") && child.getName() !== "cardFooter",
    );

    const extraClasses = [alignClass, bgClass, textColorClass, borderClass]
      .filter(Boolean)
      .join(" ");

    return (
      <Card bsPrefix={cardBsPrefix} className={extraClasses || undefined}>
        {image && (
          <ImageTag node={currentNode} imageNode={image} callerClass="card-img-top" />
        )}
        {title && (
          <Card.Header bsPrefix={cardHeaderBsPrefix} as={HeaderTag}>
            {title}
          </Card.Header>
        )}
        <Card.Body bsPrefix={cardBodyBsPrefix}>
          {bodyChildren.map((child) => (
            <Render key={child.getIdentifier()} node={child} />
          ))}
          {/* Edit-mode drop zone for new droppable content */}
          {renderContext.isEditMode() && <Area name="content" />}
        </Card.Body>
        {(footer || freeFooter) && (
          <Card.Footer bsPrefix="card-footer" className={textColorClass}>
            {footer && <span dangerouslySetInnerHTML={{ __html: footer }} />}
            {freeFooter && <Area name="cardFooter" />}
          </Card.Footer>
        )}
      </Card>
    );
  },
);
