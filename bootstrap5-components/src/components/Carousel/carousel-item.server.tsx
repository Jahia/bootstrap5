/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:carouselItem — standalone/fallback view for a single carousel slide.
 * In normal flow the parent carousel view renders slides inline; this view handles
 * direct or edit-mode rendering. Active detection uses sibling order via getChildNodes().
 */
import { getChildNodes, jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";

interface CarouselItemProps {
  "jcr:title"?: string;
  caption?: string;
}

jahiaComponent(
  {
    nodeType: "bootstrap5nt:carouselItem",
    componentType: "view",
    name: "default",
    displayName: "Carousel slide",
  },
  ({ "jcr:title": title, caption }: CarouselItemProps) => {
    const { currentNode, renderContext } = useServerContext();
    const isEditMode = renderContext.isEditMode();

    // Determine active: first among siblings
    const parent = currentNode.getParent() as JCRNodeWrapper;
    const siblings = getChildNodes(parent, 100).filter(n => n.isNodeType("bootstrap5nt:carouselItem"));
    const isFirst =
      siblings.length > 0 &&
      siblings[0].getIdentifier() === currentNode.getIdentifier();

    // ⚠️ image weakref
    const carouselImageProp = currentNode.getProperty("image");
    const imageNode = carouselImageProp ? carouselImageProp.getNode() as JCRNodeWrapper : undefined;
    const imageUrl = imageNode ? String(imageNode.getUrl()) : "";

    // bootstrap5mix:advancedCarouselItem
    let titleColor = "";
    let captionColor = "";
    let itemClass = "";
    let itemInterval: number | undefined;
    if (currentNode.isNodeType("bootstrap5mix:advancedCarouselItem")) {
      const tc = currentNode.getPropertyAsString("titleColor") ?? "";
      if (tc) titleColor = `text-${tc}`;
      const cc = currentNode.getPropertyAsString("captionColor") ?? "";
      if (cc) captionColor = `text-${cc}`;
      const ic = currentNode.getPropertyAsString("carouselItemClass") ?? "";
      if (ic.trim()) itemClass = ` ${ic.trim()}`;
      const ii = parseInt(currentNode.getPropertyAsString("interval") ?? "", 10);
      if (!isNaN(ii)) itemInterval = ii;
    }

    if (isEditMode) {
      return (
        <div className="d-flex gap-3 align-items-start">
          {imageUrl && (
            <img src={imageUrl} style={{ width: 64, flexShrink: 0 }} alt="" />
          )}
          <div>
            {title && <h4 className={titleColor || undefined}>{title}</h4>}
            {caption && <p className={captionColor || undefined}>{caption}</p>}
          </div>
        </div>
      );
    }

    const bsProps: Record<string, string> = {};
    if (itemInterval !== undefined) bsProps["data-bs-interval"] = String(itemInterval);

    return (
      <div
        className={`carousel-item${isFirst ? " active" : ""}${itemClass}`}
        {...bsProps}
      >
        {imageUrl && <img src={imageUrl} className="d-block w-100" alt="" />}
        {(title || caption) && (
          <div className="carousel-caption d-none d-md-block">
            {title && <h3 className={titleColor || undefined}>{title}</h3>}
            {caption && <p className={captionColor || undefined}>{caption}</p>}
          </div>
        )}
      </div>
    );
  },
);
