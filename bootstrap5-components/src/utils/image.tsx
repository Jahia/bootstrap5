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

/** Appends a class after the existing ones. */
function appendClass(cssClass: string, extra: string): string {
  return `${cssClass} ${extra}`.trim();
}

/** The classes of the alignment chosen by the editor. */
function alignmentClass(align: string): string {
  if (align === "start") return "float-start";
  if (align === "end") return "float-end";
  if (align === "center") return "mx-auto d-block";
  return "";
}

/** Merges the style of the image after the style of the caller. */
function mergeStyles(styleStr: string, imageStyle: string): string {
  if (!imageStyle) return styleStr;
  if (!styleStr) return imageStyle;
  return `${styleStr}${styleStr.endsWith(";") ? "" : ";"}${imageStyle}`;
}

/** Ensure img-fluid is present (or absent) based on responsive flag. */
function applyResponsive(cssClass: string, responsive: boolean): string {
  if (!responsive) return cssClass.replace("img-fluid", "").trim();
  return cssClass.includes("img-fluid") ? cssClass : appendClass(cssClass, "img-fluid");
}

interface ImageAttributes {
  cssClass: string;
  styleStr: string;
  elemId: string;
  alt: string;
  responsive: boolean;
}

/** Applies bootstrap5mix:imageAdvancedSettings on top of the attributes of the caller. */
function applyAdvancedSettings(node: JCRNodeWrapper, base: ImageAttributes): ImageAttributes {
  let cssClass = base.cssClass;
  // Append imageClass after caller's class
  const imageClass = node.getPropertyAsString("imageClass");
  if (imageClass) cssClass = appendClass(cssClass, imageClass);

  // Merge styles
  const styleStr = mergeStyles(base.styleStr, node.getPropertyAsString("imageStyle"));

  // Advanced id wins over caller id
  const elemId = node.getPropertyAsString("imageID") || base.elemId;

  // Neither property is autocreated and getProperty() throws when one is not set, which made the
  // whole figure fail to render: read them as strings. As in 2.x, once the advanced settings are
  // on, responsive is the stored flag (unset → not fluid); thumbnails defaults to false.
  const responsive = node.getPropertyAsString("responsive") === "true";

  if (node.getPropertyAsString("thumbnails") === "true") {
    cssClass = appendClass(cssClass, "img-thumbnail");
  }

  const radiusClass = borderRadiusClass(node.getPropertyAsString("borderRadius"), node.getPropertyAsString("borderRadiusSize"));
  if (radiusClass) cssClass = appendClass(cssClass, radiusClass);

  // Alignment
  const alignClass = alignmentClass(node.getPropertyAsString("align"));
  if (alignClass) cssClass = appendClass(cssClass, alignClass);

  // Custom alt text
  const alt = node.getPropertyAsString("alt") || base.alt;

  return { cssClass, styleStr, elemId, alt, responsive };
}

export function ImageTag({ node, imageNode, callerClass = "", callerStyle, callerId }: Readonly<ImageTagProps>) {
  if (!imageNode) return null;

  let attributes: ImageAttributes = {
    cssClass: callerClass,
    styleStr: callerStyle ?? "",
    elemId: callerId ?? "",
    // Default alt: image node display name
    alt: imageNode.getDisplayableName(),
    responsive: true,
  };

  if (node.isNodeType("bootstrap5mix:imageAdvancedSettings")) {
    attributes = applyAdvancedSettings(node, attributes);
  }

  const { styleStr, elemId, alt } = attributes;
  const cssClass = applyResponsive(attributes.cssClass, attributes.responsive);

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
