/**
 * bootstrap5nt:card — SSR view
 *
 * Reproduces card.jsp. The image sub-view delegation (template:include view="image") is
 * replaced by the shared ImageTag helper (same approach as Figure).
 *
 * Rendering parity checklist (from card.jsp):
 *   [x] Outer div: cssClass (default "card") + textAlign + backgroundColor + textColor + borderColor
 *   [x] Image via ImageTag with callerClass="card-img-top" when image property is set
 *   [x] Header element (headerSize: div or h1–h6) with cardHeaderCssClass when jcr:title is set
 *   [x] Card body (cardBodyCssClass, default "card-body") with droppable children
 *   [x] Droppable children: all jmix:droppableContent children except the "cardFooter" subnode
 *   [x] Edit-mode Area drop zone for new droppable content
 *   [x] Footer div (card-footer textColor) when footer text or freeFooter=true
 *   [x] freeFooter Area as subnode "cardFooter" (bootstrap5mix:cardAdvancedSettings)
 *   [x] bootstrap5mix:colors: bg-{color} (omit when "default"), text-{color}, border-{color} (omit when "default")
 *   [x] bootstrap5mix:cardAdvancedSettings: cssClass, cardBodyCssClass, cardHeaderCssClass, freeFooter
 */
import {
  Area,
  getChildNodes,
  jahiaComponent,
  Render,
  useServerContext,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
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
    const tag = !headerSize || headerSize === "default" ? "div" : headerSize;

    // textAlign: "text-start" is default — omit to match JSP behaviour
    const alignClass = textAlign && textAlign !== "text-start" ? ` ${textAlign}` : "";

    // bootstrap5mix:colors — all three properties present when mixin is applied
    let bgClass = "";
    let textColorClass = "";
    let borderClass = "";
    if (currentNode.isNodeType("bootstrap5mix:colors")) {
      const bg = currentNode.getPropertyAsString("backgroundColor") ?? "";
      if (bg && bg !== "default") bgClass = ` bg-${bg}`;
      const tc = currentNode.getPropertyAsString("textColor") ?? "";
      if (tc) textColorClass = ` text-${tc}`;
      const bc = currentNode.getPropertyAsString("borderColor") ?? "";
      if (bc && bc !== "default") borderClass = ` border-${bc}`;
    }

    // bootstrap5mix:cardAdvancedSettings
    let cssClass = "card";
    let cardBodyCssClass = "card-body";
    let cardHeaderCssClass = "card-header";
    let freeFooter = false;
    if (currentNode.isNodeType("bootstrap5mix:cardAdvancedSettings")) {
      cssClass = currentNode.getPropertyAsString("cssClass") || "card";
      cardBodyCssClass = currentNode.getPropertyAsString("cardBodyCssClass") || "card-body";
      cardHeaderCssClass = currentNode.getPropertyAsString("cardHeaderCssClass") || "card-header";
      freeFooter = currentNode.getPropertyAsString("freeFooter") === "true";
    }

    // Droppable children: jmix:droppableContent children, excluding the "cardFooter" subnode
    const bodyChildren = getChildNodes(currentNode, "jmix:droppableContent").filter(
      (child) => child.getName() !== "cardFooter",
    );

    const HeaderTag = tag as keyof JSX.IntrinsicElements;

    return (
      <div className={`${cssClass}${alignClass}${bgClass}${textColorClass}${borderClass}`}>
        {image && (
          <ImageTag
            node={currentNode}
            imageNode={image}
            callerClass="card-img-top"
          />
        )}
        {title && (
          <HeaderTag className={cardHeaderCssClass}>{title}</HeaderTag>
        )}
        <div className={cardBodyCssClass}>
          {bodyChildren.map((child) => (
            <Render key={child.getIdentifier()} content={child} />
          ))}
          {/* Edit-mode drop zone for new droppable content */}
          {renderContext.isEditMode() && (
            <Area name="*" nodeTypes="jmix:droppableContent" />
          )}
        </div>
        {(footer || freeFooter) && (
          <div className={`card-footer${textColorClass}`}>
            {footer && <span dangerouslySetInnerHTML={{ __html: footer }} />}
            {freeFooter && (
              <Area name="cardFooter" nodeTypes="jmix:droppableContent" />
            )}
          </div>
        )}
      </div>
    );
  },
);
