/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:carousel — carousel wrapper that renders all slides inline via getChildNodes().
 * Uses a compact thumbnail layout in edit mode to avoid animation in the editor.
 * Live mode uses plain Bootstrap 5 HTML + data-bs-* (react-bootstrap Carousel does not render
 * its outer wrapper correctly in GraalVM SSR).
 */
import {
  Area,
  buildNodeUrl,
  getChildNodes,
  jahiaComponent,
  useServerContext,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { BootstrapJS } from "../../utils/bootstrap-resources.js";

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

    // ── Advanced settings ──────────────────────────────────────────────────
    let interval: number | undefined;
    let keyboard = true;
    let pause = false;
    let wrap = true;
    let fade = false;
    let useIndicators = true;
    let useLeftAndRightControls = true;
    let extraClass = "";
    let isDark = false;

    if (currentNode.isNodeType("bootstrap5mix:carouselAdvancedSettings")) {
      const p = currentNode;
      const iv = parseInt(p.getPropertyAsString("interval") ?? "", 10);
      if (!isNaN(iv)) interval = iv;
      keyboard = p.getPropertyAsString("keyboard") !== "false";
      pause = p.getPropertyAsString("pause") === "true";
      wrap = p.getPropertyAsString("wrap") !== "false";
      fade = p.getPropertyAsString("fade") === "true";
      useIndicators = p.getPropertyAsString("useIndicators") !== "false";
      useLeftAndRightControls = p.getPropertyAsString("useLeftAndRightControls") !== "false";
      const rawClass = p.getPropertyAsString("carouselClass") ?? "";
      extraClass = rawClass.trim();
      isDark = p.getPropertyAsString("variant") === "dark";
    }

    // ── Slide items ────────────────────────────────────────────────────────
    const items = getChildNodes(currentNode, 100).filter(n => n.isNodeType("bootstrap5nt:carouselItem"));

    const carouselId = `carousel_${currentNode.getIdentifier()}`;

    // ── Edit mode: compact thumbnail list ─────────────────────────────────
    if (isEditMode) {
      return (
        <>
          <div id={carouselId} className="carouseledit">
            {items.map((item) => {
              const title = item.getPropertyAsString("jcr:title") ?? "";
              const caption = item.getPropertyAsString("caption") ?? "";
              const imageProp = item.getProperty("image");
              const imageNode = imageProp ? imageProp.getNode() as JCRNodeWrapper : undefined;
              const imageUrl = imageNode ? buildNodeUrl(imageNode) : "";

              let titleColor = "";
              let captionColor = "";
              if (item.isNodeType("bootstrap5mix:advancedCarouselItem")) {
                const tc = item.getPropertyAsString("titleColor") ?? "";
                if (tc) titleColor = `text-${tc}`;
                const cc = item.getPropertyAsString("captionColor") ?? "";
                if (cc) captionColor = `text-${cc}`;
              }

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
            })}
          </div>
          <Area name="slides" />
        </>
      );
    }

    // ── Live mode: plain Bootstrap 5 HTML ─────────────────────────────────
    // react-bootstrap's Carousel does not render its outer wrapper in GraalVM SSR
    // (internal hooks are incompatible). Pure HTML + data-bs-* attributes work
    // perfectly and need no JS init script beyond bootstrap.bundle.min.js.
    const carouselClasses = [
      "carousel",
      "slide",
      fade ? "carousel-fade" : undefined,
      isDark ? "carousel-dark" : undefined,
      extraClass || undefined,
    ].filter(Boolean).join(" ");

    return (
      <>
      <BootstrapJS />
      <div
        id={carouselId}
        className={carouselClasses}
        data-bs-ride="carousel"
        data-bs-interval={interval !== undefined && interval !== 5000 ? interval : undefined}
        data-bs-keyboard={keyboard ? "true" : "false"}
        data-bs-pause={pause ? "hover" : "false"}
        data-bs-wrap={wrap ? "true" : "false"}
      >
        {/* Indicators */}
        {useIndicators && (
          <div className="carousel-indicators">
            {items.map((item, i) => (
              <button
                key={item.getIdentifier()}
                type="button"
                data-bs-target={`#${carouselId}`}
                data-bs-slide-to={String(i)}
                className={i === 0 ? "active" : undefined}
                aria-current={i === 0 ? "true" : undefined}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Slides */}
        <div className="carousel-inner">
        {items.map((item, i) => {
          const title = item.getPropertyAsString("jcr:title") ?? "";
          const caption = item.getPropertyAsString("caption") ?? "";
          const imageProp = item.getProperty("image");
          const imageNode = imageProp ? imageProp.getNode() as JCRNodeWrapper : undefined;
          const imageUrl = imageNode ? buildNodeUrl(imageNode) : "";

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
            if (ic.trim()) itemClass = ic.trim();
            const ii = parseInt(item.getPropertyAsString("interval") ?? "", 10);
            if (!isNaN(ii)) itemInterval = ii;
          }

          const itemClasses = ["carousel-item", i === 0 ? "active" : undefined, itemClass || undefined]
            .filter(Boolean).join(" ");

          return (
            <div
              key={item.getIdentifier()}
              className={itemClasses}
              data-bs-interval={itemInterval ?? undefined}
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
        })}
        </div>

        {/* Controls */}
        {useLeftAndRightControls && (
          <>
            <button className="carousel-control-prev" type="button" data-bs-target={`#${carouselId}`} data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true" />
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target={`#${carouselId}`} data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true" />
              <span className="visually-hidden">Next</span>
            </button>
          </>
        )}
      </div>
      </>
    );
  },
);
