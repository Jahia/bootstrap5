/**
 * jmix:list — SSR view (HTML layer only)
 *
 * Source JSP: jmix_list/html/list.jsp
 * Registers:  jmix:list / "default"
 *
 * The JSP relies on several Java-only constructs that have no JS equivalent:
 *
 *   - `moduleMap.currentList`     — the paginated/filtered child list
 *   - `moduleMap.begin` / `end`   — pagination window (set by Pagination component)
 *   - `moduleMap.liveOnly`        — flag for AJAX live-only rendering
 *   - `moduleMap.subNodesView`    — view name override for child nodes
 *   - `moduleMap.editable`        — whether edit-mode drop zone is shown
 *   - `moduleMap.emptyListMessage`— custom empty-state message
 *   - `template:include view="hidden.header"` / `"hidden.footer"` — Java sub-views
 *   - jQuery `$('#...').load(...)` — live-only AJAX loading
 *
 * What IS implemented here:
 *   - Renders all typed child nodes via <Render> (equivalent to template:module for each child)
 *   - Edit-mode drop zone via <Area>
 *   - Edit-mode clearfix div
 *
 * Pagination integration (begin/end), liveOnly AJAX, emptyListMessage, and the
 * hidden.header/footer sub-views remain blocked until equivalent APIs exist in
 * the JS module engine.
 */
import {
  Area,
  Render,
  getChildNodes,
  jahiaComponent,
  useServerContext,
} from "@jahia/javascript-modules-library";

jahiaComponent(
  {
    nodeType: "jmix:list",
    componentType: "view",
    name: "default",
    displayName: "List",
  },
  () => {
    const { currentNode, renderContext } = useServerContext();
    const isEditMode = renderContext.isEditMode();
    const children = getChildNodes(currentNode);

    return (
      <>
        {children.map((child) => (
          <Render key={child.getIdentifier()} node={child} />
        ))}
        {isEditMode && <div className="clearfix" />}
        {isEditMode && <Area name="*" />}
      </>
    );
  },
);
