/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:tabs — tab group where each jnt:contentList child becomes one panel.
 * Tab switching uses Bootstrap.js (data-bs-toggle / data-bs-target).
 * Plain HTML buttons are used for nav items to avoid the Jahia edit-frame
 * link interceptor that would intercept <a href="#"> anchors.
 * Anchor sanitization replaces non-alphanumeric chars with "-" and prefixes "tab-"
 * when the first character is not a letter.
 */
import {
  AddContentButtons,
  AddResources,
  getChildNodes,
  jahiaComponent,
  Render,
  useServerContext,
} from "@jahia/javascript-modules-library";
import { BootstrapJS } from "../../utils/bootstrap-resources.js";

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
 *   - Replaces any character outside [A-Za-z0-9_] with "-"
 *   - Prefixes "tab-" when the first character is not a letter
 */
function toAnchor(name: string): string {
  const sanitized = name.replace(/[^A-Za-z0-9_]/g, "-");
  return /^[a-zA-Z]/.test(sanitized) ? sanitized : `tab-${sanitized}`;
}

/** Maps the Jahia "type" prop to a Bootstrap 5 nav CSS class */
function toNavClass(type: string): string {
  if (type === "tab") return "nav-tabs";
  if (type === "pill") return "nav-pills";
  if (type === "underline") return "nav-underline";
  return "nav-links"; // "link" type: no Bootstrap rule (the base .nav is enough), kept as a hook for site CSS as in 2.x
}

/**
 * Tab buttons are matched by comparing their data-bs-target with the fragment, not by building a
 * selector from it: a fragment is visitor input. Bootstrap's Tab API keeps aria-selected and
 * tabindex in sync.
 */
const TABS_HASH_SCRIPT = `<script>
(function () {
  if (window.__bootstrap5TabsHash) { return; }
  window.__bootstrap5TabsHash = true;
  function init() {
    var buttons = document.querySelectorAll('ul.nav button[data-bs-toggle="tab"]');
    var hash = window.location.hash;
    buttons.forEach(function (button) {
      if (hash && hash.length > 1 && button.getAttribute('data-bs-target') === hash && window.bootstrap) {
        window.bootstrap.Tab.getOrCreateInstance(button).show();
      }
      button.addEventListener('shown.bs.tab', function (event) {
        var target = event.target.getAttribute('data-bs-target');
        // replaceState, not location.hash: assigning the hash scrolls to the panel and moves the
        // focus into it, which throws keyboard users out of the tab list at every arrow key
        if (target && window.history && window.history.replaceState) { window.history.replaceState(null, '', target); }
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    window.addEventListener('load', init);
  }
})();
</script>`;

jahiaComponent(
  {
    nodeType: "bootstrap5nt:tabs",
    componentType: "view",
    name: "default",
    displayName: "Tabs",
  },
  ({ type = "tab", fade = true, align = "justify-content-start", useListNameAsAnchor = true }: TabsProps) => {
    const { currentNode, renderContext } = useServerContext();
    const isEditMode = renderContext.isEditMode();

    // Fetch jnt:contentList children — each one is a tab panel
    const subLists = getChildNodes(currentNode, 50).filter(n => n.isNodeType("jnt:contentList"));

    // Omit align class when it's the default (justify-content-start)
    const alignClass = align !== "justify-content-start" ? align : undefined;

    const navClass = ["nav", toNavClass(type), alignClass].filter(Boolean).join(" ");

    return (
      <>
        <BootstrapJS />
        {/* Tab roles, ids and labels as in 2.x (WCAG 4.1.2: tabs are named and tied to their panels) */}
        <ul
          className={navClass}
          id={`tabs-${currentNode.getIdentifier()}`}
          role="tablist"
          aria-label={currentNode.getDisplayableName()}
        >
          {subLists.map((listNode, index) => {
            const anchorName = useListNameAsAnchor
              ? toAnchor(listNode.getName())
              : `tab-${listNode.getIdentifier()}`;
            const isFirst = index === 0;
            return (
              <li key={listNode.getIdentifier()} className="nav-item" role="presentation">
                <button
                  type="button"
                  className={["nav-link", isFirst ? "active" : undefined].filter(Boolean).join(" ")}
                  id={`tab-btn-${anchorName}`}
                  role="tab"
                  aria-controls={anchorName}
                  aria-selected={isFirst ? "true" : "false"}
                  tabIndex={isFirst ? 0 : -1}
                  data-bs-toggle="tab"
                  data-bs-target={`#${anchorName}`}
                >
                  {listNode.getDisplayableName()}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="tab-content">
          {subLists.map((listNode, index) => {
            const anchorName = useListNameAsAnchor
              ? toAnchor(listNode.getName())
              : `tab-${listNode.getIdentifier()}`;
            const isFirst = index === 0;
            const paneClasses = [
              "tab-pane",
              fade ? "fade" : undefined,
              isFirst ? "active" : undefined,
              fade && isFirst ? "show" : undefined,
            ].filter(Boolean).join(" ");
            return (
              <div
                key={listNode.getIdentifier()}
                className={paneClasses}
                id={anchorName}
                role="tabpanel"
                aria-labelledby={`tab-btn-${anchorName}`}
                tabIndex={0}
              >
                <Render node={listNode} />
              </div>
            );
          })}
        </div>

        {/* Edit mode: button to add a tab (a content list), as the 2.x <template:module path="*"> */}
        {isEditMode && <AddContentButtons nodeTypes={["jnt:contentList"]} />}

        {/* Deep links, as 2.x: open the tab named by the URL fragment, and keep the fragment in
            sync when the visitor changes tab. One copy per page whatever the number of tab sets. */}
        <AddResources
          type="inline"
          targetTag={isEditMode ? "head" : "body"}
          inlineResource={TABS_HASH_SCRIPT}
        />
      </>
    );
  },
);
