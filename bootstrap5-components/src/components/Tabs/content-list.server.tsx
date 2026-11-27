/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * jnt:contentList — default view used inside bootstrap5nt:tabs Tab.Pane.
 *
 * When <Render node={listNode} /> is called from the tabs view, Jahia
 * switches currentNode to the contentList. This view then renders all
 * droppable children of that list and exposes AddContentButtons so
 * editors can add content directly to the correct tab panel.
 */
import {
  AddContentButtons,
  jahiaComponent,
  Render,
  useServerContext,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { applyAreaLimit, getPageItems, readRenderParameters } from "../../utils/pager.js";

jahiaComponent(
  {
    nodeType: "jnt:contentList",
    componentType: "view",
    name: "default",
    displayName: "Content list",
    // Generic view: must never win over the "default" view of a more specific type (see List/default).
    priority: -1,
    // Paging parameters, as the jmix:list view
    properties: {
      "cache.requestParameters": "N-*,filter,begin${currentNode.identifier},end${currentNode.identifier},pagesize${currentNode.identifier}",
    },
  },
  () => {
    const { currentNode, currentResource, renderContext } = useServerContext();
    // Every droppable item, or one page of them when a bootstrap5nt:pagination is bound to the list
    let children = getPageItems(currentNode as JCRNodeWrapper, renderContext.getRequest());
    // Limit set by the area that displays this list (grid listLimit)
    children = applyAreaLimit(children, readRenderParameters(currentResource));

    return (
      <>
        {children.map((child) => (
          <Render key={child.getIdentifier()} node={child} />
        ))}
        <AddContentButtons />
      </>
    );
  },
);
