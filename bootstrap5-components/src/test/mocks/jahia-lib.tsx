/**
 * Test mock for @jahia/javascript-modules-library
 * - jahiaComponent(config, fn) stores fn in a registry
 * - _setContext(ctx) sets what useServerContext() returns
 * - _getComponent(nodeType, name) retrieves a registered fn
 * - Area, RenderChildren, Render, AddResources render identifiable test divs
 * - getChildNodes(node) returns node._children ?? []
 */
import React from 'react';

type RenderFn = (props: any, ctx?: any) => React.ReactNode;

const registry = new Map<string, RenderFn>();
let _ctx: any = {};

export function _setContext(ctx: any) { _ctx = ctx; }
export function _getCtx() { return _ctx; }
export function _getComponent(nodeType: string, name = 'default'): RenderFn {
  const fn = registry.get(`${nodeType}:${name}`);
  if (!fn) throw new Error(`No component registered for ${nodeType}:${name}`);
  return fn;
}
export function _clearRegistry() { registry.clear(); }

export function jahiaComponent(config: { nodeType: string; name?: string }, fn: RenderFn) {
  registry.set(`${config.nodeType}:${config.name ?? 'default'}`, fn);
}
export function useServerContext() { return _ctx; }

export function Area({ name, nodeType }: { name?: string; nodeType?: string }) {
  return <div data-testid="area" data-area-name={name} data-nodetype={nodeType} />;
}
export function AbsoluteArea({ name, parent, nodeType, readOnly, numberOfItems, parameters }: { name?: string; parent?: any; nodeType?: string; readOnly?: boolean | string; numberOfItems?: number; parameters?: Record<string, string> }) {
  return (
    <div
      data-testid="area"
      data-area-type="absolute"
      data-area-name={name}
      data-area-parent={parent?.getIdentifier?.()}
      data-nodetype={nodeType}
      data-read-only={readOnly === undefined ? undefined : String(readOnly)}
      data-limit={numberOfItems}
      data-render-limit={parameters?.bootstrap5ListLimit}
    />
  );
}

/**
 * Engine helpers (server.render.*). Tests replace individual functions through _setServer.
 * renderArea returns the markup of a test div, as the real helper returns the area's HTML.
 */
const defaultRender = {
  renderArea: (attr: any) =>
    `<div data-testid="area" data-area-type="subnode" data-area-name="${attr.name}"`
    + ` data-as-sub-node="${attr.areaAsSubNode}"`
    + (attr.numberOfItems !== undefined ? ` data-limit="${attr.numberOfItems}"` : '')
    + '></div>',
  getBoundNode: (_node: any, _ctx: any): any => null,
  getRenderParameters: (resource: any) => resource?._params ?? {},
  addCacheDependency: (_attr: any, _ctx: any) => undefined,
  findDisplayableNode: (node: any, _ctx: any, _site: any) => (node?.isNodeType?.('jnt:page') ? node : null),
};
export const server: { render: Record<string, any> } = { render: { ...defaultRender } };
export function _setServer(render: Record<string, any> = {}) {
  server.render = { ...defaultRender, ...render };
}
export function RenderChildren({ filter }: { filter?: string } = {}) {
  return <div data-testid="render-children" data-filter={filter} />;
}
export function Render({ node, view }: { node?: any; view?: string }) {
  return <div data-testid="render-node" data-node-id={node?.getIdentifier?.()} data-view={view} />;
}
export function getChildNodes(node: any, limit?: number, offset = 0, filter?: (n: any) => boolean): any[] {
  let children: any[] = node?._children ?? [];
  if (filter) children = children.filter(filter);
  children = children.slice(offset);
  return limit !== undefined && limit > 0 ? children.slice(0, limit) : children;
}
export function AddResources({ type, resources, inlineResource, targetTag }: { type?: string; resources?: string; inlineResource?: string; targetTag?: string }) {
  return <div data-testid="add-resources" data-type={type} data-resources={resources} data-target={targetTag} data-inline={inlineResource} />;
}
export function AddContentButtons({ nodeTypes }: { nodeTypes?: string[] } = {}) {
  return <div data-testid="add-content-buttons" data-node-types={nodeTypes?.join(' ')} />;
}
export function buildNodeUrl(node: any, opts?: { language?: string }): string {
  const url = node?.getUrl?.() ?? '#';
  return opts?.language ? `${url}?lang=${opts.language}` : url;
}
