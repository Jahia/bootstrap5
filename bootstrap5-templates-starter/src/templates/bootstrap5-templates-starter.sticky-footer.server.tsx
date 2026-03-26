/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * jnt:template — "bootstrap5-templates-starter.sticky-footer" page layout.
 * Uses Bootstrap flex utilities (h-100, d-flex flex-column) so the footer
 * is always pinned to the bottom of the viewport regardless of content height.
 */
import { AbsoluteArea, AddResources, Area, jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { isRtlLanguage } from "../utils/rtl";

jahiaComponent(
  {
    nodeType: "jnt:template",
    name: "bootstrap5-templates-starter.sticky-footer",
    displayName: "Bootstrap 5 Starter — Sticky Footer",
    componentType: "view",
  },
  function TemplateStickyFooterView() {
    const { renderContext, currentNode } = useServerContext();
    const isEditMode: boolean = renderContext.isEditMode() as unknown as boolean;
    const locale = renderContext.getMainResourceLocale();
    const language: string = locale ? String(locale.getLanguage()) : "en";
    const isRtl = isRtlLanguage(language);
    const siteKey = String(renderContext.getSite().getSiteKey());
    const siteNode = currentNode.getSession().getNode(`/sites/${siteKey}`) as JCRNodeWrapper;

    return (
      <html
        lang={language}
        className="h-100"
        {...(isRtl ? { dir: "rtl" } : {})}
      >
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{currentNode.getDisplayableName()}</title>
          <AddResources type="css" resources="bootstrap.min.css" />
          {isEditMode && (
            <AddResources type="css" resources="starter-edit.css" />
          )}
          {isEditMode && (
            <AddResources
              type="javascript"
              resources="bootstrap.bundle.min.js"
              targetTag="head"
            />
          )}
        </head>
        <body className="d-flex flex-column h-100">
          {!isEditMode && (
            <AddResources
              type="javascript"
              resources="bootstrap.bundle.min.js"
              targetTag="body"
            />
          )}
          <AbsoluteArea name="header" parent={siteNode} numberOfItems={0} />
          <main className="flex-shrink-0">
            <Area name="pagecontent" numberOfItems={0} />
          </main>
          <footer className="mt-auto">
            <AbsoluteArea name="footer" parent={siteNode} numberOfItems={0} />
          </footer>
        </body>
      </html>
    );
  }
);
