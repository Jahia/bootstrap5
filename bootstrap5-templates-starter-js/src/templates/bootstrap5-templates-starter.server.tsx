/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * jnt:template — "bootstrap5-templates-starter" standard page layout.
 * Note: <!DOCTYPE html> is not renderable as a React node; the framework is
 * expected to emit the doctype at the HTTP response level.
 */
import { AddResources, Area, jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import { isRtlLanguage } from "../utils/rtl";

jahiaComponent(
  {
    nodeType: "jnt:template",
    name: "bootstrap5-templates-starter",
    displayName: "Bootstrap 5 Starter — Standard",
    componentType: "view",
  },
  function TemplateStarterView() {
    const { renderContext, currentNode } = useServerContext();
    const isEditMode: boolean = renderContext.isEditMode() as unknown as boolean;
    const locale = renderContext.getMainResourceLocale();
    const language: string = locale ? String(locale.getLanguage()) : "en";
    const isRtl = isRtlLanguage(language);

    return (
      <html
        lang={language}
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
        <body>
          {!isEditMode && (
            <AddResources
              type="javascript"
              resources="bootstrap.bundle.min.js"
              targetTag="body"
            />
          )}
          <Area name="header" />
          <Area name="pagecontent" />
          <Area name="footer" />
        </body>
      </html>
    );
  }
);
