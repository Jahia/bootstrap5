/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:pagination — Bootstrap pagination markup layer.
 * Bound component resolution (uiComponents:getBindedComponent / template:initPager)
 * has no JS equivalent yet; the component renders an edit-mode placeholder until
 * the Jahia JS engine exposes a bound component API.
 */
import { jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";

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

jahiaComponent(
  {
    nodeType: "bootstrap5nt:pagination",
    componentType: "view",
    name: "default",
    displayName: "Pagination",
  },
  ({
    displayPager = false,
    pageSize = 10,
    nbOfPages = 10,
    nbOfPagesInEdit = 100,
    layout,
    align,
  }: PaginationProps) => {
    const { currentNode, renderContext } = useServerContext();

    // ── Bound component resolution ─────────────────────────────────────────
    // ⚠️ uiComponents:getBindedComponent() has no JS equivalent yet.
    // Until resolved, render an informative edit-mode placeholder.
    const hasBoundComponent = false; // TODO: resolve via JS API when available

    if (!hasBoundComponent) {
      if (renderContext.isEditMode()) {
        return (
          <small>
            <strong>{currentNode.getName()}</strong>{" "}
            (Pagination: no bound component — pending JS engine bound component API)
          </small>
        );
      }
      return null;
    }

    // ── Below: HTML rendering layer — wired up once bound component is resolved ──

    const advancedPagination = currentNode.isNodeType("bootstrap5mix:advancedPagination");

    // layout/align "default" → omit
    const layoutClass =
      advancedPagination && layout && layout !== "default" ? ` ${layout}` : "";
    const alignClass =
      advancedPagination && align && align !== "justify-content-start" ? ` ${align}` : "";

    // ── Pager state (placeholders — to be populated from bound component) ──
    // These would come from the JS equivalent of moduleMap after template:initPager
    const currentPage = 1; // TODO: from request param begin{id} / pageSize
    const nbPages = 1;     // TODO: from bound component listTotalSize / pageSize

    const paginationBegin =
      nbOfPages > 1
        ? Math.max(1, currentPage < nbOfPages ? 1 : currentPage - (nbOfPages - 1))
        : currentPage;
    const paginationEnd =
      nbOfPages > 1
        ? Math.min(nbPages, paginationBegin + (nbOfPages - 1))
        : currentPage;

    // URL builder placeholder — depends on bound component URL base
    const buildPageUrl = (_page: number): string => "#"; // TODO: construct real URL

    const previousUrl = buildPageUrl(currentPage - 1);
    const nextUrl = buildPageUrl(currentPage + 1);

    if (!displayPager) return null;

    return (
      <ul className={`pagination${layoutClass}${alignClass}`}>
        {/* Previous button */}
        <li className={`page-item${currentPage <= 1 ? " disabled" : ""}`}>
          <a
            className="page-link"
            tabIndex={-1}
            href={currentPage <= 1 ? "#" : previousUrl}
            aria-label="Previous"
          >
            <span aria-hidden="true">&laquo;</span>
            <span className="visually-hidden">Previous</span>
          </a>
        </li>

        {/* Page number items */}
        {Array.from({ length: paginationEnd - paginationBegin + 1 }, (_, i) => {
          const page = paginationBegin + i;
          if (page === currentPage) {
            return (
              <li key={page} className="page-item active">
                <span className="page-link">
                  {page}
                  <span className="visually-hidden">(current)</span>
                </span>
              </li>
            );
          }
          return (
            <li key={page} className="page-item">
              <a className="page-link" href={buildPageUrl(page)}>{page}</a>
            </li>
          );
        })}

        {/* Next button */}
        <li className={`page-item${currentPage >= nbPages ? " disabled" : ""}`}>
          <a
            className="page-link"
            href={currentPage >= nbPages ? "#" : nextUrl}
            aria-label="Next"
          >
            <span aria-hidden="true">&raquo;</span>
            <span className="visually-hidden">Next</span>
          </a>
        </li>
      </ul>
    );
  },
);
