import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeRenderContext, renderFn } from '../helpers';

import '../../components/List/default.server';
import '../../components/Tabs/content-list.server';

describe('jmix:list (default view)', () => {
  const getListFn = () => _getComponent('jmix:list', 'default');

  function makeItems(count: number, overrides: (i: number) => any = () => ({})) {
    return Array.from({ length: count }, (_, i) => makeNode({ _id: `c${i + 1}`, ...overrides(i) }));
  }

  function makeListCtx(children: any[] = [], rcOverrides: any = {}, nodeOverrides: any = {}) {
    const ctx = {
      currentNode: makeNode({ _id: 'list-1', _children: children, ...nodeOverrides }),
      renderContext: makeRenderContext(rcOverrides),
      mainNode: makeNode({ _id: 'list-1' }),
    };
    _setContext(ctx);
    return ctx;
  }

  const renderedIds = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('[data-testid="render-node"]')).map((n) => n.getAttribute('data-node-id'));

  test('no children → no render-node elements', () => {
    const { container } = renderFn(getListFn(), {}, makeListCtx([]));
    expect(renderedIds(container)).toEqual([]);
  });

  test('with children → renders each via Render, in order', () => {
    const { container } = renderFn(getListFn(), {}, makeListCtx(makeItems(2)));
    expect(renderedIds(container)).toEqual(['c1', 'c2']);
  });

  test('edit mode → clearfix and add-content button (2.x <template:module path="*">), no area', () => {
    const { container } = renderFn(getListFn(), {}, makeListCtx([], { _editMode: true }));
    expect(container.querySelector('.clearfix')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="add-content-buttons"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="area"]')).not.toBeInTheDocument();
  });

  test('live mode → no clearfix, no add-content button', () => {
    const { container } = renderFn(getListFn(), {}, makeListCtx([]));
    expect(container.querySelector('.clearfix')).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="add-content-buttons"]')).not.toBeInTheDocument();
  });

  // ── Paging (bootstrap5nt:pagination bound to the list) ─────────────────────

  test('begin + pagesize URL parameters → that page only', () => {
    const ctx = makeListCtx(makeItems(7), { _params: { 'beginlist-1': '3', 'endlist-1': '5', 'pagesizelist-1': '3' } });
    const { container } = renderFn(getListFn(), {}, ctx);
    expect(renderedIds(container)).toEqual(['c4', 'c5', 'c6']);
  });

  test('last page → remaining items', () => {
    const ctx = makeListCtx(makeItems(7), { _params: { 'beginlist-1': '6', 'pagesizelist-1': '3' } });
    const { container } = renderFn(getListFn(), {}, ctx);
    expect(renderedIds(container)).toEqual(['c7']);
  });

  test('page size left in the request by a pager rendered before → first page limited', () => {
    const ctx = makeListCtx(makeItems(7), { _attributes: { 'bootstrap5.pager.pagesize.list-1': '2' } });
    const { container } = renderFn(getListFn(), {}, ctx);
    expect(renderedIds(container)).toEqual(['c1', 'c2']);
  });

  test('huge pagesize URL parameter is capped to 100 items', () => {
    const ctx = makeListCtx(makeItems(150), { _params: { 'pagesizelist-1': '1000000' } });
    const { container } = renderFn(getListFn(), {}, ctx);
    expect(renderedIds(container)).toHaveLength(100);
  });

  test('pagesize URL parameter equal to the cap is kept', () => {
    const ctx = makeListCtx(makeItems(150), { _params: { 'pagesizelist-1': '100' } });
    const { container } = renderFn(getListFn(), {}, ctx);
    expect(renderedIds(container)).toHaveLength(100);
  });

  test('paging parameters of another list are ignored', () => {
    const ctx = makeListCtx(makeItems(4), { _params: { 'beginother': '2', 'pagesizeother': '1' } });
    const { container } = renderFn(getListFn(), {}, ctx);
    expect(renderedIds(container).length).toBe(4);
  });

  test('invalid paging parameters → whole list', () => {
    const ctx = makeListCtx(makeItems(4), { _params: { 'beginlist-1': 'abc', 'pagesizelist-1': '-2' } });
    const { container } = renderFn(getListFn(), {}, ctx);
    expect(renderedIds(container).length).toBe(4);
  });

  // ── Limit asked by the area that displays the list (grid listLimit) ────────

  test('area limit render parameter → only that number of items', () => {
    const ctx: any = makeListCtx(makeItems(5));
    ctx.currentResource = { _params: { bootstrap5ListLimit: '2' } };
    const { container } = renderFn(getListFn(), {}, ctx);
    expect(renderedIds(container)).toEqual(['c1', 'c2']);
  });

  test('no or invalid area limit → whole list', () => {
    const ctx: any = makeListCtx(makeItems(3));
    ctx.currentResource = { _params: { bootstrap5ListLimit: 'x' } };
    const { container } = renderFn(getListFn(), {}, ctx);
    expect(renderedIds(container).length).toBe(3);
  });

  // ── Item view and ordering ─────────────────────────────────────────────────

  test('j:subNodesView → items rendered with that view', () => {
    const ctx = makeListCtx(makeItems(2), {}, { _properties: { 'j:subNodesView': 'card' } });
    const { container } = renderFn(getListFn(), {}, ctx);
    const views = Array.from(container.querySelectorAll('[data-testid="render-node"]')).map((n) => n.getAttribute('data-view'));
    expect(views).toEqual(['card', 'card']);
  });

  test('no j:subNodesView → default view of each item', () => {
    const { container } = renderFn(getListFn(), {}, makeListCtx(makeItems(1)));
    expect(container.querySelector('[data-testid="render-node"]')).not.toHaveAttribute('data-view');
  });

  test('jmix:orderedList → sorted on firstField, descending when asked', () => {
    const titles = ['banana', 'Cherry', 'apple'];
    const items = makeItems(3, (i) => ({ _properties: { 'jcr:title': titles[i] } }));
    const ctx = makeListCtx(items, {}, {
      _nodeTypes: ['jmix:orderedList'],
      _properties: { firstField: 'jcr:title', firstDirection: 'desc' },
    });
    const { container } = renderFn(getListFn(), {}, ctx);
    expect(renderedIds(container)).toEqual(['c2', 'c1', 'c3']);
  });

  test('jmix:orderedList without a sort field → node order', () => {
    const ctx = makeListCtx(makeItems(3), {}, { _nodeTypes: ['jmix:orderedList'] });
    const { container } = renderFn(getListFn(), {}, ctx);
    expect(renderedIds(container)).toEqual(['c1', 'c2', 'c3']);
  });
});

describe('jnt:contentList (default view)', () => {
  const getFn = () => _getComponent('jnt:contentList', 'default');

  function makeCtx(children: any[], rcOverrides: any = {}) {
    const ctx = {
      currentNode: makeNode({ _id: 'cl-1', _children: children, _nodeTypes: ['jnt:contentList'] }),
      renderContext: makeRenderContext(rcOverrides),
      mainNode: makeNode({ _id: 'page' }),
    };
    _setContext(ctx);
    return ctx;
  }
  const droppable = (id: string) => makeNode({ _id: id, _nodeTypes: ['jmix:droppableContent'] });

  test('renders only droppable content', () => {
    const ctx = makeCtx([droppable('a'), makeNode({ _id: 'x' }), droppable('b')]);
    const { container } = renderFn(getFn(), {}, ctx);
    const ids = Array.from(container.querySelectorAll('[data-testid="render-node"]')).map((n) => n.getAttribute('data-node-id'));
    expect(ids).toEqual(['a', 'b']);
  });

  test('area limit render parameter → only that number of droppable items', () => {
    const ctx: any = makeCtx([droppable('a'), droppable('b'), droppable('c')]);
    ctx.currentResource = { _params: { bootstrap5ListLimit: '2' } };
    const { container } = renderFn(getFn(), {}, ctx);
    const ids = Array.from(container.querySelectorAll('[data-testid="render-node"]')).map((n) => n.getAttribute('data-node-id'));
    expect(ids).toEqual(['a', 'b']);
  });

  test('paged by a bound pagination', () => {
    const ctx = makeCtx([droppable('a'), droppable('b'), droppable('c')], { _params: { 'begincl-1': '1', 'pagesizecl-1': '1' } });
    const { container } = renderFn(getFn(), {}, ctx);
    const ids = Array.from(container.querySelectorAll('[data-testid="render-node"]')).map((n) => n.getAttribute('data-node-id'));
    expect(ids).toEqual(['b']);
  });
});
