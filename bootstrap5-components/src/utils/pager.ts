/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { getChildNodes, server } from "@jahia/javascript-modules-library";
import { AREA_LIMIT_PARAMETER } from "./sub-node-area.js";

/**
 * Paging contract shared by bootstrap5nt:pagination and the jmix:list view, the same one Jahia's
 * JSP pager uses, so that links are interchangeable with 2.x:
 *   begin{listId}    index of the first item displayed
 *   end{listId}      index of the last item displayed
 *   pagesize{listId} number of items per page
 */
export const beginParam = (listId: string) => `begin${listId}`;
export const endParam = (listId: string) => `end${listId}`;
export const pageSizeParam = (listId: string) => `pagesize${listId}`;

/**
 * Request attribute through which a pager rendered before its list tells it the page size, so the
 * first page is limited even when the URL carries no paging parameter yet.
 */
export const pagerAttribute = (listId: string) => `bootstrap5.pager.pagesize.${listId}`;

/** Parses a request parameter as a non-negative integer; undefined when absent or invalid. */
export function toCount(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  // Request parameters and attributes are strings; any other value is converted as String() did
  const text = typeof value === "string" ? value : (value as { toString(): string }).toString();
  const parsed = Number.parseInt(text, 10);
  return Number.isNaN(parsed) || parsed < 0 ? undefined : parsed;
}

/**
 * Largest page size accepted from a request parameter (pagesize{listId}, src_itemsPerPage), so that
 * a visitor cannot make a list render all its items, nor create an unbounded number of cache
 * entries, by editing the URL. The size the editor configured is not subject to this cap.
 */
export const MAX_REQUEST_PAGE_SIZE = 100;

/**
 * Reads a page size from a request value: a value above the cap is reduced to the cap, while 0,
 * negative and unparsable values are ignored (undefined). The cap is MAX_REQUEST_PAGE_SIZE, or the
 * configured page size when the editor set a larger one.
 */
export function toRequestPageSize(value: unknown, configuredPageSize = 0): number | undefined {
  const size = toCount(value);
  if (size === undefined || size <= 0) return undefined;
  return Math.min(size, Math.max(MAX_REQUEST_PAGE_SIZE, configuredPageSize));
}

interface SortCriterion {
  field: string;
  descending: boolean;
}

function sortValue(node: JCRNodeWrapper, field: string, ignoreCase: boolean): string {
  let value = "";
  try {
    value = node.hasProperty(field) ? String(node.getPropertyAsString(field) ?? "") : "";
  } catch {
    value = "";
  }
  return ignoreCase ? value.toLowerCase() : value;
}

/**
 * The items of a list, in display order. A jmix:orderedList is sorted on its firstField /
 * secondField / thirdField properties (values compared as text, which also orders ISO dates);
 * any other list keeps the order of its child nodes.
 */
export function getListItems(listNode: JCRNodeWrapper): JCRNodeWrapper[] {
  // A plain content list only displays its droppable content (as the 3.0.x content list view)
  const items = listNode.isNodeType("jnt:contentList")
    ? getChildNodes(listNode, -1, 0, (child) => child.isNodeType("jmix:droppableContent"))
    : getChildNodes(listNode, -1);
  if (!listNode.isNodeType("jmix:orderedList")) return items;

  const criteria: SortCriterion[] = [];
  for (const prefix of ["first", "second", "third"]) {
    const field = listNode.getPropertyAsString(`${prefix}Field`);
    if (field) {
      criteria.push({ field, descending: listNode.getPropertyAsString(`${prefix}Direction`) === "desc" });
    }
  }
  if (criteria.length === 0) return items;
  const ignoreCase = listNode.getPropertyAsString("ignoreCase") !== "false";

  return [...items].sort((a, b) => {
    for (const { field, descending } of criteria) {
      const left = sortValue(a, field, ignoreCase);
      const right = sortValue(b, field, ignoreCase);
      if (left !== right) return (left < right ? -1 : 1) * (descending ? -1 : 1);
    }
    return 0;
  });
}

/** The parameters the caller passed to the view being rendered (empty when they cannot be read). */
export function readRenderParameters(currentResource: unknown): Record<string, unknown> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (server.render.getRenderParameters(currentResource as any) as Record<string, unknown>) ?? {};
  } catch {
    return {};
  }
}

/**
 * Applies the limit an area asked for (bootstrap5mix:listLimit on a grid): the area passes it as a
 * render parameter, which the list view receives in its module parameters.
 */
export function applyAreaLimit(items: JCRNodeWrapper[], renderParameters: unknown): JCRNodeWrapper[] {
  let raw: unknown;
  try {
    raw = (renderParameters as Record<string, unknown> | null | undefined)?.[AREA_LIMIT_PARAMETER];
  } catch {
    raw = undefined;
  }
  const limit = toCount(raw);
  return limit !== undefined && limit > 0 ? items.slice(0, limit) : items;
}

/** Request shape the paging helpers need. */
interface PagingRequest {
  getParameter(name: string): unknown;
  getAttribute(name: string): unknown;
}

/**
 * The items of the page being displayed: the URL parameters written by the pager, or, on the first
 * page, the page size a pager rendered before the list left in the request. Without a pager every
 * item is returned.
 */
export function getPageItems(listNode: JCRNodeWrapper, request: PagingRequest): JCRNodeWrapper[] {
  const listId = listNode.getIdentifier();
  const items = getListItems(listNode);
  const begin = toCount(request.getParameter(beginParam(listId))) ?? 0;
  // The URL value is capped; the attribute is set by the pager, which already applied its own cap
  const pageSize = toRequestPageSize(request.getParameter(pageSizeParam(listId)))
    ?? toCount(request.getAttribute(pagerAttribute(listId)));
  if (pageSize !== undefined && pageSize > 0) return items.slice(begin, begin + pageSize);
  return begin > 0 ? items.slice(begin) : items;
}
