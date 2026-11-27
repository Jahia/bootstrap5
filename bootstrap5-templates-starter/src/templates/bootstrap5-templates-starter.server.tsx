/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * jnt:template — "bootstrap5-templates-starter" standard page layout.
 * Note: <!DOCTYPE html> is not renderable as a React node; the framework is
 * expected to emit the doctype at the HTTP response level.
 */
import { AbsoluteArea, Area, jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { getSiteColorMode } from "../../../shared/color-mode";
import { getSharedAreasPage, isSharedAreasPage } from "../utils/home";
import { isRtlLanguage } from "../utils/rtl";
import { StarterPage } from "../utils/starter-page";

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
      <StarterPage
        language={language}
        isRtl={isRtl}
        colorMode={colorMode}
        isEditMode={isEditMode}
        title={mainNode.getDisplayableName()}
        skipToContentLabel={t("bootstrap5_templates_starter.skipToContent")}
      >
        {sharedPage && <AbsoluteArea name="header" parent={sharedPage} readOnly={sharedReadOnly} />}
        {/* Main landmark, target of the skip link (2.x rendered the area directly in the body) */}
        <main id="main" tabIndex={-1}>
          <Area name="pagecontent" />
        </main>
        {sharedPage && <AbsoluteArea name="footer" parent={sharedPage} readOnly={sharedReadOnly} />}
      </StarterPage>
    );
  }
);
