/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";

/**
 * The page that holds the header and footer shared by every page: what the 2.x templates addressed
 * with `<template:area moduleType="absoluteArea" level="0">`, that is the ancestor of the page
 * displayed at the depth of the home page (/sites/{site}/{home}).
 *
 * `site.getHome()` is not used first: it returns nothing when the home page cannot be read in the
 * current language (a page displayed in a language the home page is not translated or published
 * in), and an absolute area without parent fails the whole page. Undefined when no such page can be
 * read: the shared areas are then left out, as 2.x did.
 */
export function getSharedAreasPage(renderContext: RenderContext, mainNode: JCRNodeWrapper): JCRNodeWrapper | undefined {
  try {
    // getDepth / getAncestor are javax.jcr.Item methods the library typings do not declare
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = mainNode as any;
    if (mainNode.getPath().startsWith("/sites/") && Number(item.getDepth()) >= 3) {
      const ancestor = item.getAncestor(3) as JCRNodeWrapper | null;
      if (ancestor) return ancestor;
    }
  } catch {
    // the ancestor cannot be read in this language or workspace: try the site's home page
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const home = (renderContext.getSite() as any)?.getHome() as JCRNodeWrapper | null | undefined;
    return home ?? undefined;
  } catch {
    return undefined;
  }
}

/** As in 2.x, the shared areas are edited on the page that holds them, and read-only elsewhere. */
export function isSharedAreasPage(page: JCRNodeWrapper, mainNode: JCRNodeWrapper): boolean {
  return page.getPath() === mainNode.getPath();
}
