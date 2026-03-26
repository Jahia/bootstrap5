import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeRenderContext, renderFn } from '../helpers';

import '../../components/Pagination/default.server';

describe('bootstrap5nt:pagination (default view)', () => {
  function getPaginationFn() {
    return _getComponent('bootstrap5nt:pagination', 'default');
  }

  function makePaginationCtx(editMode = false) {
    const ctx = {
      currentNode: makeNode({ _id: 'pag-1', _nodeName: 'pagination' }),
      renderContext: makeRenderContext({ _editMode: editMode }),
      mainNode: makeNode({ _id: 'pag-1' }),
    };
    _setContext(ctx);
    return ctx;
  }

  test('edit mode (hasBoundComponent=false) → renders placeholder text', () => {
    const ctx = makePaginationCtx(true);
    const fn = getPaginationFn();
    const { container } = renderFn(fn, {}, ctx);
    const small = container.querySelector('small');
    expect(small).toBeInTheDocument();
    expect(small?.textContent).toContain('pagination');
    expect(small?.textContent).toContain('Pagination');
  });

  test('edit mode placeholder includes node name', () => {
    const ctx = makePaginationCtx(true);
    const fn = getPaginationFn();
    const { container } = renderFn(fn, {}, ctx);
    const small = container.querySelector('small');
    // Node name is 'pagination' from makeNode _nodeName
    expect(small?.textContent).toContain('pagination');
  });

  test('live mode (hasBoundComponent=false) → renders null (no output)', () => {
    const ctx = makePaginationCtx(false);
    const fn = getPaginationFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.firstChild).toBeNull();
  });

  test('edit mode → no pagination ul rendered', () => {
    const ctx = makePaginationCtx(true);
    const fn = getPaginationFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.pagination')).not.toBeInTheDocument();
  });
});
