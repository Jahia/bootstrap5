/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:grid — layout grid with optional section, container, and row wrappers.
 * Supports three column modes: predefinedGrid ("4_8" notation), customGrid (comma-separated
 * CSS classes), and nogrid (single area). Columns are areas stored under the grid node, or, with
 * bootstrap5mix:createAbsoluteAreas, areas stored under the ancestor page of the chosen level.
 */
import type { CSSProperties } from "react";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { AbsoluteArea, jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { parseInlineStyle } from "../../utils/inline-style.js";
import { limitProps, SubNodeArea } from "../../utils/sub-node-area.js";

// ─── Predefined grid helpers ────────────────────────────────────────────────

/**
 * Infers area names from the column span array — mirrors the JSP choose/when logic.
 *   1 col  → ["main"]
 *   2 cols → smaller first → ["side","main"], else ["main","side"]
 *   3 cols → centre strictly largest → ["side","main","extra"], else ["main","side","extra"]
 *   4+ cols → ["main","side","extra","extra2"]
 */
export function predefinedAreaNames(parts: string[]): string[] {
  // The spans are compared as strings, as the 2.x JSP did (fn:split returns strings, so "lt" was a
  // lexicographic comparison): "2" < "10" is false, hence 2_10 → main,side and 10_2 → side,main.
  // The area names are where existing sites hold their column content, so this must not change.
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

/** Tag names offered by the sectionElement choicelist; anything else renders a div (as in 2.x). */
const SECTION_ELEMENTS = new Set([
  "section", "article", "aside", "hgroup", "header", "footer", "nav", "div", "figure", "figcaption", "main",
]);

/**
 * The page an absolute area of the given level is stored under: level 0 is the home page
 * (/sites/{site}/home, depth 3), level 1 its child on the path to the page displayed, and so on.
 * Undefined when the page displayed is above that level: 2.x rendered nothing there.
 */
function absoluteAreaAnchor(mainNode: JCRNodeWrapper, level: number): JCRNodeWrapper | undefined {
  try {
    const depth = level + 3;
    // getDepth / getAncestor are javax.jcr.Item methods the library typings do not declare
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = mainNode as any;
    if (Number(item.getDepth()) < depth) return undefined;
    return (item.getAncestor(depth) as JCRNodeWrapper) ?? undefined;
  } catch {
    return undefined;
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

type ServerContext = ReturnType<typeof useServerContext>;

/** Everything the grid rendering helpers need, computed once at the top of the view. */
interface GridContext {
  currentNode: ServerContext["currentNode"];
  renderContext: ServerContext["renderContext"];
  mainNode: ServerContext["mainNode"];
  t: (key: string, options?: Record<string, string>) => string;
  props: GridProps;
  createContainer: boolean;
  createRow: boolean;
  createAbsoluteAreas: boolean;
  isPredefined: boolean;
  isCustom: boolean;
  isModulesPath: boolean;
  isStudioMode: boolean;
  colNamePrefix: string;
  numberOfItems: number | undefined;
  absoluteLevel: number;
  anchor: JCRNodeWrapper | undefined;
  showAbsoluteAreaHelp: boolean;
}

/** List limit (bootstrap5mix:listLimit). */
function resolveNumberOfItems(currentNode: JCRNodeWrapper, listLimit: string | undefined): number | undefined {
  const hasListLimit = currentNode.isNodeType("bootstrap5mix:listLimit");
  const parsedListLimit = hasListLimit && listLimit ? Number.parseInt(listLimit, 10) : -1;
  return !Number.isNaN(parsedListLimit) && parsedListLimit > 0 ? parsedListLimit : undefined;
}

/** Container class: dedup containerType from extra classes. */
function resolveContainerClass(containerType: string | undefined, containerCssClass: string | undefined): string {
  let containerClass = containerType ?? "container";
  if (containerCssClass) {
    const extra = containerCssClass.replace(containerClass, "").trim();
    if (extra) containerClass = `${containerClass} ${extra}`;
  }
  return containerClass;
}

/** An alignment or gutter value: "default" stands for none. */
function nonDefault(value: string | undefined): string {
  return value === "default" ? "" : (value ?? "");
}

/** Row full class. */
function resolveRowClass(props: GridProps): string {
  return [
    "row",
    props.rowCssClass,
    nonDefault(props.rowVerticalAlignment),
    nonDefault(props.rowHorizontalAlignment),
    nonDefault(props.horizontalGutters),
    nonDefault(props.verticalGutters),
  ]
    .filter(Boolean)
    .join(" ");
}

/** The area of a column: a sub node of the grid, or an absolute area under an ancestor page. */
function renderCol(ctx: GridContext, areaPath: string) {
  const { t, mainNode, numberOfItems, absoluteLevel, anchor, showAbsoluteAreaHelp } = ctx;
  if (!ctx.createAbsoluteAreas) {
    return <SubNodeArea name={areaPath} numberOfItems={numberOfItems} />;
  }
  return (
    <>
      {showAbsoluteAreaHelp && (
        <div className="card text-white bg-danger mb-3">
          <div className="card-header">{t("bootstrap5nt_grid.absolute.area.title")}</div>
          <div className="card-body">
            <p className="card-text">
              {t("bootstrap5nt_grid.absolute.area.desc", { 0: String(absoluteLevel) })}
            </p>
          </div>
        </div>
      )}
      {anchor && (
        <AbsoluteArea
          parent={anchor}
          name={areaPath}
          readOnly={mainNode.getPath() !== anchor.getPath()}
          {...limitProps(numberOfItems)}
        />
      )}
    </>
  );
}

/** The warning shown in edit mode when the grid cannot be displayed (nothing in live). */
function renderGridWarning(ctx: GridContext, wrapperClass: string, grid: string) {
  const { t, renderContext } = ctx;
  return renderContext.isEditMode() ? (
    <div className={wrapperClass}>
      <div className="alert alert-warning alert-dismissible fade show" role="alert">
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label={t("bootstrap5nt_button.close")} />
        <strong>{t("bootstrap5nt_grid.warning")}</strong>{" "}
        {t("bootstrap5nt_grid.couldNotDisplayGrid", { 0: grid })}
      </div>
    </div>
  ) : <></>;
}

function renderPredefinedColumns(ctx: GridContext) {
  const { grid } = ctx.props;
  // predefinedGrid — split "4_8" → [4, 8], compute area names
  const parts = (grid ?? "12").split("_").filter((part) => part !== "");
  if (parts.length < 1 || parts.length > 4) {
    return renderGridWarning(ctx, "col", grid ?? "");
  }
  const areaNames = predefinedAreaNames(parts);
  return (
    <>
      {parts.map((span, i) => {
        const colClass = span === "12" ? "col" : `col-md-${span}`;
        const areaPath = `${ctx.colNamePrefix}${areaNames[i]}`;
        return (
          <div key={areaPath} className={colClass}>
            {renderCol(ctx, areaPath)}
          </div>
        );
      })}
    </>
  );
}

function renderCustomColumns(ctx: GridContext) {
  const { gridClasses } = ctx.props;
  // customGrid — comma-separated CSS classes, area names col0, col1, …
  const columns = gridClasses ? gridClasses.split(",").map((c) => c.trim()) : [];
  if (columns.length === 0) {
    return renderGridWarning(ctx, "col-md-12", "");
  }
  return (
    <>
      {columns.map((colClass, i) => {
        const areaPath = `${ctx.colNamePrefix}col${i}`;
        return (
          <div key={areaPath} className={colClass}>
            {renderCol(ctx, areaPath)}
          </div>
        );
      })}
    </>
  );
}

function renderSingleColumn(ctx: GridContext) {
  const { currentNode, renderContext, createContainer, createRow, isModulesPath, isStudioMode } = ctx;
  // nogrid — single area node; name is "main" normally, or node name in /modules
  const colName = isModulesPath || isStudioMode ? currentNode.getName() : "main";
  return (
    <>
      {renderContext.isEditMode() && !createContainer && !createRow &&
        !isModulesPath && !isStudioMode && (
          <span className="text-body-secondary">#{currentNode.getName()}</span>
        )}
      {renderCol(ctx, colName)}
    </>
  );
}

function renderGridColumns(ctx: GridContext) {
  if (ctx.isPredefined) return renderPredefinedColumns(ctx);
  if (ctx.isCustom) return renderCustomColumns(ctx);
  return renderSingleColumn(ctx);
}

/** The columns, inside the row when there is one. */
function renderRow(ctx: GridContext, rowFullClass: string) {
  const { rowId } = ctx.props;
  const rowIdAttribute = rowId ? { id: rowId } : {};
  return (
    <>
      {ctx.createRow ? (
        <div
          {...rowIdAttribute}
          className={rowFullClass}
        >
          {renderGridColumns(ctx)}
        </div>
      ) : (
        renderGridColumns(ctx)
      )}
    </>
  );
}

/** Attributes of the section wrapper. */
function buildSectionProps(props: GridProps): Record<string, string | CSSProperties> {
  const { sectionId, sectionCssClass, sectionRole, sectionStyle, sectionAria } = props;
  const sectionProps: Record<string, string | CSSProperties> = {};
  if (sectionId) sectionProps.id = sectionId;
  if (sectionCssClass) sectionProps.className = sectionCssClass.trim();
  if (sectionRole) sectionProps.role = sectionRole;
  // React only takes a style object: a string makes the whole view throw
  const style = parseInlineStyle(sectionStyle);
  if (style) sectionProps.style = style;
  if (sectionAria) sectionProps["aria-label"] = sectionAria;
  return sectionProps;
}

jahiaComponent(
  {
    nodeType: "bootstrap5nt:grid",
    componentType: "view",
    name: "default",
    displayName: "Grid",
    // Column areas may resolve per page (2.x grid.properties)
    properties: { "cache.mainResource": "true" },
  },
  (props: GridProps) => {
    const { currentNode, renderContext, mainNode } = useServerContext();
    const { t } = useTranslation();

    // ── Wrapper flags ──────────────────────────────────────────────────────
    const createSection = currentNode.isNodeType("bootstrap5mix:createSection");
    const createContainer = currentNode.isNodeType("bootstrap5mix:createContainer");
    const createRow = currentNode.isNodeType("bootstrap5mix:createRow");

    // ── Absolute areas ─────────────────────────────────────────────────────
    const createAbsoluteAreas = currentNode.isNodeType("bootstrap5mix:createAbsoluteAreas");

    // ── Column name prefix for /modules paths or studiomode ────────────────
    const isModulesPath = currentNode.getPath().startsWith("/modules");
    const isStudioMode = renderContext.getEditModeConfigName() === "studiomode";

    // 2.x rendered every column with <template:area areaAsSubNode="true">: the column content lives
    // under the grid node ({gridPath}/main, {gridPath}/side, {gridPath}/col0…), or under the page
    // displayed when the grid comes from a page template.
    // With bootstrap5mix:createAbsoluteAreas it used moduleType="absoluteArea" and the chosen level:
    // the content lives under the ancestor page of that level ({ancestorPath}/main…), is shared by
    // every page below it, and can only be edited on that ancestor page.
    const absoluteLevel = Number.parseInt(props.level ?? "0", 10) || 0;

    const ctx: GridContext = {
      currentNode,
      renderContext,
      mainNode,
      t,
      props,
      createContainer,
      createRow,
      createAbsoluteAreas,
      // ── Grid type ────────────────────────────────────────────────────────
      isPredefined: currentNode.isNodeType("bootstrap5mix:predefinedGrid"),
      isCustom: currentNode.isNodeType("bootstrap5mix:customGrid"),
      isModulesPath,
      isStudioMode,
      colNamePrefix: isModulesPath || isStudioMode ? `${currentNode.getName()}-` : "",
      numberOfItems: resolveNumberOfItems(currentNode, props.listLimit),
      absoluteLevel,
      anchor: createAbsoluteAreas ? absoluteAreaAnchor(mainNode, absoluteLevel) : undefined,
      showAbsoluteAreaHelp: createAbsoluteAreas && isStudioMode,
    };

    // ── Assemble wrapper layers ────────────────────────────────────────────
    const inner = renderRow(ctx, resolveRowClass(props));
    const containerIdAttribute = props.containerId ? { id: props.containerId } : {};

    const withContainer = createContainer ? (
      <div
        {...containerIdAttribute}
        className={resolveContainerClass(props.containerType, props.containerCssClass)}
      >
        {inner}
      </div>
    ) : inner;

    if (createSection) {
      // ── Grid columns content ─────────────────────────────────────────────
      const { sectionElement } = props;
      const SectionTag = (sectionElement && SECTION_ELEMENTS.has(sectionElement) ? sectionElement : "div") as "section" | "div";
      return <SectionTag {...buildSectionProps(props)}>{withContainer}</SectionTag>;
    }

    return withContainer;
  },
);
