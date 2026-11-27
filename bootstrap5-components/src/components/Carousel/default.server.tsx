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
  AddContentButtons,
  AddResources,
  buildNodeUrl,
  getChildNodes,
  jahiaComponent,
  Render,
  useServerContext,
} from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { BootstrapJS } from "../../utils/bootstrap-resources.js";
import { getReferencedNode } from "../../utils/node.js";
import { textColorClass } from "../../utils/colors.js";

/**
 * Pause/play toggle of the carousel-pause-btn buttons (WCAG 2.2.2, as in 2.x). Each carousel adds it,
 * so it registers its listener once per page: two listeners would undo each other's toggle.
 */
const PAUSE_BUTTON_SCRIPT = `<script>if (!window.__bs5CarouselPause) { window.__bs5CarouselPause = true;
document.addEventListener("click", function (e) {
  var b = e.target.closest && e.target.closest(".carousel-pause-btn");
  if (!b) return;
  var c = bootstrap.Carousel.getOrCreateInstance(document.querySelector(b.getAttribute("data-bs-target")));
  var paused = b.getAttribute("data-paused") === "true";
  if (paused) { c.cycle(); } else { c.pause(); }
  b.setAttribute("data-paused", paused ? "false" : "true");
  b.setAttribute("aria-label", paused ? "Pause slideshow" : "Play slideshow");
}); }</script>`;

jahiaComponent(
  {
    nodeType: "bootstrap5nt:carousel",
    componentType: "view",
    name: "default",
    displayName: "Carousel",
  },
  (_props: Record<string, unknown>) => {
    const { currentNode, renderContext } = useServerContext();
    const { t } = useTranslation();
    const isEditMode = renderContext.isEditMode();

    // ── Advanced settings ──────────────────────────────────────────────────
    let interval: number | undefined;
    let ride = true;
    let keyboard = true;
    let pause = false;
    // Bootstrap pauses on hover by default: only a carousel whose settings say otherwise turns it off
    let pauseConfigured = false;
    let wrap = true;
    let fade = false;
    let useIndicators = true;
    let useLeftAndRightControls = true;
    let extraClass = "";
    let isDark = false;

    if (currentNode.isNodeType("bootstrap5mix:carouselAdvancedSettings")) {
      const p = currentNode;
      const iv = Number.parseInt(p.getPropertyAsString("interval") ?? "", 10);
      if (!Number.isNaN(iv)) interval = iv;
      ride = p.getPropertyAsString("ride") !== "false";
      keyboard = p.getPropertyAsString("keyboard") !== "false";
      pause = p.getPropertyAsString("pause") === "true";
      pauseConfigured = p.hasProperty("pause");
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
            {/* Each slide is rendered as a module, as in 2.x, so that editors can select, edit,
                move and delete it from the page (its view shows the compact thumbnail in edit mode) */}
            <div className="carousel-inneredit">
              {items.map((item) => (
                <Render key={item.getIdentifier()} node={item} />
              ))}
            </div>
          </div>
          {/* New slides are direct children of the carousel, as in 2.x */}
          <AddContentButtons nodeTypes={["bootstrap5nt:carouselItem"]} />
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
    const pauseWhenUnticked = pauseConfigured ? "false" : undefined;

    return (
      <>
      <BootstrapJS />
      <div
        id={carouselId}
        className={carouselClasses}
        // aria-roledescription and aria-label need a role to apply to
        role="region"
        aria-roledescription="carousel"
        aria-label={currentNode.getDisplayableName()}
        // As in 2.x, only the options that differ from Bootstrap's defaults are written
        data-bs-ride={ride ? "carousel" : undefined}
        data-bs-interval={interval !== undefined && interval !== 5000 ? interval : undefined}
        data-bs-keyboard={keyboard ? undefined : "false"}
        // "hover" is Bootstrap's default: unticking the option has to say "false" to have an effect
        data-bs-pause={pause ? "hover" : pauseWhenUnticked}
        // Dark variant: data-bs-theme (carousel-dark is deprecated since 5.3 and kept for site CSS)
        data-bs-theme={isDark ? "dark" : undefined}
        data-bs-wrap={wrap ? undefined : "false"}
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
                aria-label={t("bootstrap5nt_carousel.slide", { 0: String(i + 1) })}
              />
            ))}
          </div>
        )}

        {/* An auto-playing carousel must be pausable (WCAG 2.2.2) */}
        {ride && (
          <>
            <button
              type="button"
              className="carousel-pause-btn visually-hidden-focusable"
              aria-label="Pause slideshow"
              data-bs-target={`#${carouselId}`}
            >
              Pause
            </button>
            <AddResources type="inline" inlineResource={PAUSE_BUTTON_SCRIPT} />
          </>
        )}

        {/* Slides */}
        <div className="carousel-inner">
        {items.map((item, i) => {
          const title = item.getPropertyAsString("jcr:title") ?? "";
          const caption = item.getPropertyAsString("caption") ?? "";
          const imageNode = getReferencedNode(item, "image");
          const imageUrl = imageNode ? buildNodeUrl(imageNode) : "";

          let titleColor = "";
          let captionColor = "";
          let itemClass = "";
          let itemInterval: number | undefined;
          if (item.isNodeType("bootstrap5mix:advancedCarouselItem")) {
            const tc = item.getPropertyAsString("titleColor") ?? "";
            if (tc) titleColor = textColorClass(tc);
            const cc = item.getPropertyAsString("captionColor") ?? "";
            if (cc) captionColor = textColorClass(cc);
            const ic = item.getPropertyAsString("carouselItemClass") ?? "";
            if (ic.trim()) itemClass = ic.trim();
            const ii = Number.parseInt(item.getPropertyAsString("interval") ?? "", 10);
            if (!Number.isNaN(ii)) itemInterval = ii;
          }

          const itemClasses = ["carousel-item", i === 0 ? "active" : undefined, itemClass || undefined]
            .filter(Boolean).join(" ");

          return (
            <div
              key={item.getIdentifier()}
              className={itemClasses}
              // As in 2.x: each slide is announced as a slide, named by its title (WCAG 4.1.2)
              role="group"
              aria-roledescription="slide"
              aria-label={title || `${i + 1} / ${items.length}`}
              data-bs-interval={itemInterval ?? undefined}
            >
              {/* The slide title describes its image, as in 2.x (WCAG 1.1.1) */}
              {imageUrl && <img src={imageUrl} className="d-block w-100" alt={title ?? ""} />}
              {/* Captions show on every screen size, as in 2.x (d-none hid them on phones) */}
              {(title || caption) && (
                <div className="carousel-caption d-md-block">
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
              <span className="visually-hidden">{t("bootstrap5nt_carousel.previous")}</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target={`#${carouselId}`} data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true" />
              <span className="visually-hidden">{t("bootstrap5nt_carousel.next")}</span>
            </button>
          </>
        )}
      </div>
      </>
    );
  },
);
