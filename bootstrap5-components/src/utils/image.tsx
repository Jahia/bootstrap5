/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * Shared image rendering helper used by figure, card, and other components.
 * Applies bootstrap5mix:imageAdvancedSettings (class, style, id, responsive,
 * thumbnails, borderRadius, alignment, alt) on top of the caller-supplied base class.
 *
 * Usage:
 *   <ImageTag node={currentNode} imageNode={image} callerClass="figure-img img-fluid" />
 */
import { buildNodeUrl } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { parseInlineStyle } from "./inline-style.js";

interface ImageTagProps {
  /** Component node — carries the image property and optional advanced-settings mixin */
  node: JCRNodeWrapper;
  /** Resolved image node (weakref). Render nothing if null/undefined. */
  imageNode: JCRNodeWrapper | null | undefined;
  /** Base CSS class from the caller (e.g. "figure-img img-fluid") */
  callerClass?: string;
  /** Inline style from the caller */
  callerStyle?: string;
  /** id attribute from the caller */
  callerId?: string;
}

/**
 * The rounded-corner class for a shape and a size chosen by the editor.
 * Two classes ("rounded-top rounded-3") do not combine: the size class rounds the four corners.
 * Bootstrap has one class per case: rounded-3 (all corners), rounded-top-3 (one side).
 * A circle or a pill has no size; "rounded-0" means no rounding.
 */
export function borderRadiusClass(shape: string | null | undefined, size: string | null | undefined): string {
  if (shape === "rounded-0") return "";
  const level = /^rounded-([0-5])$/.exec(size ?? "")?.[1];
  // A size on its own rounds the four corners at that size
  if (!shape) return level ? `rounded-${level}` : "";
  if (!level || shape === "rounded-circle" || shape === "rounded-pill") return shape;
  return `${shape}-${level}`;
}

export function ImageTag({ node, imageNode, callerClass = "", callerStyle, callerId }: Readonly<ImageTagProps>) {
  if (!imageNode) return null;

  let cssClass = callerClass;
  let styleStr = callerStyle ?? "";
  let elemId = callerId ?? "";
  // Default alt: image node display name
  let alt = imageNode.getDisplayableName();
  let responsive = true;

  if (node.isNodeType("bootstrap5mix:imageAdvancedSettings")) {
    // Append imageClass after caller's class
    const imageClass = node.getPropertyAsString("imageClass");
    if (imageClass) cssClass = `${cssClass} ${imageClass}`.trim();

    // Merge styles
    const imageStyle = node.getPropertyAsString("imageStyle");
    if (imageStyle) {
      if (styleStr) {
        styleStr = `${styleStr}${styleStr.endsWith(";") ? "" : ";"}${imageStyle}`;
      } else {
        styleStr = imageStyle;
      }
    }

    // Advanced id wins over caller id
    const imageID = node.getPropertyAsString("imageID");
    if (imageID) elemId = imageID;

    // Neither property is autocreated and getProperty() throws when one is not set, which made the
    // whole figure fail to render: read them as strings. As in 2.x, once the advanced settings are
    // on, responsive is the stored flag (unset → not fluid); thumbnails defaults to false.
    responsive = node.getPropertyAsString("responsive") === "true";

    if (node.getPropertyAsString("thumbnails") === "true") {
      cssClass = `${cssClass} img-thumbnail`.trim();
    }

    const radiusClass = borderRadiusClass(node.getPropertyAsString("borderRadius"), node.getPropertyAsString("borderRadiusSize"));
    if (radiusClass) cssClass = `${cssClass} ${radiusClass}`.trim();

    // Alignment
    const align = node.getPropertyAsString("align");
    if (align === "start") cssClass = `${cssClass} float-start`.trim();
    else if (align === "end") cssClass = `${cssClass} float-end`.trim();
    else if (align === "center") cssClass = `${cssClass} mx-auto d-block`.trim();

    // Custom alt text
    const altStr = node.getPropertyAsString("alt");
    if (altStr) alt = altStr;
  }

  // Ensure img-fluid is present (or absent) based on responsive flag
  if (!responsive) {
    cssClass = cssClass.replace("img-fluid", "").trim();
  } else if (!cssClass.includes("img-fluid")) {
    cssClass = `${cssClass} img-fluid`.trim();
  }

  const src = buildNodeUrl(imageNode);
  // React only takes a style object: a string makes the whole view throw
  const style = parseInlineStyle(styleStr);

  return (
    <img
      src={src}
      alt={alt}
      {...(cssClass ? { className: cssClass } : {})}
      {...(style ? { style } : {})}
      {...(elemId ? { id: elemId } : {})}
    />
  );
}
