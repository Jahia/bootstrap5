/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * jmix:list — renders the items of a list, one page of them when a bootstrap5nt:pagination is
 * bound to the list, and the "add content" button in edit mode.
 *
 * Port of the 2.x jmix:list "list" view. The JSP view also honoured emptyListMessage and liveOnly,
 * two values other JSP views passed through the moduleMap request variable; that variable does not
 * exist for JavaScript views, so they are not ported.
 *
 * Ordering constraint, same as 2.x: the pager must be rendered BEFORE its list in the page. The
 * pager tells the list its page size through a request attribute (2.x: the "pagerLimits" request
 * map, filled when the pager renders), so a list placed before its pager shows all its items on the
 * first display, until the URL carries the pagesize parameter. See docs/pagination.md.
 */
import {
  AddContentButtons,
  Render,
  jahiaComponent,
  useServerContext,
} from "@jahia/javascript-modules-library";
import { applyAreaLimit, getPageItems, readRenderParameters } from "../../utils/pager.js";

jahiaComponent(
  {
    nodeType: "jmix:list",
    componentType: "view",
    name: "default",
    displayName: "List",
    // Accordions, tabs, carousel... are jmix:list too, and the engine ranks applicable views by priority,
    // module and name only: at equal priority this generic view could replace their own "default" view.
    priority: -1,
    // 2.x list.properties: paging parameters, and children shown or hidden by visibility conditions
    properties: {
      "cache.requestParameters": "N-*,filter,begin${currentNode.identifier},end${currentNode.identifier},pagesize${currentNode.identifier}",
      "cache.dependsOnVisibilityOf": "$currentNode/[^/]*",
    },
  },
  () => {
    const { currentNode, currentResource, renderContext } = useServerContext();
    const isEditMode = renderContext.isEditMode();
    let items = getPageItems(currentNode, renderContext.getRequest());
    // Limit set by the area that displays this list (grid listLimit)
    items = applyAreaLimit(items, readRenderParameters(currentResource));

    // Optional cap on the number of items (kept from 3.0.x)
    const listLimit = Number.parseInt(currentNode.getPropertyAsString("limit") ?? "", 10);
    if (!Number.isNaN(listLimit) && listLimit > 0) items = items.slice(0, listLimit);

    // View chosen by the editor for the items (jmix:renderableList)
    const subNodesView = currentNode.hasProperty("j:subNodesView")
      ? currentNode.getPropertyAsString("j:subNodesView")
      : "";

    return (
      <>
        {items.map((child) => (
          <Render key={child.getIdentifier()} node={child} {...(subNodesView ? { view: subNodesView } : {})} />
        ))}
        {isEditMode && <div className="clearfix" />}
        {isEditMode && <AddContentButtons />}
      </>
    );
  },
);
