/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:figure — figure with image and optional caption.
 * Image rendering is delegated to the shared ImageTag helper.
 */
import { jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { ImageTag } from "../../utils/image.js";

interface FigureProps {
  /** Caption text — jcr:title via mix:title */
  "jcr:title"?: string;
  /** Resolved image node (weakref via bootstrap5mix:imageAdvanced) */
  image?: JCRNodeWrapper;
}

jahiaComponent(
  {
    nodeType: "bootstrap5nt:figure",
    componentType: "view",
    name: "default",
    displayName: "Figure",
  },
  ({ "jcr:title": caption, image }: FigureProps) => {
    const { currentNode } = useServerContext();

    // captionAlignment only available when bootstrap5mix:figureAdvancedSettings is present
    const captionAlignment = currentNode.isNodeType("bootstrap5mix:figureAdvancedSettings")
      ? (currentNode.getPropertyAsString("captionAlignment") ?? "")
      : "";

    return (
      <figure className="figure">
        <ImageTag
          node={currentNode}
          imageNode={image}
          callerClass="figure-img img-fluid"
        />
        {caption && (
          <figcaption
            className={`figure-caption${captionAlignment ? ` ${captionAlignment}` : ""}`}
          >
            {caption}
          </figcaption>
        )}
      </figure>
    );
  },
);
