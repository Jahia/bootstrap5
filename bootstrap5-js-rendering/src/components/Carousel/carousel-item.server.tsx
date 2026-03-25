/**
 * bootstrap5nt:carouselItem — SSR fallback view
 *
 * This view is registered for standalone rendering of carousel item nodes
 * (e.g. when a carouselItem is rendered directly, outside the carousel parent).
 *
 * In the normal carousel flow, the parent view (default.server.tsx) renders
 * all slide markup inline via getChildNodes(), including the active class for
 * the first slide. This view is the fallback for direct/standalone rendering.
 *
 * Active detection: checks sibling order to determine if this item is first —
 * mirrors the template:param currentStatus mechanism in carouselItem.jsp.
 *
 * Rendering parity checklist (from carouselItem.jsp):
 *   [x] Edit mode: compact 64 px thumbnail + title/caption
 *   [x] Live mode: <div class="carousel-item [active] [itemClass]" [data-bs-interval]>
 *   [x] Image: <img src="{url}" class="d-block w-100">
 *   [x] Caption block (d-none d-md-block) when title or caption present
 *   [x] bootstrap5mix:advancedCarouselItem: titleColor, captionColor, carouselItemClass, interval
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
    const siblings = getChildNodes(parent).filter(n => n.isNodeType("bootstrap5nt:carouselItem"));
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
