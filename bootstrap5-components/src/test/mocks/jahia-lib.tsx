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
export function RenderChildren({ filter }: { filter?: string } = {}) {
  return <div data-testid="render-children" data-filter={filter} />;
}
export function Render({ node }: { node?: any }) {
  return <div data-testid="render-node" data-node-id={node?.getIdentifier?.()} />;
}
export function getChildNodes(node: any): any[] { return node?._children ?? []; }
export function AddResources({ type, resources, inlineResource, targetTag }: { type?: string; resources?: string; inlineResource?: string; targetTag?: string }) {
  return <div data-testid="add-resources" data-type={type} data-resources={resources} />;
}
export function AddContentButtons() {
  return <div data-testid="add-content-buttons" />;
}
export function buildNodeUrl(node: any, opts?: { language?: string }): string {
  return node?.getUrl?.() ?? '#';
}
