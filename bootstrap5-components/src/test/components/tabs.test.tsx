import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeRenderContext, renderFn } from '../helpers';

import '../../components/Tabs/default.server';

// We test toAnchor indirectly through rendered output (data-bs-target attributes)

function makeContentList(id: string, name: string): any {
  return makeNode({
    _id: id,
    _nodeName: name,
    _name: name,
    _nodeTypes: ['jnt:contentList'],
  });
}

describe('bootstrap5nt:tabs — toAnchor function (via rendered output)', () => {
  function getTabsFn() {
    return _getComponent('bootstrap5nt:tabs', 'default');
  }

  function makeTabsCtx(children: any[], rcOverrides: any = {}) {
    const ctx = {
      currentNode: makeNode({ _id: 'tabs-1', _children: children }),
      renderContext: makeRenderContext(rcOverrides),
      mainNode: makeNode({ _id: 'tabs-1' }),
    };
    _setContext(ctx);
    return ctx;
  }

  test('toAnchor("my tab") → "my-tab" (spaces → hyphens)', () => {
    const list = makeContentList('list-1', 'my tab');
    const ctx = makeTabsCtx([list]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { useListNameAsAnchor: true }, ctx);
    const btn = container.querySelector('button[data-bs-toggle="tab"]');
    expect(btn).toHaveAttribute('data-bs-target', '#my-tab');
  });

  test('toAnchor("123") → "tab-123" (starts with digit → prefix "tab-")', () => {
    const list = makeContentList('list-2', '123');
    const ctx = makeTabsCtx([list]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { useListNameAsAnchor: true }, ctx);
    const btn = container.querySelector('button[data-bs-toggle="tab"]');
    expect(btn).toHaveAttribute('data-bs-target', '#tab-123');
  });

  test('toAnchor("valid") → "valid" (unchanged)', () => {
    const list = makeContentList('list-3', 'valid');
    const ctx = makeTabsCtx([list]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { useListNameAsAnchor: true }, ctx);
    const btn = container.querySelector('button[data-bs-toggle="tab"]');
    expect(btn).toHaveAttribute('data-bs-target', '#valid');
  });
});

describe('bootstrap5nt:tabs (default view)', () => {
  function getTabsFn() {
    return _getComponent('bootstrap5nt:tabs', 'default');
  }

  function makeTabsCtx(children: any[], rcOverrides: any = {}) {
    const ctx = {
      currentNode: makeNode({ _id: 'tabs-main', _children: children }),
      renderContext: makeRenderContext(rcOverrides),
      mainNode: makeNode({ _id: 'tabs-main' }),
    };
    _setContext(ctx);
    return ctx;
  }

  test('type="tab" → nav-tabs class', () => {
    const ctx = makeTabsCtx([]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { type: 'tab' }, ctx);
    const ul = container.querySelector('ul.nav');
    expect(ul?.className).toContain('nav-tabs');
  });

  test('type="pill" → nav-pills class', () => {
    const ctx = makeTabsCtx([]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { type: 'pill' }, ctx);
    const ul = container.querySelector('ul.nav');
    expect(ul?.className).toContain('nav-pills');
  });

  test('type="underline" → nav-underline (no "s")', () => {
    const ctx = makeTabsCtx([]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { type: 'underline' }, ctx);
    const ul = container.querySelector('ul.nav');
    expect(ul?.className).toContain('nav-underline');
    expect(ul?.className).not.toContain('nav-underlines');
  });

  test('type="link" → nav-links', () => {
    const ctx = makeTabsCtx([]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { type: 'link' }, ctx);
    const ul = container.querySelector('ul.nav');
    expect(ul?.className).toContain('nav-links');
  });

  test('align="justify-content-center" → added to nav class', () => {
    const ctx = makeTabsCtx([]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { align: 'justify-content-center' }, ctx);
    const ul = container.querySelector('ul.nav');
    expect(ul?.className).toContain('justify-content-center');
  });

  test('align="justify-content-start" (default) → NOT added to nav class', () => {
    const ctx = makeTabsCtx([]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { align: 'justify-content-start' }, ctx);
    const ul = container.querySelector('ul.nav');
    expect(ul?.className).not.toContain('justify-content-start');
  });

  test('fade=true → "fade" class on tab panes', () => {
    const list1 = makeContentList('l1', 'tab1');
    const list2 = makeContentList('l2', 'tab2');
    const ctx = makeTabsCtx([list1, list2]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { fade: true }, ctx);
    const panes = container.querySelectorAll('.tab-pane');
    panes.forEach(pane => {
      expect(pane).toHaveClass('fade');
    });
  });

  test('fade=false → no "fade" class on tab panes', () => {
    const list1 = makeContentList('l1', 'tab1');
    const ctx = makeTabsCtx([list1]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { fade: false }, ctx);
    const panes = container.querySelectorAll('.tab-pane');
    panes.forEach(pane => {
      expect(pane).not.toHaveClass('fade');
    });
  });

  test('first tab → "active" class on button + panel', () => {
    const list1 = makeContentList('l-first', 'first');
    const list2 = makeContentList('l-second', 'second');
    const ctx = makeTabsCtx([list1, list2]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, {}, ctx);
    const buttons = container.querySelectorAll('button[data-bs-toggle="tab"]');
    expect(buttons[0]).toHaveClass('active');
    expect(buttons[1]).not.toHaveClass('active');

    const panes = container.querySelectorAll('.tab-pane');
    expect(panes[0]).toHaveClass('active');
    expect(panes[1]).not.toHaveClass('active');
  });

  test('useListNameAsAnchor=true → anchor from sanitized node name', () => {
    const list = makeContentList('my-list', 'my-list-name');
    const ctx = makeTabsCtx([list]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { useListNameAsAnchor: true }, ctx);
    const btn = container.querySelector('button[data-bs-toggle="tab"]');
    expect(btn?.getAttribute('data-bs-target')).toBe('#my-list-name');
  });

  test('useListNameAsAnchor=false → anchor from UUID ("tab-{id}")', () => {
    const list = makeContentList('uuid-abc-123', 'my list');
    const ctx = makeTabsCtx([list]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { useListNameAsAnchor: false }, ctx);
    const btn = container.querySelector('button[data-bs-toggle="tab"]');
    expect(btn?.getAttribute('data-bs-target')).toBe('#tab-uuid-abc-123');
  });

  test('2 content list children → 2 tabs, 2 panels', () => {
    const l1 = makeContentList('tab-a', 'Tab A');
    const l2 = makeContentList('tab-b', 'Tab B');
    const ctx = makeTabsCtx([l1, l2]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelectorAll('button[data-bs-toggle="tab"]').length).toBe(2);
    expect(container.querySelectorAll('.tab-pane').length).toBe(2);
  });

  test('no children → no tabs, no panels', () => {
    const ctx = makeTabsCtx([]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelectorAll('button[data-bs-toggle="tab"]').length).toBe(0);
    expect(container.querySelectorAll('.tab-pane').length).toBe(0);
  });

  test('deep-linking AddResources always rendered', () => {
    const ctx = makeTabsCtx([]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('[data-testid="add-resources"]')).toBeInTheDocument();
  });

  test('Area for new tab panels always rendered', () => {
    const ctx = makeTabsCtx([]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, {}, ctx);
    const area = container.querySelector('[data-testid="area"]');
    expect(area).toBeInTheDocument();
    expect(area).toHaveAttribute('data-area-name', 'tabs');
  });

  test('tab pane id matches anchor', () => {
    const list = makeContentList('l-panel', 'panelname');
    const ctx = makeTabsCtx([list]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { useListNameAsAnchor: true }, ctx);
    const btn = container.querySelector('button[data-bs-toggle="tab"]');
    const anchor = btn?.getAttribute('data-bs-target')?.slice(1); // remove '#'
    const pane = container.querySelector(`#${anchor}`);
    expect(pane).toBeInTheDocument();
    expect(pane).toHaveClass('tab-pane');
  });

  test('fade=true + first panel → also has "show" class', () => {
    const list1 = makeContentList('l1', 'tab1');
    const list2 = makeContentList('l2', 'tab2');
    const ctx = makeTabsCtx([list1, list2]);
    const fn = getTabsFn();
    const { container } = renderFn(fn, { fade: true }, ctx);
    const panes = container.querySelectorAll('.tab-pane');
    expect(panes[0]).toHaveClass('show');
    expect(panes[1]).not.toHaveClass('show');
  });
});
