/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:breadcrumb — walks the JCR ancestor tree to render a Bootstrap breadcrumb.
 * Non-displayable node detection approximates jcr:findDisplayableNode by checking jnt:page type.
 * The url.base prefix is approximated as an empty string; validate with Jahia JS engine team.
 */
import { jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";

/** Truncates a string like functions:abbreviate(str, 15, 30, '...') */
function abbreviate(str: string, lower: number, upper: number, append: string): string {
  if (str.length <= lower) return str;
  if (str.length <= upper) return str;
  return str.slice(0, lower) + append;
}

jahiaComponent(
  {
    nodeType: "bootstrap5nt:breadcrumb",
    componentType: "view",
    name: "default",
    displayName: "Breadcrumb",
  },
  () => {
    const { currentNode, renderContext, mainNode } = useServerContext();

    // ── Collect ancestor page nodes ────────────────────────────────────────
    // Equivalent to jcr:getParentsOfType(currentNode, 'jnt:page')
    // getAncestors() returns nodes from root to parent in order.
    let pageNodes = (currentNode.getAncestors() as unknown as JCRNodeWrapper[])
      .filter((n) => n.isNodeType("jnt:page"));

    // Fallback: if the component is not under a page, walk mainResource ancestors
    if (pageNodes.length === 0) {
      if (mainNode.isNodeType("jnt:page")) {
        // getMeAndParentsOfType equivalent — include mainNode itself
        pageNodes = [
          ...(mainNode.getAncestors() as unknown as JCRNodeWrapper[]).filter((n) => n.isNodeType("jmix:navMenuItem")),
          mainNode,
        ];
      } else {
        pageNodes = (mainNode.getAncestors() as unknown as JCRNodeWrapper[])
          .filter((n) => n.isNodeType("jmix:navMenuItem"));
      }
    }

    // ── Advanced breadcrumb settings ───────────────────────────────────────
    const extraClass = currentNode.isNodeType("bootstrap5mix:advancedBreadcrumb")
      ? ` ${currentNode.getPropertyAsString("cssClass") ?? ""}`.trimEnd()
      : "";

    // ── Too short: only render placeholder in edit mode ────────────────────
    if (pageNodes.length <= 1) {
      return renderContext.isEditMode() ? (
        <ol className="breadcrumb">
          <li className="breadcrumb-item">Breadcrumb too small...</li>
        </ol>
      ) : null;
    }

    // ── Build items (reversed — root first) ───────────────────────────────
    // JSP uses functions:reverse(pageNodes); getAncestors() already returns root→parent order.
    const mainResourcePath = mainNode.getPath();

    // ⚠️ url.base approximation — validate with Jahia JS engine team
    const urlBase = "";

    return (
      <ol className={`breadcrumb${extraClass}`} aria-label="breadcrumb">
        {pageNodes.map((pageNode) => {
          const isCurrentPage = pageNode.getPath() === mainResourcePath;

          if (isCurrentPage) {
            return (
              <li key={pageNode.getIdentifier()} className="breadcrumb-item active" aria-current="page">
                {pageNode.getDisplayableName()}
              </li>
            );
          }

          // ⚠️ Non-displayable node approximation: in JSP this uses jcr:findDisplayableNode.
          // Here we approximate: only jnt:page nodes are considered "directly displayable".
          const isDisplayable = pageNode.isNodeType("jnt:page");

          if (!isDisplayable) {
            return (
              <li key={pageNode.getIdentifier()} className="breadcrumb-item">
                <a href="#">{pageNode.getDisplayableName()}</a>
              </li>
            );
          }

          return (
            <li key={pageNode.getIdentifier()} className="breadcrumb-item">
              <a href={`${urlBase}${pageNode.getPath()}.html`}>
                {pageNode.getDisplayableName()}
              </a>
            </li>
          );
        })}

        {/* When mainResource is not a page, append a final item for the resource itself */}
        {!mainNode.isNodeType("jnt:page") && (
          <li className="breadcrumb-item">
            <a href={`${urlBase}${mainNode.getPath()}.html`}>
              {abbreviate(mainNode.getDisplayableName(), 15, 30, "...")}
            </a>
          </li>
        )}
      </ol>
    );
  },
);
