/**
 * bootstrap5nt:pagination — SSR view
 *
 * ⚠️  INTEGRATION UNCERTAINTY — READ BEFORE IMPLEMENTING
 *
 * The JSP implementation is tightly coupled to Java-only server infrastructure:
 *
 *   1. uiComponents:getBindedComponent(currentNode, renderContext, 'j:bindedComponent')
 *      Resolves the bound list component from the JCR j:bindedComponent weakref.
 *      No known JS equivalent — validate with Jahia JS engine team.
 *
 *   2. template:option node="${boundComponent}" view="hidden.header"
 *      Triggers the bound list component to execute its data fetch and populate
 *      moduleMap.listTotalSize, moduleMap.listApproxSize, moduleMap.currentPage, etc.
 *      This is a Java rendering pipeline step — no JS equivalent.
 *
 *   3. template:initPager totalSize pageSize id
 *      Java tag that initialises the pager state variables (currentPage, nbPages, etc.)
 *      in moduleMap. No JS equivalent.
 *
 *   4. HTTP request params: begin{id}, end{id}, pagesize{id}
 *      The pager reads window.location search params to determine the current page.
 *      In JS SSR, request.getParameter() can be accessed via renderContext.getRequest().
 *      This IS potentially accessible — but only meaningful once (1)–(3) are resolved.
 *
 * This file implements the HTML rendering layer (Bootstrap pagination markup) that
 * would be produced once the above integration is resolved. It accepts the pager
 * state as props so that it can be wired up once a JS-side bound component API exists.
 *
 * Rendering parity checklist (from pagination.jsp):
 *   [x] Edit-mode empty placeholder when no bound component
 *   [x] <ul class="pagination [layout] [align]">
 *   [x] Previous « button (disabled when currentPage ≤ 1)
 *   [x] Page number links (window of nbOfPages pages around currentPage)
 *   [x] Active page shown as <span> (not <a>)
 *   [x] Next » button (disabled when currentPage ≥ nbPages)
 *   [x] bootstrap5mix:advancedPagination: pageSize, nbOfPages, nbOfPagesInEdit, layout, align
 *   [x] layout/align "default" → omit CSS class
 *   [?] URL construction for prev/next/page links — depends on bound component resolution
 *
 * TODO: Revisit once Jahia JS engine provides bound component resolution and
 * request parameter access. Track in Sprint 6 issue #23.
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
