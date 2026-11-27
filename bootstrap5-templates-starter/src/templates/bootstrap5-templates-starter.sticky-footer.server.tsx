/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * jnt:template — "bootstrap5-templates-starter.sticky-footer" page layout.
 * Uses Bootstrap flex utilities (h-100, d-flex flex-column) so the footer
 * is always pinned to the bottom of the viewport regardless of content height.
 */
import { AbsoluteArea, Area, jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { getSiteColorMode } from "../../../bootstrap5-components/src/utils/color-mode";
import { getSharedAreasPage, isSharedAreasPage } from "../utils/home";
import { isRtlLanguage } from "../utils/rtl";
import { StarterPage } from "../utils/starter-page";

jahiaComponent(
  {
    nodeType: "jnt:template",
    name: "bootstrap5-templates-starter.sticky-footer",
    displayName: "Bootstrap 5 Starter — Sticky Footer",
    componentType: "view",
  },
  function TemplateStickyFooterView() {
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
        htmlClassName="h-100"
        bodyClassName="d-flex flex-column h-100"
      >
        {sharedPage && <AbsoluteArea name="header" parent={sharedPage} readOnly={sharedReadOnly} numberOfItems={0} />}
        <main id="main" tabIndex={-1} className="flex-shrink-0">
          <Area name="pagecontent" numberOfItems={0} />
        </main>
        <footer className="mt-auto">
          {sharedPage && <AbsoluteArea name="footer" parent={sharedPage} readOnly={sharedReadOnly} numberOfItems={0} />}
        </footer>
      </StarterPage>
    );
  }
);
