/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:carousel — carousel wrapper that renders all slides inline via getChildNodes().
 * Uses a compact thumbnail layout in edit mode to avoid animation in the editor.
 * Interactive behaviour (slide transitions, controls) is managed by react-bootstrap client-side.
 */
import {
  AddContentButtons,
  getChildNodes,
  jahiaComponent,
  useServerContext,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Carousel } from "react-bootstrap";

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

    // ── Edit mode: compact thumbnail list ─────────────────────────────────
    if (isEditMode) {
      return (
        <>
          <div className="carouseledit">
            {items.map((item) => {
              const title = item.getPropertyAsString("jcr:title") ?? "";
              const caption = item.getPropertyAsString("caption") ?? "";
              const imageProp = item.getProperty("image");
              const imageNode = imageProp ? imageProp.getNode() as JCRNodeWrapper : undefined;
              const imageUrl = imageNode ? String(imageNode.getUrl()) : "";

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
          <AddContentButtons />
        </>
      );
    }

    // ── Live mode: react-bootstrap Carousel ────────────────────────────────
    return (
      <Carousel
        interval={interval ?? 5000}
        keyboard={keyboard}
        pause={pause ? "hover" : false}
        wrap={wrap}
        fade={fade}
        indicators={useIndicators}
        controls={useLeftAndRightControls}
        variant={isDark ? "dark" : undefined}
        className={extraClass || undefined}
      >
        {items.map((item) => {
          const title = item.getPropertyAsString("jcr:title") ?? "";
          const caption = item.getPropertyAsString("caption") ?? "";
          const imageProp = item.getProperty("image");
          const imageNode = imageProp ? imageProp.getNode() as JCRNodeWrapper : undefined;
          const imageUrl = imageNode ? String(imageNode.getUrl()) : "";

          let titleColor = "";
          let captionColor = "";
          let itemClass: string | undefined;
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

          return (
            <Carousel.Item
              key={item.getIdentifier()}
              interval={itemInterval}
              className={itemClass}
            >
              {imageUrl && (
                <img src={imageUrl} className="d-block w-100" alt="" />
              )}
              {(title || caption) && (
                <Carousel.Caption>
                  {title && <h3 className={titleColor || undefined}>{title}</h3>}
                  {caption && <p className={captionColor || undefined}>{caption}</p>}
                </Carousel.Caption>
              )}
            </Carousel.Item>
          );
        })}
      </Carousel>
    );
  },
);
