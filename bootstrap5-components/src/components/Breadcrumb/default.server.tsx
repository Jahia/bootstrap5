/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:breadcrumb — walks the JCR ancestor tree to render a Bootstrap breadcrumb.
 * An ancestor that cannot be displayed itself (a menu label, a link…) is plain text, as in 2.x.
 */
import { buildNodeUrl, jahiaComponent, server, useServerContext } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
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
    // The path depends on the page being rendered (2.x breadcrumb.properties)
    properties: { "cache.mainResource": "true" },
  },
  () => {
    const { currentNode, renderContext, mainNode } = useServerContext();
    const { t } = useTranslation();
    const label = t("bootstrap5nt_breadcrumb");

    /** 2.x jcr:findDisplayableNode(node) ne node: the node has no page of its own to link to. */
    const isDisplayable = (node: JCRNodeWrapper): boolean => {
      try {
        const displayable = server.render.findDisplayableNode(node, renderContext, null);
        return Boolean(displayable) && displayable.getPath() === node.getPath();
      } catch {
        return node.isNodeType("jnt:page");
      }
    };

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
        <Breadcrumb label={label} listProps={{ className: extraClass || undefined }}>
          <Breadcrumb.Item active>Breadcrumb too small...</Breadcrumb.Item>
        </Breadcrumb>
      ) : null;
    }

    // ── Build items ────────────────────────────────────────────────────────
    const mainResourcePath = mainNode.getPath();
    return (
      <Breadcrumb label={label} listProps={{ className: extraClass || undefined }}>
        {pageNodes.map((pageNode) => {
          const isCurrentPage = pageNode.getPath() === mainResourcePath;

          if (isCurrentPage) {
            return (
              <Breadcrumb.Item key={pageNode.getIdentifier()} active>
                {pageNode.getDisplayableName()}
              </Breadcrumb.Item>
            );
          }

          if (!isDisplayable(pageNode)) {
            // Nothing to link to: plain text, not a link to "#"
            return (
              <li key={pageNode.getIdentifier()} className="breadcrumb-item">
                <span>{pageNode.getDisplayableName()}</span>
              </li>
            );
          }

          return (
            <Breadcrumb.Item key={pageNode.getIdentifier()} href={buildNodeUrl(pageNode)}>
              {pageNode.getDisplayableName()}
            </Breadcrumb.Item>
          );
        })}

        {/* When mainResource is not a page, append a final item for the resource itself: it is
            the current location, so it is not a link and carries aria-current (2.x linked it to
            itself) */}
        {!mainNode.isNodeType("jnt:page") && (
          <Breadcrumb.Item active>
            {abbreviate(mainNode.getDisplayableName(), 15, 30, "...")}
          </Breadcrumb.Item>
        )}
      </Breadcrumb>
    );
  },
);
