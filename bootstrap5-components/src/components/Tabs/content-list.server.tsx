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
  getChildNodes,
  jahiaComponent,
  Render,
  useServerContext,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";

jahiaComponent(
  {
    nodeType: "jnt:contentList",
    componentType: "view",
    name: "default",
    displayName: "Content list",
  },
  () => {
    const { currentNode } = useServerContext();
    const children = getChildNodes(currentNode as JCRNodeWrapper, 50).filter(
      (n) => n.isNodeType("jmix:droppableContent"),
    );

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
