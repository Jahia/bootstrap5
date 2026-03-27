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
  Area,
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
  return "nav-links"; // "link" type
}

jahiaComponent(
  {
    nodeType: "bootstrap5nt:tabs",
    componentType: "view",
    name: "default",
    displayName: "Tabs",
  },
  ({ type = "tab", fade = true, align = "justify-content-start", useListNameAsAnchor = true }: TabsProps) => {
    const { currentNode } = useServerContext();

    // Fetch jnt:contentList children — each one is a tab panel
    const subLists = getChildNodes(currentNode, 50).filter(n => n.isNodeType("jnt:contentList"));

    // Omit align class when it's the default (justify-content-start)
    const alignClass = align !== "justify-content-start" ? align : undefined;

    const navClass = ["nav", toNavClass(type), alignClass].filter(Boolean).join(" ");

    return (
      <>
        <BootstrapJS />
        <ul className={navClass} role="tablist">
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
                  data-bs-toggle="tab"
                  data-bs-target={`#${anchorName}`}
                  aria-selected={isFirst ? "true" : "false"}
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
              >
                <Render node={listNode} />
              </div>
            );
          })}
        </div>

        {/* Edit-mode drop zone for new tab panels */}
        <Area name="tabs" />
      </>
    );
  },
);
