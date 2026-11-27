/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:pagination — pager for the list the component is bound to (j:bindedComponent).
 *
 * Port of the 2.x JSP view. The pager and the list agree on three URL parameters, the ones of
 * Jahia's JSP pager: begin{listId}, end{listId} and pagesize{listId}. As in 2.x, place the pager
 * before its list for the first page to be limited without any parameter in the URL.
 */
import { buildNodeUrl, jahiaComponent, server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import {
  beginParam, endParam, getListItems, pageSizeParam, pagerAttribute, toCount, toRequestPageSize,
} from "../../utils/pager.js";

/** GraalVM host access: Java.type("java.util.HashMap") returns the Java class. */
declare const Java: { type(className: string): new () => { put(key: string, value: unknown): unknown } };

interface PaginationProps {
  /** Whether to render the pager UI (from displayPager property) */
  displayPager?: boolean;
  // bootstrap5mix:advancedPagination
  pageSize?: number;
  nbOfPages?: number;
  nbOfPagesInEdit?: number;
  layout?: string;
  align?: string;
}

/** The list the pager is bound to, or undefined when it is bound to nothing or to something else. */
function getBoundList(node: JCRNodeWrapper, renderContext: unknown): JCRNodeWrapper | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bound = server.render.getBoundNode(node, renderContext as any) as JCRNodeWrapper | null;
    return bound?.isNodeType("jmix:list") ? bound : undefined;
  } catch {
    return undefined;
  }
}

/** The current request parameters, without the ones the pager rebuilds itself. */
function otherParameters(request: unknown, excluded: string[]): [string, string][] {
  const result: [string, string][] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req = request as any;
    const names = req.getParameterNames();
    while (names.hasMoreElements()) {
      const name = String(names.nextElement());
      if (excluded.includes(name)) continue;
      const value = req.getParameter(name);
      if (value !== null && value !== undefined) result.push([name, String(value)]);
    }
  } catch {
    // no extra parameter can be read: the links only carry the paging ones
  }
  return result;
}

jahiaComponent(
  {
    nodeType: "bootstrap5nt:pagination",
    componentType: "view",
    name: "default",
    displayName: "Pagination",
    // The current page comes from the request (2.x pagination.properties)
    properties: { "cache.requestParameters": "*" },
  },
  ({
    displayPager = false,
    pageSize: configuredPageSize,
    nbOfPages: configuredNbOfPages,
    nbOfPagesInEdit: configuredNbOfPagesInEdit,
    layout,
    align,
  }: PaginationProps) => {
    const { currentNode, renderContext, mainNode } = useServerContext();
    const { t } = useTranslation();
    const isEditMode = renderContext.isEditMode();

    const placeholder = isEditMode ? (
      <small>
        <strong>{currentNode.getName()}</strong>{" "}
        ({t("bootstrap5nt_pagination.label.empty")})
      </small>
    ) : null;

    const boundList = getBoundList(currentNode, renderContext);
    if (!boundList) return placeholder;

    // The pager changes with the list content
    try {
      server.render.addCacheDependency({ node: boundList }, renderContext);
    } catch {
      // the dependency is an optimisation of cache flushing only
    }

    const advancedPagination = currentNode.isNodeType("bootstrap5mix:advancedPagination");
    const request = renderContext.getRequest();
    const listId = boundList.getIdentifier();

    // Page size: the URL parameter of this list, then the search one, then the configured value
    // (the edit-mode value in edit mode, so editors see the whole list)
    const defaultPageSize = advancedPagination ? Number(configuredPageSize ?? 10) : 10;
    const editPageSize = advancedPagination ? Number(configuredNbOfPagesInEdit ?? 100) : 100;
    // Request values are capped (the configured sizes are not): a larger configured size also
    // raises the cap, so the links the pager itself builds keep working
    const requestCap = Math.max(defaultPageSize, editPageSize);
    const pageSize = toRequestPageSize(request.getParameter(pageSizeParam(listId)), requestCap)
      || toRequestPageSize(request.getParameter("src_itemsPerPage"), requestCap)
      || (isEditMode ? editPageSize : defaultPageSize)
      || 10;
    const begin = toCount(request.getParameter(beginParam(listId))) ?? 0;

    // Tell the list, when it renders after the pager, how many items a page holds: through this
    // module's own request attribute, and through "pagerLimits", the map Jahia's JSP list views
    // read (a list of another module bound to this pager is then limited the same way as in 2.x)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req = request as any;
      req.setAttribute(pagerAttribute(listId), String(pageSize));
      let pagerLimits = req.getAttribute("pagerLimits");
      if (pagerLimits === null || pagerLimits === undefined) {
        pagerLimits = new (Java.type("java.util.HashMap"))();
        req.setAttribute("pagerLimits", pagerLimits);
      }
      pagerLimits.put(listId, begin + pageSize - 1);
    } catch {
      // the list then only follows the URL parameters
    }

    const total = getListItems(boundList).length;
    const nbPages = Math.ceil(total / pageSize);
    const currentPage = Math.min(Math.max(1, Math.floor(begin / pageSize) + 1), Math.max(1, nbPages));

    if (!displayPager || total === 0 || nbPages === 0) return placeholder;

    const nbOfPages = advancedPagination ? Number(configuredNbOfPages ?? 10) : 10;
    const layoutClass = advancedPagination && layout && layout !== "default" ? ` ${layout}` : "";
    const alignClass = advancedPagination && align && align !== "justify-content-start" ? ` ${align}` : "";

    const windowBegin = currentPage < nbOfPages ? 1 : currentPage - (nbOfPages - 1);
    const paginationBegin = nbOfPages > 1
      ? windowBegin
      : currentPage;
    const paginationEnd = nbOfPages > 1
      ? Math.min(nbPages, paginationBegin + (nbOfPages - 1))
      : currentPage;

    // Links keep the other parameters of the request (search terms, filters)
    const extraParameters = otherParameters(request, [beginParam(listId), endParam(listId), pageSizeParam(listId)]);
    const baseUrl = buildNodeUrl(mainNode);
    const buildPageUrl = (page: number): string => {
      const parameters: [string, string][] = [
        [beginParam(listId), String((page - 1) * pageSize)],
        [endParam(listId), String(page * pageSize - 1)],
        [pageSizeParam(listId), String(pageSize)],
        ...extraParameters,
      ];
      const query = parameters
        .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
        .join("&");
      return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${query}`;
    };

    const previousLabel = t("bootstrap5mix_advancedPagination.previous");
    const nextLabel = t("bootstrap5mix_advancedPagination.next");
    const hasPrevious = currentPage > 1;
    const hasNext = currentPage < nbPages;

    return (
      <nav aria-label={t("bootstrap5nt_pagination")}>
        <ul className={`pagination${layoutClass}${alignClass}`}>
          <li className={`page-item${hasPrevious ? "" : " disabled"}`}>
            {hasPrevious ? (
              <a className="page-link" href={buildPageUrl(currentPage - 1)} rel="prev">
                <span aria-hidden="true">&laquo;</span>
                <span className="visually-hidden">{previousLabel}</span>
              </a>
            ) : (
              <span className="page-link">
                <span aria-hidden="true">&laquo;</span>
                <span className="visually-hidden">{previousLabel}</span>
              </span>
            )}
          </li>

          {Array.from({ length: Math.max(0, paginationEnd - paginationBegin + 1) }, (_, i) => {
            const page = paginationBegin + i;
            return page === currentPage ? (
              <li key={page} className="page-item active" aria-current="page">
                <span className="page-link">{page}</span>
              </li>
            ) : (
              <li key={page} className="page-item">
                <a className="page-link" href={buildPageUrl(page)}>{page}</a>
              </li>
            );
          })}

          <li className={`page-item${hasNext ? "" : " disabled"}`}>
            {hasNext ? (
              <a className="page-link" href={buildPageUrl(currentPage + 1)} rel="next">
                <span aria-hidden="true">&raquo;</span>
                <span className="visually-hidden">{nextLabel}</span>
              </a>
            ) : (
              <span className="page-link">
                <span aria-hidden="true">&raquo;</span>
                <span className="visually-hidden">{nextLabel}</span>
              </span>
            )}
          </li>
        </ul>
      </nav>
    );
  },
);
