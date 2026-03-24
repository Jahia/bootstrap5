/**
 * bootstrap5nt:grid — SSR view
 *
 * Reproduces grid.jsp + grid.hidden.predefinedGrid.jsp + grid.hidden.customGrid.jsp
 * + grid.hidden.nogrid.jsp in a single TSX file (the JSP used template:include for
 * the hidden sub-views; JS modules have no sub-view mechanism).
 *
 * Rendering parity checklist:
 *   [x] Optional section wrapper (bootstrap5mix:createSection): sectionElement, id, class, style, role, aria-label
 *   [x] Optional container wrapper (bootstrap5mix:createContainer): containerId, containerType, containerCssClass
 *       JSP deduplicates containerType from extra CSS class field — reproduced here
 *   [x] Optional row wrapper (bootstrap5mix:createRow): rowId, rowCssClass, vAlign, hAlign, gX, gY
 *       "default" sentinels are normalised to empty string (no CSS class added) — matches JSP
 *   [x] predefinedGrid columns: split grid="4_8" on "_", compute area names from proportions
 *       naming rules from JSP (side/main/extra/extra2) — see predefinedAreaNames()
 *   [x] customGrid columns: gridClasses comma-split → col0, col1, ...
 *   [x] nogrid: single Area named "main" (or node name in /modules / studiomode)
 *   [x] bootstrap5mix:createAbsoluteAreas: moduleType="absoluteArea", level prop forwarded
 *       ⚠️  Area component absoluteArea support needs validation with Jahia JS engine team
 *   [x] bootstrap5mix:listLimit: listLimit prop forwarded to Area
 *   [x] colNamePrefix: prepended in /modules paths or studiomode to avoid area-name collisions
 *   [x] Edit-mode warning in predefinedGrid when column count is out of range (1–4)
 *   [x] Edit-mode warning in customGrid when gridClasses is empty
 *   [x] Edit-mode hint text in nogrid when no container/row wrapper
 */
import { Area, jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";

// ─── Predefined grid helpers ────────────────────────────────────────────────

/**
 * Infers area names from the column span array — mirrors the JSP choose/when logic.
 *   1 col  → ["main"]
 *   2 cols → smaller first → ["side","main"], else ["main","side"]
 *   3 cols → centre strictly largest → ["side","main","extra"], else ["main","side","extra"]
 *   4+ cols → ["main","side","extra","extra2"]
 */
function predefinedAreaNames(parts: number[]): string[] {
  switch (parts.length) {
    case 1:
      return ["main"];
    case 2:
      return parts[0] < parts[1] ? ["side", "main"] : ["main", "side"];
    case 3:
      return parts[1] > parts[0] && parts[1] > parts[2]
        ? ["side", "main", "extra"]
        : ["main", "side", "extra"];
    default:
      return ["main", "side", "extra", "extra2"];
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

interface GridProps {
  // Section (bootstrap5mix:createSection)
  sectionElement?: string;
  sectionId?: string;
  sectionCssClass?: string;
  sectionStyle?: string;
  sectionRole?: string;
  sectionAria?: string;
  // Container (bootstrap5mix:createContainer)
  containerId?: string;
  containerType?: string;
  containerCssClass?: string;
  // Row (bootstrap5mix:createRow)
  rowId?: string;
  rowCssClass?: string;
  rowVerticalAlignment?: string;
  rowHorizontalAlignment?: string;
  horizontalGutters?: string;
  verticalGutters?: string;
  // predefinedGrid (bootstrap5mix:predefinedGrid)
  grid?: string;
  // customGrid (bootstrap5mix:customGrid)
  gridClasses?: string;
  // absoluteAreas (bootstrap5mix:createAbsoluteAreas)
  level?: string;
  // listLimit (bootstrap5mix:listLimit)
  listLimit?: string;
}

jahiaComponent(
  {
    nodeType: "bootstrap5nt:grid",
    componentType: "view",
    name: "default",
    displayName: "Grid",
  },
  ({
    sectionElement,
    sectionId,
    sectionCssClass,
    sectionStyle,
    sectionRole,
    sectionAria,
    containerId,
    containerType,
    containerCssClass,
    rowId,
    rowCssClass,
    rowVerticalAlignment,
    rowHorizontalAlignment,
    horizontalGutters,
    verticalGutters,
    grid,
    gridClasses,
    level,
    listLimit,
  }: GridProps) => {
    const { currentNode, renderContext } = useServerContext();

    // ── Wrapper flags ──────────────────────────────────────────────────────
    const createSection = currentNode.isNodeType("bootstrap5mix:createSection");
    const createContainer = currentNode.isNodeType("bootstrap5mix:createContainer");
    const createRow = currentNode.isNodeType("bootstrap5mix:createRow");

    // ── Grid type ──────────────────────────────────────────────────────────
    const isPredefined = currentNode.isNodeType("bootstrap5mix:predefinedGrid");
    const isCustom = currentNode.isNodeType("bootstrap5mix:customGrid");

    // ── Absolute areas ─────────────────────────────────────────────────────
    const createAbsoluteAreas = currentNode.isNodeType("bootstrap5mix:createAbsoluteAreas");
    // ⚠️ absoluteArea moduleType not confirmed for JS Area component — validate before deploying
    const areaModuleType = createAbsoluteAreas ? "absoluteArea" : "area";
    const areaLevel = createAbsoluteAreas ? (level ?? "0") : "0";

    // ── List limit ─────────────────────────────────────────────────────────
    const hasListLimit = currentNode.isNodeType("bootstrap5mix:listLimit");
    const resolvedListLimit = hasListLimit && listLimit ? listLimit : "-1";

    // ── Column name prefix for /modules paths or studiomode ────────────────
    const isModulesPath = currentNode.getPath().startsWith("/modules");
    const isStudioMode = renderContext.getEditModeConfigName?.() === "studiomode";
    const colNamePrefix = isModulesPath || isStudioMode ? `${currentNode.getName()}-` : "";

    // ── Container class: dedup containerType from extra classes ────────────
    let containerClass = containerType ?? "container";
    if (containerCssClass) {
      const extra = containerCssClass.replace(containerClass, "").trim();
      if (extra) containerClass = `${containerClass} ${extra}`;
    }

    // ── Row full class ─────────────────────────────────────────────────────
    const vAlign = rowVerticalAlignment === "default" ? "" : (rowVerticalAlignment ?? "");
    const hAlign = rowHorizontalAlignment === "default" ? "" : (rowHorizontalAlignment ?? "");
    const gX = horizontalGutters === "default" ? "" : (horizontalGutters ?? "");
    const gY = verticalGutters === "default" ? "" : (verticalGutters ?? "");
    const rowFullClass = ["row", rowCssClass, vAlign, hAlign, gX, gY]
      .filter(Boolean)
      .join(" ");

    // ── Grid columns content ───────────────────────────────────────────────
    const SectionTag = (sectionElement ?? "section") as keyof JSX.IntrinsicElements;

    const GridColumns = (): JSX.Element => {
      if (isPredefined) {
        // predefinedGrid — split "4_8" → [4, 8], compute area names
        const parts = (grid ?? "12").split("_").map(Number);
        if (parts.length < 1 || parts.length > 4) {
          return renderContext.isEditMode() ? (
            <div className="col">
              <div className="alert alert-warning alert-dismissible fade show" role="alert">
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" />
                <strong>Warning</strong> Could not display grid: {grid}
              </div>
            </div>
          ) : <></>;
        }
        const areaNames = predefinedAreaNames(parts);
        return (
          <>
            {parts.map((span, i) => {
              const colClass = span === 12 ? "col" : `col-md-${span}`;
              const areaPath = `${colNamePrefix}${areaNames[i]}`;
              return (
                <div key={areaPath} className={colClass}>
                  {/* ⚠️ moduleType/level not yet confirmed for JS Area — validate absoluteArea support */}
                  <Area
                    name={areaPath}
                    nodeTypes="jmix:droppableContent"
                  />
                </div>
              );
            })}
          </>
        );
      }

      if (isCustom) {
        // customGrid — comma-separated CSS classes, area names col0, col1, …
        const columns = gridClasses ? gridClasses.split(",").map((c) => c.trim()) : [];
        if (columns.length === 0) {
          return renderContext.isEditMode() ? (
            <div className="col-md-12">
              <div className="alert alert-warning alert-dismissible fade show" role="alert">
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" />
                <strong>Warning</strong> Could not display grid: gridClasses is empty
              </div>
            </div>
          ) : <></>;
        }
        return (
          <>
            {columns.map((colClass, i) => {
              const areaPath = `${colNamePrefix}col${i}`;
              return (
                <div key={areaPath} className={colClass}>
                  <Area
                    name={areaPath}
                    nodeTypes="jmix:droppableContent"
                  />
                </div>
              );
            })}
          </>
        );
      }

      // nogrid — single Area; name is "main" normally, or node name in /modules
      const colName = isModulesPath || isStudioMode ? currentNode.getName() : "main";
      return (
        <>
          {renderContext.isEditMode() && !createContainer && !createRow &&
            !isModulesPath && !isStudioMode && (
              <span className="text-muted">#{currentNode.getName()}</span>
            )}
          <Area name={colName} nodeTypes="jmix:droppableContent" />
        </>
      );
    };

    // ── Assemble wrapper layers ────────────────────────────────────────────
    const inner = (
      <>
        {createRow ? (
          <div
            {...(rowId ? { id: rowId } : {})}
            className={rowFullClass}
          >
            <GridColumns />
          </div>
        ) : (
          <GridColumns />
        )}
      </>
    );

    const withContainer = createContainer ? (
      <div
        {...(containerId ? { id: containerId } : {})}
        className={containerClass}
      >
        {inner}
      </div>
    ) : inner;

    if (createSection) {
      const sectionProps: Record<string, string> = {};
      if (sectionId) sectionProps.id = sectionId;
      if (sectionCssClass) sectionProps.className = sectionCssClass.trim();
      if (sectionRole) sectionProps.role = sectionRole;
      if (sectionStyle) sectionProps.style = sectionStyle;
      if (sectionAria) sectionProps["aria-label"] = sectionAria;
      return <SectionTag {...sectionProps}>{withContainer}</SectionTag>;
    }

    return withContainer;
  },
);
