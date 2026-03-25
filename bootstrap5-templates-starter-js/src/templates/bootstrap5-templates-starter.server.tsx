/**
 * jnt:template — "bootstrap5-templates-starter" view (standard layout)
 *
 * Reproduces template.bootstrap5-templates-starter.jsp.
 *
 * Page structure:
 *   <html>
 *     <head>  Bootstrap CSS + (edit mode) starter-edit.css </head>
 *     <body>
 *       <Area header   /> — absoluteArea, level 0
 *       <Area pagecontent />
 *       <Area footer   /> — absoluteArea, level 0
 *     </body>
 *   </html>
 *
 * Rendering parity checklist:
 *   [x] lang attribute from renderContext locale
 *   [x] dir="rtl" when language uses a RTL script (mirrors b5:isRtlLanguage)
 *   [x] Page title from currentNode.getDisplayableName()
 *   [x] bootstrap.min.css always present
 *   [x] starter-edit.css injected in edit mode only
 *   [x] bootstrap.bundle.min.js in <head> (edit mode) or <body> (live/preview)
 *   [x] header / pagecontent / footer areas as sub-nodes
 *
 * ⚠️ Note: The `<!DOCTYPE html>` declaration is not renderable as a React node.
 *    Jahia's JS rendering framework is expected to output the doctype via the
 *    HTTP response content-type or a framework-level wrapper, matching the
 *    behaviour of the JSP `<%@ page contentType="text/html;charset=UTF-8" %>`.
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
    const isEditMode: boolean = renderContext.isEditMode?.() ?? false;
    const language: string =
      renderContext.getMainResourceLocale?.()?.getLanguage?.() ?? "en";
    const isRtl = isRtlLanguage(language);

    return (
      <html
        lang={language}
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
