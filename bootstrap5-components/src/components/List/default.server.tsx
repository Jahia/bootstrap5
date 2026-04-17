/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * jmix:list — renders all child nodes and an edit-mode drop zone.
 * Pagination, liveOnly AJAX, and emptyListMessage remain pending equivalent JS engine APIs.
 */
import {
  Area,
  Render,
  getChildNodes,
  jahiaComponent,
  useServerContext,
} from "@jahia/javascript-modules-library";

jahiaComponent(
  {
    nodeType: "jmix:list",
    componentType: "view",
    name: "default",
    displayName: "List",
    properties: {
      "cache.requestParameters": "N-*,filter,begin${currentNode.identifier},end${currentNode.identifier},pagesize${currentNode.identifier}",
      "cache.dependsOnVisibilityOf": "$currentNode/[^/]*",
    },
  },
  () => {
    const { currentNode, renderContext } = useServerContext();
    const isEditMode = renderContext.isEditMode();

    // ── Pagination support ────────────────────────────────────────────────
    // Priority: URL param > bound pagination node > list limit property > unbounded
    const nodeId = currentNode.getIdentifier();
    const request = renderContext.getRequest();
    const beginOffset = parseInt(request.getParameter("begin" + nodeId) ?? "0", 10) || 0;
    const listLimit = parseInt(currentNode.getPropertyAsString("limit") ?? "", 10);
    const pageSizeParam = parseInt(request.getParameter("pagesize" + nodeId) ?? "", 10);

    let pageSize = !isNaN(pageSizeParam) ? pageSizeParam : (!isNaN(listLimit) ? listLimit : 0);

    // Fallback: find a sibling pagination node bound to this list and use its pageSize
    if (pageSize === 0) {
      try {
        const siblings = currentNode.getParent().getNodes();
        while (siblings.hasNext()) {
          const sibling = (siblings as any).nextNode();
          if (!sibling.isNodeType("jmix:bindedComponent")) continue;
          try {
            const boundId = sibling.getProperty("j:bindedComponent").getString();
            if (boundId === nodeId) {
              const sibPageSize = parseInt(sibling.getPropertyAsString("pageSize") ?? "", 10);
              if (!isNaN(sibPageSize) && sibPageSize > 0) {
                pageSize = sibPageSize;
                break;
              }
            }
          } catch (_) { /* property missing */ }
        }
      } catch (_) { /* no parent or access error */ }
    }

    if (pageSize === 0) pageSize = 1000; // fully unbounded if no pagination configured

    const allChildren = getChildNodes(currentNode, beginOffset + pageSize);
    const children = allChildren.slice(beginOffset, beginOffset + pageSize);

    return (
      <>
        {children.map((child) => (
          <Render key={child.getIdentifier()} node={child} />
        ))}
        {isEditMode && <div className="clearfix" />}
      </>
    );
  },
);
