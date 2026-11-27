/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:card — card component with optional image, header, body, and footer.
 * Image rendering is handled by the shared ImageTag helper.
 * Droppable children exclude the reserved "cardFooter" subnode name.
 */
import {
  AddContentButtons,
  getChildNodes,
  jahiaComponent,
  Render,
  useServerContext,
} from "@jahia/javascript-modules-library";
import { SubNodeArea } from "../../utils/sub-node-area.js";
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

interface ColorClasses {
  bgClass?: string;
  textColorClass?: string;
  borderClass?: string;
}

/** bootstrap5mix:colors — all three properties present when mixin is applied */
function resolveColorClasses(currentNode: JCRNodeWrapper): ColorClasses {
  const classes: ColorClasses = {};
  if (currentNode.isNodeType("bootstrap5mix:colors")) {
    const bg = currentNode.getPropertyAsString("backgroundColor") ?? "";
    if (bg && bg !== "default") classes.bgClass = `bg-${bg}`;
    const tc = currentNode.getPropertyAsString("textColor") ?? "";
    // text-muted is deprecated since 5.3: its replacement follows the colour mode
    if (tc) classes.textColorClass = tc === "muted" ? "text-body-secondary" : `text-${tc}`;
    const bc = currentNode.getPropertyAsString("borderColor") ?? "";
    if (bc && bc !== "default") classes.borderClass = `border-${bc}`;
  }
  return classes;
}

/** bootstrap5mix:cardAdvancedSettings */
function resolveAdvancedSettings(currentNode: JCRNodeWrapper) {
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
  return { cardBsPrefix, cardBodyBsPrefix, cardHeaderBsPrefix, freeFooter };
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
    // Used as a tag name: only the values of the choicelist are accepted, anything else is a div (2.x)
    const HeaderTag = (headerSize && ["h1", "h2", "h3", "h4", "h5"].includes(headerSize) ? headerSize : "div") as
      | "div"
      | "h1"
      | "h2"
      | "h3"
      | "h4"
      | "h5"
      | "h6";

    // textAlign: "text-start" is default — omit to match JSP behaviour
    const alignClass = textAlign && textAlign !== "text-start" ? textAlign : undefined;

    const { bgClass, textColorClass, borderClass } = resolveColorClasses(currentNode);

    const { cardBsPrefix, cardBodyBsPrefix, cardHeaderBsPrefix, freeFooter } = resolveAdvancedSettings(currentNode);

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
          {/* Edit mode: add droppable content as a direct child of the card, where 2.x stores it */}
          {renderContext.isEditMode() && <AddContentButtons nodeTypes={["jmix:droppableContent"]} />}
        </Card.Body>
        {(footer || freeFooter) && (
          <Card.Footer bsPrefix="card-footer" className={textColorClass}>
            {/* footer is a plain string: rendered as text, as 2.x escaped it */}
            {footer}
            {/* 2.x template:area areaAsSubNode="true": the free footer lives under the card node */}
            {freeFooter && <SubNodeArea name="cardFooter" />}
          </Card.Footer>
        )}
      </Card>
    );
  },
);
