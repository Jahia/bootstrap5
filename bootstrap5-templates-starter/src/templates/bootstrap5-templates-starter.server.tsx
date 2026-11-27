/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * jnt:template — "bootstrap5-templates-starter" standard page layout.
 * Note: <!DOCTYPE html> is not renderable as a React node; the framework is
 * expected to emit the doctype at the HTTP response level.
 */
import { AbsoluteArea, AddResources, Area, jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { COLOR_MODE_SCRIPT, getSiteColorMode } from "../utils/color-mode";
import { getSharedAreasPage, isSharedAreasPage } from "../utils/home";
import { isRtlLanguage } from "../utils/rtl";

jahiaComponent(
  {
    nodeType: "jnt:template",
    name: "bootstrap5-templates-starter",
    displayName: "Bootstrap 5 Starter — Standard",
    componentType: "view",
  },
  function TemplateStarterView() {
    // In a template, currentNode is the template itself ("base"): the page being rendered is mainNode
    const { renderContext, mainNode } = useServerContext();
    const { t } = useTranslation();
    const isEditMode: boolean = renderContext.isEditMode() as unknown as boolean;
    const locale = renderContext.getMainResourceLocale();
    const language: string = locale ? String(locale.getLanguage()) : "en";
    const isRtl = isRtlLanguage(language);
    const colorMode = getSiteColorMode(renderContext.getSite() as never);
    // Header and footer are held by the home page, shown on every page and edited on the home page
    const sharedPage = getSharedAreasPage(renderContext, mainNode);
    const sharedReadOnly = sharedPage ? !isSharedAreasPage(sharedPage, mainNode) : true;

    return (
      <html
        lang={language}
        // Default colour mode of the site; "auto" and the visitor's own choice are resolved by the script
        data-bs-theme={colorMode === "dark" ? "dark" : "light"}
        data-b5-color-mode-default={colorMode}
        {...(isRtl ? { dir: "rtl" } : {})}
      >
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{mainNode.getDisplayableName()}</title>
          {/* One stylesheet only: the right-to-left build for right-to-left languages */}
          <AddResources type="css" resources={isRtl ? "bootstrap.rtl.min.css" : "bootstrap.min.css"} />
          {/* Colour mode: applied before the page is painted (the visitor's choice, or the site default) */}
          <AddResources type="inline" targetTag="head" inlineResource={COLOR_MODE_SCRIPT} />
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
          {/* First focusable element of the page: lets keyboard users jump over the header */}
          <a className="visually-hidden-focusable" href="#main">{t("bootstrap5_templates_starter.skipToContent")}</a>
          {sharedPage && <AbsoluteArea name="header" parent={sharedPage} readOnly={sharedReadOnly} />}
          {/* Main landmark, target of the skip link (2.x rendered the area directly in the body) */}
          <main id="main" tabIndex={-1}>
            <Area name="pagecontent" />
          </main>
          {sharedPage && <AbsoluteArea name="footer" parent={sharedPage} readOnly={sharedReadOnly} />}
        </body>
      </html>
    );
  }
);
