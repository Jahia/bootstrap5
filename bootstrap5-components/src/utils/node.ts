/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */
import type { JCRNodeWrapper } from "org.jahia.services.content";

/**
 * Returns the node a reference property points to, or undefined when the property is not set or its
 * target is gone (a weakreference to a deleted image). JCR getProperty() throws on a missing property,
 * which made a whole component fail to render, where 2.x simply rendered nothing for it.
 */
export function getReferencedNode(node: JCRNodeWrapper, propertyName: string): JCRNodeWrapper | undefined {
  if (!node.hasProperty(propertyName)) {
    return undefined;
  }
  try {
    return node.getProperty(propertyName).getNode() as JCRNodeWrapper;
  } catch {
    return undefined;
  }
}
