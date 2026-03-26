/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:carousel — carousel wrapper that renders all slides inline via getChildNodes().
 * Uses "carouseledit" CSS class in edit mode to disable animation.
 * Per-slide advanced settings (color, class, interval) are read directly from child nodes.
 */
import {
  AddContentButtons,
  getChildNodes,
  jahiaComponent,
  useServerContext,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";

interface CarouselAdvancedSettings {
  interval?: number;
  keyboard?: boolean;
  pause?: boolean;
  ride?: boolean;
  wrap?: boolean;
  fade?: boolean;
  useIndicators?: boolean;
  useLeftAndRightControls?: boolean;
  carouselClass?: string;
  variant?: string;
}

jahiaComponent(
  {
    nodeType: "bootstrap5nt:carousel",
    componentType: "view",
    name: "default",
    displayName: "Carousel",
  },
  (_props: Record<string, unknown>) => {
    const { currentNode, renderContext } = useServerContext();
    const isEditMode = renderContext.isEditMode();
    const carouselId = `carousel_${currentNode.getIdentifier()}`;

    // ── Advanced settings ──────────────────────────────────────────────────
    let interval: number | undefined;
    let keyboard = true;
    let pause = false;
    let ride = true;
    let wrap = true;
    let fade = false;
    let useIndicators = true;
    let useLeftAndRightControls = true;
    let carouselClass = "";
    let variant = "";

    if (currentNode.isNodeType("bootstrap5mix:carouselAdvancedSettings")) {
      const p = currentNode;
      const iv = parseInt(p.getPropertyAsString("interval") ?? "", 10);
      if (!isNaN(iv)) interval = iv;
      keyboard = p.getPropertyAsString("keyboard") !== "false";
      pause = p.getPropertyAsString("pause") === "true";
      ride = p.getPropertyAsString("ride") !== "false";
      wrap = p.getPropertyAsString("wrap") !== "false";
      fade = p.getPropertyAsString("fade") === "true";
      useIndicators = p.getPropertyAsString("useIndicators") !== "false";
      useLeftAndRightControls = p.getPropertyAsString("useLeftAndRightControls") !== "false";
      const rawClass = p.getPropertyAsString("carouselClass") ?? "";
      carouselClass = rawClass.trim() ? ` ${rawClass.trim()}` : "";
      variant = p.getPropertyAsString("variant") === "dark" ? " carousel-dark" : "";
    }

    // fade → append carousel-fade
    if (fade) carouselClass = `${carouselClass} carousel-fade`;

    // ── data-bs-* attribute props ──────────────────────────────────────────
    const bsProps: Record<string, string> = {};
    if (interval !== undefined && interval !== 5000) bsProps["data-bs-interval"] = String(interval);
    if (!keyboard) bsProps["data-bs-keyboard"] = "false";
    if (pause) bsProps["data-bs-pause"] = "hover";
    if (ride) bsProps["data-bs-ride"] = "carousel";
    if (!wrap) bsProps["data-bs-wrap"] = "false";

    // ── Slide items ────────────────────────────────────────────────────────
    const items = getChildNodes(currentNode, 100).filter(n => n.isNodeType("bootstrap5nt:carouselItem"));

    return (
      <>
        <div
          id={carouselId}
          className={`${isEditMode ? "carouseledit" : "carousel"} slide${carouselClass}${variant}`}
          {...bsProps}
        >
          {/* Indicators — hidden in edit mode */}
          {useIndicators && !isEditMode && (
            <ol className="carousel-indicators">
              {items.map((item, index) => (
                <li
                  key={item.getIdentifier()}
                  data-bs-target={`#${carouselId}`}
                  data-bs-slide-to={String(index)}
                  {...(index === 0 ? { className: "active" } : {})}
                />
              ))}
            </ol>
          )}

          {/* Slides */}
          <div className={`carousel-inner${isEditMode ? "edit" : ""}`}>
            {items.map((item, index) => {
              const title = item.getPropertyAsString("jcr:title") ?? "";
              const caption = item.getPropertyAsString("caption") ?? "";
              // ⚠️ image weakref — validate getProperty("image").getNode() in JS context
              const imageProp = item.getProperty("image");
              const imageNode = imageProp ? imageProp.getNode() as JCRNodeWrapper : undefined;
              const imageUrl = imageNode ? String(imageNode.getUrl()) : "";

              // bootstrap5mix:advancedCarouselItem
              let titleColor = "";
              let captionColor = "";
              let itemClass = "";
              let itemInterval: number | undefined;
              if (item.isNodeType("bootstrap5mix:advancedCarouselItem")) {
                const tc = item.getPropertyAsString("titleColor") ?? "";
                if (tc) titleColor = `text-${tc}`;
                const cc = item.getPropertyAsString("captionColor") ?? "";
                if (cc) captionColor = `text-${cc}`;
                const ic = item.getPropertyAsString("carouselItemClass") ?? "";
                if (ic.trim()) itemClass = ` ${ic.trim()}`;
                const ii = parseInt(item.getPropertyAsString("interval") ?? "", 10);
                if (!isNaN(ii)) itemInterval = ii;
              }

              const isFirst = index === 0;

              if (isEditMode) {
                // Edit mode: compact thumbnail
                return (
                  <div key={item.getIdentifier()} className="d-flex gap-3 align-items-start">
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

              // Live mode: full carousel-item
              const itemBsProps: Record<string, string> = {};
              if (itemInterval !== undefined) itemBsProps["data-bs-interval"] = String(itemInterval);

              return (
                <div
                  key={item.getIdentifier()}
                  className={`carousel-item${isFirst ? " active" : ""}${itemClass}`}
                  {...itemBsProps}
                >
                  {imageUrl && (
                    <img src={imageUrl} className="d-block w-100" alt="" />
                  )}
                  {(title || caption) && (
                    <div className="carousel-caption d-none d-md-block">
                      {title && <h3 className={titleColor || undefined}>{title}</h3>}
                      {caption && <p className={captionColor || undefined}>{caption}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Prev / Next controls — hidden in edit mode */}
          {useLeftAndRightControls && !isEditMode && (
            <>
              <a className="carousel-control-prev" href={`#${carouselId}`} role="button" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true" />
                <span className="visually-hidden">Previous</span>
              </a>
              <a className="carousel-control-next" href={`#${carouselId}`} role="button" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true" />
                <span className="visually-hidden">Next</span>
              </a>
            </>
          )}
        </div>

        {/* Edit-mode drop zone for new slides */}
        {isEditMode && <AddContentButtons />}
</>
    );
  },
);
