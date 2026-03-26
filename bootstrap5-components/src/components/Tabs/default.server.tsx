/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:tabs — tab group where each jnt:contentList child becomes one panel.
 * Tab switching is managed by react-bootstrap client-side (no Bootstrap.js needed).
 * Anchor sanitization replaces non-alphanumeric chars with "-" and prefixes "tab-"
 * when the first character is not a letter.
 */
import {
  AddContentButtons,
  getChildNodes,
  jahiaComponent,
  Render,
  useServerContext,
} from "@jahia/javascript-modules-library";
import { Nav, Tab } from "react-bootstrap";

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

/** Maps the Jahia "type" prop to a react-bootstrap Nav variant */
function toNavVariant(type: string): "tabs" | "pills" | "underline" | undefined {
  if (type === "tab") return "tabs";
  if (type === "pill") return "pills";
  if (type === "underline") return "underline";
  return undefined; // "link" → no variant, rendered as plain nav-links
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

    // Default active key = first tab's anchor
    const defaultActiveKey = subLists[0]
      ? useListNameAsAnchor
        ? toAnchor(subLists[0].getName())
        : `tab-${subLists[0].getIdentifier()}`
      : undefined;

    // Omit align class when it's the default (justify-content-start)
    const alignClass = align !== "justify-content-start" ? align : undefined;

    // Nav variant for react-bootstrap
    const navVariant = toNavVariant(type);
    // "link" type uses nav-links class (not a react-bootstrap variant)
    const extraNavClass = type === "link" ? "nav-links" : undefined;

    return (
      <>
        <Tab.Container defaultActiveKey={defaultActiveKey}>
          <Nav
            variant={navVariant}
            as="ul"
            className={[extraNavClass, alignClass].filter(Boolean).join(" ") || undefined}
          >
            {subLists.map((listNode) => {
              const anchorName = useListNameAsAnchor
                ? toAnchor(listNode.getName())
                : `tab-${listNode.getIdentifier()}`;

              return (
                <Nav.Item key={listNode.getIdentifier()} as="li">
                  <Nav.Link eventKey={anchorName}>
                    {listNode.getDisplayableName()}
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>

          <Tab.Content>
            {subLists.map((listNode) => {
              const anchorName = useListNameAsAnchor
                ? toAnchor(listNode.getName())
                : `tab-${listNode.getIdentifier()}`;

              return (
                <Tab.Pane
                  key={listNode.getIdentifier()}
                  eventKey={anchorName}
                  transition={fade ? undefined : false}
                >
                  <Render node={listNode} />
                </Tab.Pane>
              );
            })}
          </Tab.Content>
        </Tab.Container>

        {/* Edit-mode drop zone for new tab panels */}
        <AddContentButtons />
      </>
    );
  },
);
