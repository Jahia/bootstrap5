/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:text — renders the i18n CKEditor rich-text property as raw HTML
 * via dangerouslySetInnerHTML.
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
    // getProperty() throws when the text is not set yet (an empty text block): read it as a string
    const html = currentNode.getPropertyAsString("text") ?? "";

    if (!html) return null;

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  },
);
