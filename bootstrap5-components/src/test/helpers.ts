import { render } from '@testing-library/react';
import React from 'react';

// ── Node mock ──────────────────────────────────────────────────────────────

export function makeProp(value: any) {
  return {
    getString: () => (value == null ? '' : String(value)),
    getBoolean: () => Boolean(value),
    getNode: () => value,
    getValues: () =>
      Array.isArray(value)
        ? value.map((v: any) => ({ getString: () => String(v) }))
        : [],
  };
}

export interface NodeOverrides {
  _id?: string;
  _name?: string;        // displayableName
  _nodeName?: string;    // node name (getName())
  _path?: string;
  _url?: string;
  _parent?: any;
  _ancestors?: any[];
  _children?: any[];
  _nodeTypes?: string[];
  _properties?: Record<string, any>;
  [key: string]: any;
}

export function makeNode(overrides: NodeOverrides = {}): any {
  const nodeTypes = new Set<string>(overrides._nodeTypes ?? []);
  const rawProps: Record<string, any> = overrides._properties ?? {};
  const properties = new Map<string, any>(Object.entries(rawProps));

  const node: any = {
    getIdentifier: () => overrides._id ?? 'node-abc',
    getDisplayableName: () => overrides._name ?? 'Test Node',
    getName: () => overrides._nodeName ?? 'test-node',
    getPath: () => overrides._path ?? '/sites/test/home',
    getUrl: () => overrides._url ?? '/files/image.png',
    getParent: () => overrides._parent ?? makeNode({ _id: 'parent-abc' }),
    getAncestors: () => overrides._ancestors ?? [],
    isNodeType: (type: string) => nodeTypes.has(type),
    hasProperty: (name: string) => properties.has(name),
    getProperty: (name: string) => {
      const v = properties.get(name);
      return v !== undefined ? makeProp(v) : null;
    },
    getPropertyAsString: (name: string) => {
      const v = properties.get(name);
      return v != null ? String(v) : '';
    },
    _children: overrides._children ?? [],
  };
  // Allow callers to override individual methods (e.g. makeCarouselItem overrides getProperty)
  for (const [k, v] of Object.entries(overrides)) {
    if (!k.startsWith('_') && typeof v === 'function') {
      node[k] = v;
    }
  }
  return node;
}

// ── RenderContext mock ─────────────────────────────────────────────────────

export interface RcOverrides {
  _editMode?: boolean;
  _previewMode?: boolean;
  _site?: any;
  _locale?: any;
  _loggedIn?: boolean;
  _user?: any;
  _urlGen?: any;
  _editModeConfig?: string;
  [key: string]: any;
}

export function makeRenderContext(overrides: RcOverrides = {}): any {
  return {
    isEditMode: () => overrides._editMode ?? false,
    isPreviewMode: () => overrides._previewMode ?? false,
    getSite: () => overrides._site ?? null,
    getMainResourceLocale: () => overrides._locale ?? null,
    isLoggedIn: () => overrides._loggedIn ?? false,
    getUser: () => overrides._user ?? null,
    getURLGenerator: () => overrides._urlGen ?? null,
    getEditModeConfigName: () => overrides._editModeConfig ?? '',
  };
}

export function makeLocale(lang: string) {
  return { getLanguage: () => lang };
}

export function makeUrlGen(overrides: Record<string, string> = {}) {
  return {
    getLogout: () => overrides.logout ?? '/cms/logout',
    getLive: () => overrides.live ?? '/sites/test',
    getPreview: () => overrides.preview ?? '/cms/preview',
    getEdit: () => overrides.edit ?? '/cms/edit',
  };
}

// ── Server context ─────────────────────────────────────────────────────────

export function makeCtx(nodeOv: NodeOverrides = {}, rcOv: RcOverrides = {}, mainOv?: NodeOverrides) {
  return {
    currentNode: makeNode(nodeOv),
    renderContext: makeRenderContext(rcOv),
    mainNode: makeNode(mainOv ?? nodeOv),
  };
}

// ── Render helper ──────────────────────────────────────────────────────────

/** Renders a jahiaComponent fn result into a DOM. fn is called with (props, ctx). */
export function renderFn(fn: (props: any, ctx?: any) => React.ReactNode, props: any, ctx: any) {
  function Comp() {
    return React.createElement(React.Fragment, null, fn(props, ctx) as any);
  }
  return render(React.createElement(Comp));
}
