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
  },
  () => {
    const { currentNode, renderContext } = useServerContext();
    const isEditMode = renderContext.isEditMode();
    const listLimit = parseInt(currentNode.getPropertyAsString("limit") ?? "", 10);
    const children = getChildNodes(currentNode, isNaN(listLimit) ? 1000 : listLimit);

    return (
      <>
        {children.map((child) => (
          <Render key={child.getIdentifier()} node={child} />
        ))}
        {isEditMode && <div className="clearfix" />}
        {isEditMode && <Area name="content" />}
      </>
    );
  },
);
