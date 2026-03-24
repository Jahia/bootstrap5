/**
 * bootstrap5nt:figure — SSR view
 *
 * Reproduces figure.jsp. The JSP delegates <img> rendering to
 * bootstrap5mix_image/html/image.image.jsp via <template:include view="image">.
 * In the JS module this logic is inlined via the shared ImageTag helper.
 *
 * Rendering parity checklist (from figure.jsp + image.image.jsp):
 *   [x] <figure class="figure">
 *   [x] <img> via ImageTag helper — caller class "figure-img img-fluid"
 *   [x] <figcaption> rendered only when jcr:title is non-empty
 *   [x] captionAlignment from bootstrap5mix:figureAdvancedSettings (or empty)
 *   [x] caption text is plain text (fn:escapeXml in JSP → React escapes by default)
 *   [x] No JS required
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
