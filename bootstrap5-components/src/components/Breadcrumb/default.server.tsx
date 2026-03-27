/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:breadcrumb — walks the JCR ancestor tree to render a Bootstrap breadcrumb.
 * Non-displayable node detection approximates jcr:findDisplayableNode by checking jnt:page type.
 * The url.base prefix is approximated as an empty string; validate with Jahia JS engine team.
 */
import { buildNodeUrl, jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Breadcrumb } from "react-bootstrap";

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
    let pageNodes = (currentNode.getAncestors() as unknown as JCRNodeWrapper[])
      .filter((n) => n.isNodeType("jnt:page"));

    // Fallback: if the component is not under a page, walk mainResource ancestors
    if (pageNodes.length === 0) {
      if (mainNode.isNodeType("jnt:page")) {
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
      ? (currentNode.getPropertyAsString("cssClass") ?? "").trim()
      : "";

    // ── Too short: only render placeholder in edit mode ────────────────────
    if (pageNodes.length <= 1) {
      return renderContext.isEditMode() ? (
        <Breadcrumb listProps={{ className: extraClass || undefined }}>
          <Breadcrumb.Item active>Breadcrumb too small...</Breadcrumb.Item>
        </Breadcrumb>
      ) : null;
    }

    // ── Build items ────────────────────────────────────────────────────────
    const mainResourcePath = mainNode.getPath();
    return (
      <Breadcrumb listProps={{ className: extraClass || undefined }}>
        {pageNodes.map((pageNode) => {
          const isCurrentPage = pageNode.getPath() === mainResourcePath;

          if (isCurrentPage) {
            return (
              <Breadcrumb.Item key={pageNode.getIdentifier()} active>
                {pageNode.getDisplayableName()}
              </Breadcrumb.Item>
            );
          }

          const href = pageNode.isNodeType("jnt:page") ? buildNodeUrl(pageNode) : "#";

          return (
            <Breadcrumb.Item key={pageNode.getIdentifier()} href={href}>
              {pageNode.getDisplayableName()}
            </Breadcrumb.Item>
          );
        })}

        {/* When mainResource is not a page, append a final item for the resource itself */}
        {!mainNode.isNodeType("jnt:page") && (
          <Breadcrumb.Item href={buildNodeUrl(mainNode)}>
            {abbreviate(mainNode.getDisplayableName(), 15, 30, "...")}
          </Breadcrumb.Item>
        )}
      </Breadcrumb>
    );
  },
);
