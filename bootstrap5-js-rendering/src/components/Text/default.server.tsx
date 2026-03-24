/**
 * bootstrap5nt:text — SSR view
 *
 * Renders the rich-text `text` property (CKEditor HTML) as raw HTML.
 *
 * Source JSP: bootstrap5nt_text/html/text.jsp
 * Registers:  bootstrap5nt:text / "default"
 *
 * The JSP is a single line: ${currentNode.properties.text.string}
 * (plus a bootstrap.min.css AddResources call).
 *
 * The `text` property is stored i18n and contains sanitized CKEditor HTML.
 * It is injected via dangerouslySetInnerHTML — identical to how the JSP EL
 * expression outputs it without escaping.
 */
import { jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";

jahiaComponent(
  {
    nodeType: "bootstrap5nt:text",
    componentType: "view",
    name: "default",
    displayName: "Text",
  },
  () => {
    const { currentNode } = useServerContext();
    const html = currentNode.getProperty("text")?.getString() ?? "";

    if (!html) return null;

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  },
);
