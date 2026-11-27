/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:buttonGroup — a row (or a column) of bootstrap5nt:button components.
 *
 * The buttons are rendered side by side; the panels some of them open (modal, collapse,
 * offcanvas) are rendered after the group, because a panel between two buttons breaks the group.
 */
import {
  AddContentButtons,
  getChildNodes,
  jahiaComponent,
  Render,
  useServerContext,
} from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";

interface ButtonGroupProps {
  /** Name of the group, announced by screen readers (mix:title) */
  "jcr:title"?: string;
  size?: string;
  vertical?: boolean;
}

const PANEL_TYPES = ["modal", "collapse", "Offcanvas"];

jahiaComponent(
  {
    nodeType: "bootstrap5nt:buttonGroup",
    componentType: "view",
    name: "default",
    displayName: "Button group",
  },
  ({ "jcr:title": title, size, vertical }: ButtonGroupProps) => {
    const { currentNode, renderContext } = useServerContext();
    const { t } = useTranslation();
    const buttons = getChildNodes(currentNode, -1, 0, (child) => child.isNodeType("bootstrap5nt:button"));
    const withPanel = buttons.filter((button) => PANEL_TYPES.includes(button.getPropertyAsString("buttonType") ?? ""));

    const groupClass = [
      vertical ? "btn-group-vertical" : "btn-group",
      size && size !== "default" ? size : undefined,
    ].filter(Boolean).join(" ");
    const name = (title ?? "").trim();

    return (
      <>
        {/* Bootstrap requires a role and an explicit label on a button group: the name given by
            the editor, or a translated default. No toolbar role: every button stays a Tab stop. */}
        <div className={groupClass} role="group" aria-label={name || t("bootstrap5nt_buttonGroup.label.default")}>
          {buttons.map((button) => (
            <Render key={button.getIdentifier()} node={button} />
          ))}
        </div>
        {withPanel.map((button) => (
          <Render key={`${button.getIdentifier()}-panel`} node={button} view="hidden.panel" readOnly />
        ))}
        {renderContext.isEditMode() && <AddContentButtons nodeTypes={["bootstrap5nt:button"]} />}
      </>
    );
  },
);
