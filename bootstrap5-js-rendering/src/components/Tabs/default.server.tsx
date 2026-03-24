/**
 * bootstrap5nt:tabs — SSR view
 *
 * Reproduces tabs.jsp. Children are jnt:contentList nodes; each list becomes
 * one tab panel. The list node name is used as the URL fragment anchor.
 *
 * Rendering parity checklist (from tabs.jsp):
 *   [x] nav type class: nav-tabs / nav-pills / nav-links / nav-underlines
 *   [x] align class (omitted when justify-content-start — same as JSP)
 *   [x] Anchor sanitization — replaces non-alphanumeric chars with "-";
 *       prefixes "tab-" when first char is not a-z (replaces custom b5:replaceAll taglib)
 *   [x] UUID-based anchor fallback when useListNameAsAnchor=false
 *   [x] First tab active by default
 *   [x] fade + show classes
 *   [x] Tab panels rendered via Render per child list node
 *   [x] Deep-linking init script via AddResources (activate tab from URL hash)
 *   [x] Edit-mode add zone via Area
 *   [x] No React island needed — pure data-bs-* + vanilla JS
 */
import {
  AddResources,
  Area,
  getChildNodes,
  jahiaComponent,
  Render,
  useServerContext,
} from "@jahia/javascript-modules-library";

interface TabsProps {
  /** Visual style of the tab bar */
  type?: "tab" | "pill" | "link" | "underline";
  /** Fade animation between panels */
  fade?: boolean;
  /** Horizontal alignment of the tab bar */
  align?: string;
  /** Use node name as anchor; false → use UUID */
  useListNameAsAnchor?: boolean;
}

/**
 * Sanitizes a string for use as an HTML id / URL fragment.
 * Mirrors the b5:replaceAll taglib call in tabs.jsp.
 *   - Replaces any character outside [A-Za-z0-9_] with "-"
 *   - Prefixes "tab-" when the first character is not a letter
 */
function toAnchor(name: string): string {
  const sanitized = name.replace(/[^A-Za-z0-9_]/g, "-");
  return /^[a-zA-Z]/.test(sanitized) ? sanitized : `tab-${sanitized}`;
}

/**
 * Deep-linking script — activate the tab whose anchor matches the URL hash
 * on page load, and update the hash when the active tab changes.
 * Matches the inline <script> in tabs.jsp exactly.
 */
const DEEP_LINK_SCRIPT = `
document.addEventListener("DOMContentLoaded", function() {
  var trigger = document.querySelector('ul.nav button[data-bs-target="' + window.location.hash + '"]');
  if (trigger) { new bootstrap.Tab(trigger).show(); }
});
document.querySelectorAll('ul.nav button[data-bs-toggle="tab"]').forEach(function(el) {
  el.addEventListener('shown.bs.tab', function(e) {
    window.location.hash = e.target.dataset.bsTarget;
  });
});
`.trim();

jahiaComponent(
  {
    nodeType: "bootstrap5nt:tabs",
    componentType: "view",
    name: "default",
    displayName: "Tabs",
  },
  ({ type = "tab", fade = true, align = "justify-content-start", useListNameAsAnchor = true }: TabsProps) => {
    const { currentNode, renderContext } = useServerContext();

    // nav-tabs → "nav-tabs", nav-pills → "nav-pills", nav-link → "nav-links", nav-underline → "nav-underlines"
    // JSP: "nav-${typeValue}${typeValue eq 'underline' ? '':'s'}"
    const navTypeClass = `nav-${type}${type === "underline" ? "" : "s"}`;

    // Omit align class when it's the default (justify-content-start) — same as JSP
    const alignClass = align !== "justify-content-start" ? ` ${align}` : "";

    // Fetch jnt:contentList children — each one is a tab panel
    const subLists = getChildNodes(currentNode, "jnt:contentList");
    const tabsId = `tabs-${currentNode.getIdentifier()}`;

    return (
      <>
        {/* Tab navigation bar */}
        <ul
          className={`nav ${navTypeClass}${alignClass}`}
          id={tabsId}
          role="tablist"
        >
          {subLists.map((listNode, index) => {
            const anchorName = useListNameAsAnchor
              ? toAnchor(listNode.getName())
              : `tab-${listNode.getIdentifier()}`;

            return (
              <li key={listNode.getIdentifier()} className="nav-item" role="presentation">
                <button
                  className={`nav-link${index === 0 ? " active" : ""}`}
                  aria-selected={index === 0 ? "true" : "false"}
                  data-bs-toggle="tab"
                  data-bs-target={`#${anchorName}`}
                  role="tab"
                  aria-controls={anchorName}
                >
                  {listNode.getDisplayableName()}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Tab panels */}
        <div className="tab-content">
          {subLists.map((listNode, index) => {
            const anchorName = useListNameAsAnchor
              ? toAnchor(listNode.getName())
              : `tab-${listNode.getIdentifier()}`;

            const isFirst = index === 0;
            const panelClass = [
              "tab-pane",
              isFirst ? "active" : "",
              fade ? "fade" : "",
              fade && isFirst ? "show" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={listNode.getIdentifier()}
                className={panelClass}
                id={anchorName}
                role="tabpanel"
              >
                <Render content={listNode} />
              </div>
            );
          })}
        </div>

        {/* Edit-mode drop zone for new tab panels */}
        <Area name="tabs" nodeTypes="jnt:contentList" />

        {/* Deep-linking init script — placed in body (head in edit mode, same as JSP) */}
        <AddResources
          type="inline"
          targetTag={renderContext.isEditMode() ? "head" : "body"}
          inlineResource={`<script>${DEEP_LINK_SCRIPT}</script>`}
        />
      </>
    );
  },
);
