import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeCtx, makeRenderContext, renderFn } from '../helpers';

import '../../components/Breadcrumb/default.server';

describe('bootstrap5nt:breadcrumb (default view)', () => {
  function getBreadcrumbFn() {
    return _getComponent('bootstrap5nt:breadcrumb', 'default');
  }

  test('single page node + live mode → renders null (no output)', () => {
    const pageNode = makeNode({ _id: 'page-1', _name: 'Home', _path: '/sites/test/home', _nodeTypes: ['jnt:page'] });
    const currentNode = makeNode({ _id: 'bc-1', _ancestors: [pageNode] });
    const mainNode = pageNode;
    const ctx = { currentNode, renderContext: makeRenderContext({ _editMode: false }), mainNode };
    _setContext(ctx);
    const fn = getBreadcrumbFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('ol')).not.toBeInTheDocument();
  });

  test('single page node + edit mode → shows placeholder', () => {
    const pageNode = makeNode({ _id: 'page-1', _name: 'Home', _path: '/sites/test/home', _nodeTypes: ['jnt:page'] });
    const currentNode = makeNode({ _id: 'bc-1', _ancestors: [pageNode] });
    const mainNode = pageNode;
    const ctx = { currentNode, renderContext: makeRenderContext({ _editMode: true }), mainNode };
    _setContext(ctx);
    const fn = getBreadcrumbFn();
    const { container } = renderFn(fn, {}, ctx);
    const ol = container.querySelector('ol.breadcrumb');
    expect(ol).toBeInTheDocument();
    expect(ol?.textContent).toContain('Breadcrumb too small');
  });

  test('two page nodes → renders ol.breadcrumb with items', () => {
    const page1 = makeNode({ _id: 'page-1', _name: 'Home', _path: '/sites/test/home', _nodeTypes: ['jnt:page'] });
    const page2 = makeNode({ _id: 'page-2', _name: 'About', _path: '/sites/test/home/about', _nodeTypes: ['jnt:page'] });
    const currentNode = makeNode({ _id: 'bc-2', _ancestors: [page1, page2] });
    const mainNode = page2;
    const ctx = { currentNode, renderContext: makeRenderContext(), mainNode };
    _setContext(ctx);
    const fn = getBreadcrumbFn();
    const { container } = renderFn(fn, {}, ctx);
    const ol = container.querySelector('ol.breadcrumb');
    expect(ol).toBeInTheDocument();
    const items = container.querySelectorAll('.breadcrumb-item');
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  test('current page item is aria-current="page" and has no link', () => {
    const page1 = makeNode({ _id: 'page-1', _name: 'Home', _path: '/sites/test/home', _nodeTypes: ['jnt:page'] });
    const page2 = makeNode({ _id: 'page-2', _name: 'About', _path: '/sites/test/about', _nodeTypes: ['jnt:page'] });
    const currentNode = makeNode({ _id: 'bc-3', _ancestors: [page1, page2] });
    const mainNode = page2;
    const ctx = { currentNode, renderContext: makeRenderContext(), mainNode };
    _setContext(ctx);
    const fn = getBreadcrumbFn();
    const { container } = renderFn(fn, {}, ctx);
    const activeItem = container.querySelector('.breadcrumb-item.active');
    expect(activeItem).toBeInTheDocument();
    expect(activeItem).toHaveAttribute('aria-current', 'page');
    expect(activeItem?.querySelector('a')).not.toBeInTheDocument();
  });

  test('ancestor page items have link to path.html', () => {
    const page1 = makeNode({ _id: 'page-1', _name: 'Home', _path: '/sites/test/home', _nodeTypes: ['jnt:page'] });
    const page2 = makeNode({ _id: 'page-2', _name: 'About', _path: '/sites/test/about', _nodeTypes: ['jnt:page'] });
    const currentNode = makeNode({ _id: 'bc-4', _ancestors: [page1, page2] });
    const mainNode = page2;
    const ctx = { currentNode, renderContext: makeRenderContext(), mainNode };
    _setContext(ctx);
    const fn = getBreadcrumbFn();
    const { container } = renderFn(fn, {}, ctx);
    const links = container.querySelectorAll('.breadcrumb-item:not(.active) a');
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href', '/sites/test/home.html');
  });

  test('non-page ancestor → href="#"', () => {
    const navText = makeNode({ _id: 'nav-1', _name: 'Nav Text', _path: '/sites/test/nav', _nodeTypes: ['jmix:navMenuItem'] });
    const page2 = makeNode({ _id: 'page-2', _name: 'About', _path: '/sites/test/about', _nodeTypes: ['jnt:page'] });
    const currentNode = makeNode({ _id: 'bc-5', _ancestors: [navText, page2] });
    const mainNode = page2;
    const ctx = { currentNode, renderContext: makeRenderContext(), mainNode };
    _setContext(ctx);
    const fn = getBreadcrumbFn();
    const { container } = renderFn(fn, {}, ctx);
    // navText is jmix:navMenuItem but not jnt:page; link should be #
    const nonPageLinks = container.querySelectorAll('.breadcrumb-item:not(.active) a[href="#"]');
    expect(nonPageLinks.length).toBeGreaterThan(0);
  });

  test('mainNode not a page → appended item, long names truncated', () => {
    const page1 = makeNode({ _id: 'page-1', _name: 'Home', _path: '/sites/test/home', _nodeTypes: ['jnt:page'] });
    const page2 = makeNode({ _id: 'page-2', _name: 'About', _path: '/sites/test/about', _nodeTypes: ['jnt:page'] });
    const mainNode = makeNode({
      _id: 'main-1',
      _name: 'This Is A Very Long Resource Name That Should Be Truncated',
      _path: '/sites/test/about/content/my-resource',
      _nodeTypes: [],
    });
    const currentNode = makeNode({ _id: 'bc-6', _ancestors: [page1, page2] });
    const ctx = { currentNode, renderContext: makeRenderContext(), mainNode };
    _setContext(ctx);
    const fn = getBreadcrumbFn();
    const { container } = renderFn(fn, {}, ctx);
    // Should have at least 3 items (page1, page2, mainNode)
    const items = container.querySelectorAll('.breadcrumb-item');
    expect(items.length).toBeGreaterThanOrEqual(3);
    // The last item should be truncated (≤15 + "...")
    const lastItem = items[items.length - 1];
    const text = lastItem.textContent ?? '';
    expect(text).toContain('...');
    expect(text.length).toBeLessThan('This Is A Very Long Resource Name That Should Be Truncated'.length);
  });

  test('advancedBreadcrumb cssClass → appended to breadcrumb class', () => {
    const page1 = makeNode({ _id: 'page-1', _name: 'Home', _path: '/sites/test/home', _nodeTypes: ['jnt:page'] });
    const page2 = makeNode({ _id: 'page-2', _name: 'About', _path: '/sites/test/about', _nodeTypes: ['jnt:page'] });
    const currentNode = makeNode({
      _id: 'bc-7',
      _ancestors: [page1, page2],
      _nodeTypes: ['bootstrap5mix:advancedBreadcrumb'],
      _properties: { cssClass: 'my-custom-class' },
    });
    const mainNode = page2;
    const ctx = { currentNode, renderContext: makeRenderContext(), mainNode };
    _setContext(ctx);
    const fn = getBreadcrumbFn();
    const { container } = renderFn(fn, {}, ctx);
    const ol = container.querySelector('ol');
    expect(ol?.className).toContain('my-custom-class');
  });
});
