/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */
import { AbsoluteArea, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";

interface SubNodeAreaProps {
  /** Area name: the content list is the child node of that name. */
  name: string;
  /** Maximum number of items (2.x listLimit); omitted or below 1 means no limit. */
  numberOfItems?: number;
  /** Node types the area accepts. */
  allowedNodeTypes?: string[];
}

/** Render parameter through which an area tells its list view how many items to display. */
export const AREA_LIMIT_PARAMETER = "bootstrap5ListLimit";

/** Properties shared by every area that limits its number of items. */
export function limitProps(numberOfItems: number | undefined) {
  return numberOfItems !== undefined && numberOfItems > 0
    ? { numberOfItems, parameters: { [AREA_LIMIT_PARAMETER]: String(numberOfItems) } }
    : {};
}

const isAtOrBelow = (path: string, ancestorPath: string) =>
  path === ancestorPath || path.startsWith(`${ancestorPath}/`);

/**
 * Where the content list of a sub-node area lives, following the lookup of the 2.x
 * `<template:area areaAsSubNode="true">` (Jahia's AreaTag):
 *
 * 1. a child of the component that already exists: content placed on a page, or default content
 *    the template author put inside a component of a page template;
 * 2. otherwise, when the component is site content (on the page displayed, or shared from another
 *    page through an absolute area): a child of the component, which Jahia creates when the editor
 *    adds the first content;
 * 3. otherwise the component comes from a page template of a template set: a child of the page
 *    displayed, so that every page using the template has its own content.
 */
export function resolveSubNodeAreaParent(
  component: JCRNodeWrapper, mainNode: JCRNodeWrapper, name: string, sitePath?: string,
): JCRNodeWrapper {
  try {
    if (component.hasNode(name)) return component;
  } catch {
    // unreadable child: fall through to the path rules
  }
  const componentPath = component.getPath();
  if (isAtOrBelow(componentPath, mainNode.getPath())) return component;
  if (sitePath && isAtOrBelow(componentPath, sitePath)) return component;
  return mainNode;
}

/**
 * Port of the 2.x `<template:area path="…" areaAsSubNode="true"/>`. 2.x sites hold their grid
 * columns and card footers at these paths.
 *
 * The JavaScript engine (1.3.1) has no areaAsSubNode option, and its Area resolves names against
 * the page only. The parent of the list is therefore resolved here, and the area is rendered as an
 * absolute area anchored on it, which addresses that exact node.
 */
export function SubNodeArea({ name, numberOfItems, allowedNodeTypes }: SubNodeAreaProps) {
  const { currentNode, mainNode, renderContext } = useServerContext();
  const site = renderContext.getSite();
  const parent = resolveSubNodeAreaParent(currentNode, mainNode, name, site ? site.getPath() : undefined);

  // Content that belongs to a template, or to another page, is not editable from the page displayed
  const ownedByPage = isAtOrBelow(parent.getPath(), mainNode.getPath());

  return (
    <AbsoluteArea
      parent={parent}
      name={name}
      readOnly={!ownedByPage}
      {...limitProps(numberOfItems)}
      {...(allowedNodeTypes && allowedNodeTypes.length > 0 ? { allowedNodeTypes } : {})}
    />
  );
}
