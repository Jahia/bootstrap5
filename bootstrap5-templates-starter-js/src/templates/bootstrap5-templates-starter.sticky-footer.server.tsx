/**
 * jnt:template — "bootstrap5-templates-starter.sticky-footer" view
 *
 * Reproduces template.bootstrap5-templates-starter.sticky-footer.jsp.
 *
 * Page structure:
 *   <html class="h-100">
 *     <head> … </head>
 *     <body class="d-flex flex-column h-100">
 *       <Area header />
 *       <main class="flex-shrink-0">
 *         <Area pagecontent />
 *       </main>
 *       <footer class="mt-auto">
 *         <Area footer />
 *       </footer>
 *     </body>
 *   </html>
 *
 * The sticky footer pattern relies on Bootstrap's flex utility classes:
 *   html / body at h-100 + body as flex column → footer is pushed to the
 *   bottom of the viewport even when page content is short.
 *
 * Rendering parity checklist:
 *   [x] html class="h-100", body class="d-flex flex-column h-100"
 *   [x] lang + optional dir="rtl"
 *   [x] Page title from currentNode.getDisplayableName()
 *   [x] bootstrap.min.css always present
 *   [x] starter-edit.css in edit mode only
 *   [x] bootstrap.bundle.min.js in <head> (edit) or <body> (live)
 *   [x] header / pagecontent / footer areas as sub-nodes
 *   [x] <main class="flex-shrink-0"> wrapper around pagecontent
 *   [x] <footer class="mt-auto"> wrapper around footer area
 */
import { AddResources, Area, jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
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
    const isEditMode: boolean = renderContext.isEditMode?.() ?? false;
    const language: string =
      renderContext.getMainResourceLocale?.()?.getLanguage?.() ?? "en";
    const isRtl = isRtlLanguage(language);

    return (
      <html
        lang={language}
        className="h-100"
        {...(isRtl ? { dir: "rtl" } : {})}
      >
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{currentNode.getDisplayableName?.() ?? ""}</title>
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
          <Area name="header" />
          <main className="flex-shrink-0">
            <Area name="pagecontent" />
          </main>
          <footer className="mt-auto">
            <Area name="footer" />
          </footer>
        </body>
      </html>
    );
  }
);
