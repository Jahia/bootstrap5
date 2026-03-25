import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeCtx, makeRenderContext, renderFn } from '../helpers';

import '../../components/List/default.server';

describe('jmix:list (default view)', () => {
  function getListFn() {
    return _getComponent('jmix:list', 'default');
  }

  function makeListCtx(children: any[] = [], editMode = false) {
    const ctx = {
      currentNode: makeNode({ _id: 'list-1', _children: children }),
      renderContext: makeRenderContext({ _editMode: editMode }),
      mainNode: makeNode({ _id: 'list-1' }),
    };
    _setContext(ctx);
    return ctx;
  }

  test('no children → no render-node elements', () => {
    const ctx = makeListCtx([]);
    const fn = getListFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelectorAll('[data-testid="render-node"]').length).toBe(0);
  });

  test('with children → renders each via Render', () => {
    const child1 = makeNode({ _id: 'c1' });
    const child2 = makeNode({ _id: 'c2' });
    const ctx = makeListCtx([child1, child2]);
    const fn = getListFn();
    const { container } = renderFn(fn, {}, ctx);
    const rendered = container.querySelectorAll('[data-testid="render-node"]');
    expect(rendered.length).toBe(2);
    expect(rendered[0]).toHaveAttribute('data-node-id', 'c1');
    expect(rendered[1]).toHaveAttribute('data-node-id', 'c2');
  });

  test('edit mode → clearfix div rendered', () => {
    const ctx = makeListCtx([], true);
    const fn = getListFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.clearfix')).toBeInTheDocument();
  });

  test('edit mode → Area rendered', () => {
    const ctx = makeListCtx([], true);
    const fn = getListFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('[data-testid="area"]')).toBeInTheDocument();
  });

  test('live mode → no clearfix div', () => {
    const ctx = makeListCtx([], false);
    const fn = getListFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.clearfix')).not.toBeInTheDocument();
  });

  test('live mode → no Area', () => {
    const ctx = makeListCtx([], false);
    const fn = getListFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('[data-testid="area"]')).not.toBeInTheDocument();
  });
});
