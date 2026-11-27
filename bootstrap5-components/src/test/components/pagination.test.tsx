import { _setContext, _getComponent, _setServer } from '@jahia/javascript-modules-library';
import { makeNode, makeRenderContext, renderFn } from '../helpers';

import '../../components/Pagination/default.server';

describe('bootstrap5nt:pagination (default view)', () => {
  const getPaginationFn = () => _getComponent('bootstrap5nt:pagination', 'default');

  afterEach(() => _setServer());

  function makeList(count: number, nodeTypes = ['jmix:list']) {
    return makeNode({
      _id: 'list-1',
      _nodeTypes: nodeTypes,
      _children: Array.from({ length: count }, (_, i) => makeNode({ _id: `item-${i + 1}` })),
    });
  }

  /** A pager bound to `list` (null: bound to nothing). */
  function makePaginationCtx(list: any, rcOverrides: any = {}, nodeTypes: string[] = []) {
    _setServer({ getBoundNode: () => list });
    const ctx = {
      currentNode: makeNode({ _id: 'pag-1', _nodeName: 'pagination', _nodeTypes: nodeTypes }),
      renderContext: makeRenderContext(rcOverrides),
      mainNode: makeNode({ _id: 'page', _url: '/sites/test/home/news.html' }),
    };
    _setContext(ctx);
    return ctx;
  }

  const pageItems = (container: HTMLElement) => Array.from(container.querySelectorAll('.pagination > li'));
  const linkParams = (link: Element | null) => new URL(link?.getAttribute('href') ?? '', 'http://localhost').searchParams;

  // ── Nothing to page ────────────────────────────────────────────────────────

  test('not bound, edit mode → placeholder with the node name', () => {
    const ctx = makePaginationCtx(null, { _editMode: true });
    const { container } = renderFn(getPaginationFn(), { displayPager: true }, ctx);
    const small = container.querySelector('small');
    expect(small?.textContent).toContain('pagination');
    expect(small?.textContent).toContain('bootstrap5nt_pagination.label.empty');
    expect(container.querySelector('.pagination')).not.toBeInTheDocument();
  });

  test('not bound, live mode → nothing', () => {
    const ctx = makePaginationCtx(null);
    const { container } = renderFn(getPaginationFn(), { displayPager: true }, ctx);
    expect(container.firstChild).toBeNull();
  });

  test('bound to something that is not a list → nothing', () => {
    const ctx = makePaginationCtx(makeList(30, ['jnt:text']));
    const { container } = renderFn(getPaginationFn(), { displayPager: true }, ctx);
    expect(container.firstChild).toBeNull();
  });

  test('bound component cannot be resolved (engine error) → nothing, no crash', () => {
    const ctx = makePaginationCtx(null);
    _setServer({ getBoundNode: () => { throw new Error('boom'); } });
    const { container } = renderFn(getPaginationFn(), { displayPager: true }, ctx);
    expect(container.firstChild).toBeNull();
  });

  test('empty list → no pager', () => {
    const ctx = makePaginationCtx(makeList(0));
    const { container } = renderFn(getPaginationFn(), { displayPager: true }, ctx);
    expect(container.querySelector('.pagination')).not.toBeInTheDocument();
  });

  test('displayPager=false → no pager, but the page size is still handed to the list', () => {
    const ctx = makePaginationCtx(makeList(30));
    const { container } = renderFn(getPaginationFn(), { displayPager: false }, ctx);
    expect(container.querySelector('.pagination')).not.toBeInTheDocument();
    expect(ctx.renderContext.getRequest().getAttribute('bootstrap5.pager.pagesize.list-1')).toBe('10');
  });

  // ── Pager ──────────────────────────────────────────────────────────────────

  test('25 items, default page size 10 → 3 pages, page 1 current', () => {
    const ctx = makePaginationCtx(makeList(25));
    const { container } = renderFn(getPaginationFn(), { displayPager: true }, ctx);
    const items = pageItems(container);
    // previous + 3 pages + next
    expect(items.length).toBe(5);
    expect(items[1]).toHaveClass('active');
    expect(items[1]).toHaveAttribute('aria-current', 'page');
    expect(items[1].textContent).toBe('1');
    expect(container.querySelector('nav')).toHaveAttribute('aria-label', 'bootstrap5nt_pagination');
  });

  test('page links carry begin / end / pagesize of the bound list', () => {
    const ctx = makePaginationCtx(makeList(25));
    const { container } = renderFn(getPaginationFn(), { displayPager: true }, ctx);
    const page2 = pageItems(container)[2].querySelector('a');
    expect(page2?.getAttribute('href')).toContain('/sites/test/home/news.html?');
    const params = linkParams(page2);
    expect(params.get('beginlist-1')).toBe('10');
    expect(params.get('endlist-1')).toBe('19');
    expect(params.get('pagesizelist-1')).toBe('10');
  });

  test('first page → previous disabled and not a link, next links to page 2', () => {
    const ctx = makePaginationCtx(makeList(25));
    const { container } = renderFn(getPaginationFn(), { displayPager: true }, ctx);
    const items = pageItems(container);
    expect(items[0]).toHaveClass('disabled');
    expect(items[0].querySelector('a')).not.toBeInTheDocument();
    expect(items[0].querySelector('span.page-link')).toBeInTheDocument();
    expect(linkParams(items[4].querySelector('a')).get('beginlist-1')).toBe('10');
  });

  test('begin parameter → current page, previous and next around it', () => {
    const ctx = makePaginationCtx(makeList(25), { _params: { 'beginlist-1': '10', 'pagesizelist-1': '10' } });
    const { container } = renderFn(getPaginationFn(), { displayPager: true }, ctx);
    const items = pageItems(container);
    expect(items[2]).toHaveClass('active');
    expect(linkParams(items[0].querySelector('a')).get('beginlist-1')).toBe('0');
    expect(linkParams(items[4].querySelector('a')).get('beginlist-1')).toBe('20');
  });

  test('last page → next disabled and not a link', () => {
    const ctx = makePaginationCtx(makeList(25), { _params: { 'beginlist-1': '20', 'pagesizelist-1': '10' } });
    const { container } = renderFn(getPaginationFn(), { displayPager: true }, ctx);
    const items = pageItems(container);
    expect(items[3]).toHaveClass('active');
    expect(items[4]).toHaveClass('disabled');
    expect(items[4].querySelector('a')).not.toBeInTheDocument();
  });

  test('previous / next are keyboard reachable and labelled', () => {
    const ctx = makePaginationCtx(makeList(25), { _params: { 'beginlist-1': '10', 'pagesizelist-1': '10' } });
    const { container } = renderFn(getPaginationFn(), { displayPager: true }, ctx);
    const items = pageItems(container);
    expect(items[0].querySelector('a')).not.toHaveAttribute('tabindex');
    expect(items[0].querySelector('.visually-hidden')?.textContent).toBe('bootstrap5mix_advancedPagination.previous');
    expect(items[4].querySelector('.visually-hidden')?.textContent).toBe('bootstrap5mix_advancedPagination.next');
    expect(container.textContent).not.toContain('(current)');
  });

  test('other request parameters are kept in the links, paging ones are rebuilt', () => {
    const ctx = makePaginationCtx(makeList(25), { _params: { q: 'a b&c', 'beginlist-1': '10', 'endlist-1': '19', 'pagesizelist-1': '10' } });
    const { container } = renderFn(getPaginationFn(), { displayPager: true }, ctx);
    const params = linkParams(pageItems(container)[1].querySelector('a'));
    expect(params.get('q')).toBe('a b&c');
    expect(params.getAll('beginlist-1')).toEqual(['0']);
  });

  // ── Advanced settings ──────────────────────────────────────────────────────

  test('advancedPagination pageSize → number of pages and page size handed to the list', () => {
    const ctx = makePaginationCtx(makeList(25), {}, ['bootstrap5mix:advancedPagination']);
    const { container } = renderFn(getPaginationFn(), { displayPager: true, pageSize: 5 }, ctx);
    expect(pageItems(container).length).toBe(7);
    expect(ctx.renderContext.getRequest().getAttribute('bootstrap5.pager.pagesize.list-1')).toBe('5');
  });

  test('pageSize is ignored without the advancedPagination mixin (default 10)', () => {
    const ctx = makePaginationCtx(makeList(25));
    const { container } = renderFn(getPaginationFn(), { displayPager: true, pageSize: 5 }, ctx);
    expect(pageItems(container).length).toBe(5);
  });

  test('edit mode → nbOfPagesInEdit items per page, so editors see the whole list', () => {
    const ctx = makePaginationCtx(makeList(25), { _editMode: true }, ['bootstrap5mix:advancedPagination']);
    const { container } = renderFn(getPaginationFn(), { displayPager: true, pageSize: 5, nbOfPagesInEdit: 100 }, ctx);
    expect(pageItems(container).length).toBe(3);
  });

  test('pagesize URL parameter wins over the configured page size', () => {
    const ctx = makePaginationCtx(makeList(25), { _params: { 'pagesizelist-1': '20' } }, ['bootstrap5mix:advancedPagination']);
    const { container } = renderFn(getPaginationFn(), { displayPager: true, pageSize: 5 }, ctx);
    expect(pageItems(container).length).toBe(4);
  });

  test('huge pagesize URL parameter is capped to 100', () => {
    const ctx = makePaginationCtx(makeList(500), { _params: { 'pagesizelist-1': '1000000' } });
    renderFn(getPaginationFn(), { displayPager: true }, ctx);
    expect(ctx.renderContext.getRequest().getAttribute('bootstrap5.pager.pagesize.list-1')).toBe('100');
  });

  test('pagesize URL parameter equal to the cap is kept', () => {
    const ctx = makePaginationCtx(makeList(500), { _params: { 'pagesizelist-1': '100' } });
    renderFn(getPaginationFn(), { displayPager: true }, ctx);
    expect(ctx.renderContext.getRequest().getAttribute('bootstrap5.pager.pagesize.list-1')).toBe('100');
  });

  test('configured page size above the cap is honoured, and a request value up to it is accepted', () => {
    const nodeTypes = ['bootstrap5mix:advancedPagination'];
    const configured = makePaginationCtx(makeList(500), {}, nodeTypes);
    renderFn(getPaginationFn(), { displayPager: true, pageSize: 250 }, configured);
    expect(configured.renderContext.getRequest().getAttribute('bootstrap5.pager.pagesize.list-1')).toBe('250');

    const requested = makePaginationCtx(makeList(500), { _params: { 'pagesizelist-1': '200' } }, nodeTypes);
    renderFn(getPaginationFn(), { displayPager: true, pageSize: 250 }, requested);
    expect(requested.renderContext.getRequest().getAttribute('bootstrap5.pager.pagesize.list-1')).toBe('200');

    const tooBig = makePaginationCtx(makeList(500), { _params: { 'pagesizelist-1': '999999' } }, nodeTypes);
    renderFn(getPaginationFn(), { displayPager: true, pageSize: 250 }, tooBig);
    expect(tooBig.renderContext.getRequest().getAttribute('bootstrap5.pager.pagesize.list-1')).toBe('250');
  });

  test('src_itemsPerPage is capped to 100', () => {
    const ctx = makePaginationCtx(makeList(500), { _params: { src_itemsPerPage: '100000' } });
    renderFn(getPaginationFn(), { displayPager: true }, ctx);
    expect(ctx.renderContext.getRequest().getAttribute('bootstrap5.pager.pagesize.list-1')).toBe('100');
  });

  test('nbOfPages limits the page links shown', () => {
    const ctx = makePaginationCtx(makeList(100), { _params: { 'beginlist-1': '50', 'pagesizelist-1': '10' } }, ['bootstrap5mix:advancedPagination']);
    const { container } = renderFn(getPaginationFn(), { displayPager: true, pageSize: 10, nbOfPages: 3 }, ctx);
    const numbers = pageItems(container).slice(1, -1).map((li) => li.textContent);
    expect(numbers).toEqual(['4', '5', '6']);
  });

  test('layout and align classes; "default" and "justify-content-start" add nothing', () => {
    const ctx = makePaginationCtx(makeList(25), {}, ['bootstrap5mix:advancedPagination']);
    const withClasses = renderFn(getPaginationFn(), { displayPager: true, layout: 'pagination-lg', align: 'justify-content-center' }, ctx);
    expect(withClasses.container.querySelector('.pagination')).toHaveClass('pagination-lg', 'justify-content-center');
    const plain = renderFn(getPaginationFn(), { displayPager: true, layout: 'default', align: 'justify-content-start' }, ctx);
    expect(plain.container.querySelector('.pagination')?.className).toBe('pagination');
  });

  test('begin beyond the list → last page is current', () => {
    const ctx = makePaginationCtx(makeList(25), { _params: { 'beginlist-1': '500', 'pagesizelist-1': '10' } });
    const { container } = renderFn(getPaginationFn(), { displayPager: true }, ctx);
    expect(pageItems(container)[3]).toHaveClass('active');
  });
});
