/**
 * Shared image rendering helper.
 *
 * Reproduces the logic of bootstrap5mix_image/html/image.image.jsp which is
 * called via <template:include view="image"> from figure.jsp, card.jsp, etc.
 *
 * Usage:
 *   import { ImageTag } from "../../utils/image.js";
 *   <ImageTag node={currentNode} imageNode={image} callerClass="figure-img img-fluid" />
 *
 * @param node       - The component node that carries bootstrap5mix:image and
 *                     optionally bootstrap5mix:imageAdvancedSettings.
 * @param imageNode  - The resolved JCR image node (weakref target). May be null
 *                     if no image has been selected yet.
 * @param callerClass - Base CSS class provided by the caller (e.g. "figure-img
 *                     img-fluid" or "card-img-top"). Advanced-settings classes
 *                     are appended after this.
 */
import type { JCRNodeWrapper } from "org.jahia.services.content";

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

export function ImageTag({ node, imageNode, callerClass = "", callerStyle, callerId }: ImageTagProps) {
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
      if (!styleStr) {
        styleStr = imageStyle;
      } else {
        styleStr = `${styleStr}${styleStr.endsWith(";") ? "" : ";"}${imageStyle}`;
      }
    }

    // Advanced id wins over caller id
    const imageID = node.getPropertyAsString("imageID");
    if (imageID) elemId = imageID;

    responsive = node.getProperty("responsive")?.getBoolean() ?? true;

    if (node.getProperty("thumbnails")?.getBoolean()) {
      cssClass = `${cssClass} img-thumbnail`.trim();
    }

    // Border radius — skip "rounded-0" (no-op)
    const borderRadius = node.getPropertyAsString("borderRadius");
    if (borderRadius && borderRadius !== "rounded-0") {
      cssClass = `${cssClass} ${borderRadius}`.trim();
    }

    // Border radius size — skip "default"
    const borderRadiusSize = node.getPropertyAsString("borderRadiusSize");
    if (borderRadiusSize && borderRadiusSize !== "default") {
      cssClass = `${cssClass} ${borderRadiusSize}`.trim();
    }

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

  const src = imageNode.getUrl();

  return (
    <img
      src={src}
      alt={alt}
      {...(cssClass ? { className: cssClass } : {})}
      {...(styleStr ? { style: styleStr as unknown as React.CSSProperties } : {})}
      {...(elemId ? { id: elemId } : {})}
    />
  );
}
