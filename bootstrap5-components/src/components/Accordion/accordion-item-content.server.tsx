/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:accordion — "content" view.
 *
 * Rendered via <Render node={panel} view="content" /> from the parent
 * accordions view. Because Render switches the rendering context to the
 * panel node, the Area here correctly targets the panel's content child
 * (/panel-path/content) instead of the accordions parent.
 */
import { Area, jahiaComponent } from "@jahia/javascript-modules-library";

jahiaComponent(
  {
    nodeType: "bootstrap5nt:accordion",
    componentType: "view",
    name: "content",
    displayName: "Accordion panel content",
  },
  () => <Area name="content" />,
);
