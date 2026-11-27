import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeRenderContext, renderFn } from '../helpers';

import '../../components/Grid/default.server';

describe('bootstrap5nt:grid (default view)', () => {
  function getGridFn() {
    return _getComponent('bootstrap5nt:grid', 'default');
  }

  function makeGridCtx(nodeOverrides: any = {}, rcOverrides: any = {}) {
    const ctx = {
      currentNode: makeNode({ _id: 'grid-1', _nodeName: 'grid-node', _path: '/sites/test/home/grid', ...nodeOverrides }),
      renderContext: makeRenderContext(rcOverrides),
      mainNode: makeNode({ _id: 'grid-1' }),
    };
    _setContext(ctx);
    return ctx;
  }

  // ── predefinedGrid ─────────────────────────────────────────────────────────

  test('predefinedGrid "12" → 1 col="col" area name "main"', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:predefinedGrid'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { grid: '12' }, ctx);
    const col = container.querySelector('.col');
    expect(col).toBeInTheDocument();
    const area = col?.querySelector('[data-testid="area"]');
    expect(area).toHaveAttribute('data-area-name', 'main');
  });

  test('predefinedGrid "6_6" → 2 cols both "col-md-6"', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:predefinedGrid'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { grid: '6_6' }, ctx);
    const cols = container.querySelectorAll('.col-md-6');
    expect(cols.length).toBe(2);
  });

  test('predefinedGrid "6_6" → areas "main" and "side"', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:predefinedGrid'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { grid: '6_6' }, ctx);
    const areas = container.querySelectorAll('[data-testid="area"]');
    const areaNames = Array.from(areas).map(a => a.getAttribute('data-area-name'));
    expect(areaNames).toContain('main');
    expect(areaNames).toContain('side');
  });

  // ── Where the column content is stored (2.x areaAsSubNode lookup) ──────────

  const areaParents = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('[data-testid="area"]')).map(a => a.getAttribute('data-area-parent'));
  const areaReadOnly = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('[data-testid="area"]')).map(a => a.getAttribute('data-read-only'));

  test('grid on the page displayed → columns stored under the grid, editable', () => {
    const ctx = {
      currentNode: makeNode({ _id: 'grid-1', _path: '/sites/test/home/page/pagecontent/grid', _nodeTypes: ['bootstrap5mix:predefinedGrid'] }),
      renderContext: makeRenderContext({ _site: makeNode({ _path: '/sites/test' }) }),
      mainNode: makeNode({ _id: 'page', _path: '/sites/test/home/page' }),
    };
    _setContext(ctx);
    const { container } = renderFn(getGridFn(), { grid: '6_6' }, ctx);
    expect(areaParents(container)).toEqual(['grid-1', 'grid-1']);
    expect(areaReadOnly(container)).toEqual(['false', 'false']);
  });

  test('grid in a page template → each page holds its own column content, editable on the page', () => {
    const ctx = {
      currentNode: makeNode({ _id: 'tpl-grid', _path: '/modules/my-templates/1.0.0/templates/base/with-grid/pagecontent/grid', _nodeTypes: ['bootstrap5mix:predefinedGrid'] }),
      renderContext: makeRenderContext({ _site: makeNode({ _path: '/sites/test' }) }),
      mainNode: makeNode({ _id: 'page', _path: '/sites/test/home/page' }),
    };
    _setContext(ctx);
    const { container } = renderFn(getGridFn(), { grid: '4_8' }, ctx);
    expect(areaParents(container)).toEqual(['page', 'page']);
    expect(areaReadOnly(container)).toEqual(['false', 'false']);
  });

  test('grid in a page template with default content inside it → that content, read-only on pages', () => {
    const ctx = {
      currentNode: makeNode({
        _id: 'tpl-grid', _path: '/modules/my-templates/1.0.0/templates/base/with-grid/pagecontent/grid',
        _nodeName: 'tplgrid', _nodeTypes: ['bootstrap5mix:predefinedGrid'], _childNames: ['tplgrid-main'],
      }),
      renderContext: makeRenderContext({ _site: makeNode({ _path: '/sites/test' }) }),
      mainNode: makeNode({ _id: 'page', _path: '/sites/test/home/page' }),
    };
    _setContext(ctx);
    const { container } = renderFn(getGridFn(), { grid: '4_8' }, ctx);
    // In a template the area names are prefixed with the grid name (2.x): tplgrid-side, tplgrid-main.
    // "side" has no default content (per page), "main" has (template)
    expect(Array.from(container.querySelectorAll('[data-testid="area"]')).map(a => a.getAttribute('data-area-name')))
      .toEqual(['tplgrid-side', 'tplgrid-main']);
    expect(areaParents(container)).toEqual(['page', 'tpl-grid']);
    expect(areaReadOnly(container)).toEqual(['false', 'true']);
  });

  test('grid shared from another page (absolute area of the template) → stays under the grid, read-only', () => {
    const ctx = {
      currentNode: makeNode({ _id: 'header-grid', _path: '/sites/test/home/header/grid', _nodeTypes: ['bootstrap5mix:predefinedGrid'] }),
      renderContext: makeRenderContext({ _site: makeNode({ _path: '/sites/test' }) }),
      mainNode: makeNode({ _id: 'page', _path: '/sites/test/home/page' }),
    };
    _setContext(ctx);
    const { container } = renderFn(getGridFn(), { grid: '12' }, ctx);
    expect(areaParents(container)).toEqual(['header-grid']);
    expect(areaReadOnly(container)).toEqual(['true']);
  });

  // Area names hold the content of existing sites: 2.x compared the spans as strings
  test.each([
    ['2_10', ['main', 'side']],
    ['10_2', ['side', 'main']],
    ['3_9', ['side', 'main']],
    ['9_3', ['main', 'side']],
    ['4_8', ['side', 'main']],
    ['8_4', ['main', 'side']],
    ['6_6', ['main', 'side']],
    ['4_4_4', ['main', 'side', 'extra']],
    ['3_6_3', ['side', 'main', 'extra']],
    ['3_3_3_3', ['main', 'side', 'extra', 'extra2']],
    ['12', ['main']],
  ])('predefinedGrid "%s" → area names as 2.x', (grid, expected) => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:predefinedGrid'] });
    const { container } = renderFn(getGridFn(), { grid }, ctx);
    const names = Array.from(container.querySelectorAll('[data-testid="area"]')).map(a => a.getAttribute('data-area-name'));
    expect(names).toEqual(expected);
  });

  test('predefinedGrid "2_10" → classes col-md-2 then col-md-10', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:predefinedGrid'] });
    const { container } = renderFn(getGridFn(), { grid: '2_10' }, ctx);
    expect(container.querySelector('.col-md-2 [data-area-name="main"]')).toBeInTheDocument();
    expect(container.querySelector('.col-md-10 [data-area-name="side"]')).toBeInTheDocument();
  });

  // ── listLimit ──────────────────────────────────────────────────────────────

  test('listLimit mixin → the areas are limited to that number of items', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:listLimit'] });
    const { container } = renderFn(getGridFn(), { grid: '12', listLimit: '3' }, ctx);
    const limited = container.querySelector('[data-testid="area"]');
    // the editing limit, and the limit the list view applies when rendering
    expect(limited).toHaveAttribute('data-limit', '3');
    expect(limited).toHaveAttribute('data-render-limit', '3');
  });

  test('listLimit "-1" or no mixin → no limit', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:listLimit'] });
    const { container } = renderFn(getGridFn(), { grid: '12', listLimit: '-1' }, ctx);
    expect(container.querySelector('[data-testid="area"]')).not.toHaveAttribute('data-limit');
  });

  // ── createAbsoluteAreas ────────────────────────────────────────────────────

  function makeAbsoluteCtx(level: string, mainPath: string, rcOverrides: any = {}) {
    const home = makeNode({ _id: 'home', _path: '/sites/test/home' });
    const section = makeNode({ _id: 'section', _path: '/sites/test/home/section' });
    const ctx = {
      currentNode: makeNode({
        _id: 'grid-abs', _nodeName: 'grid-node', _path: '/sites/test/home/grid',
        _nodeTypes: ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createAbsoluteAreas'],
      }),
      renderContext: makeRenderContext(rcOverrides),
      mainNode: makeNode({ _id: 'main', _path: mainPath, _ancestorsByDepth: { 3: mainPath === '/sites/test/home' ? undefined : home, 4: section } }),
    };
    if (mainPath === '/sites/test/home') ctx.mainNode.getAncestor = () => ctx.mainNode;
    _setContext(ctx);
    return { ctx, level };
  }

  test('absolute areas level 0 → stored under the home page, read-only on the pages below', () => {
    const { ctx } = makeAbsoluteCtx('0', '/sites/test/home/section/page');
    const { container } = renderFn(getGridFn(), { grid: '4_8', level: '0' }, ctx);
    const areas = Array.from(container.querySelectorAll('[data-testid="area"]'));
    expect(areas.map(a => a.getAttribute('data-area-type'))).toEqual(['absolute', 'absolute']);
    expect(areas.map(a => a.getAttribute('data-area-parent'))).toEqual(['home', 'home']);
    expect(areas.map(a => a.getAttribute('data-area-name'))).toEqual(['side', 'main']);
    expect(areas.map(a => a.getAttribute('data-read-only'))).toEqual(['true', 'true']);
  });

  test('absolute areas level 0 on the home page itself → editable there', () => {
    const { ctx } = makeAbsoluteCtx('0', '/sites/test/home');
    const { container } = renderFn(getGridFn(), { grid: '12', level: '0' }, ctx);
    const area = container.querySelector('[data-testid="area"]');
    expect(area).toHaveAttribute('data-area-parent', 'main');
    expect(area).toHaveAttribute('data-read-only', 'false');
  });

  test('absolute areas level 1 → stored under the level-1 ancestor', () => {
    const { ctx } = makeAbsoluteCtx('1', '/sites/test/home/section/page');
    const { container } = renderFn(getGridFn(), { grid: '12', level: '1' }, ctx);
    expect(container.querySelector('[data-testid="area"]')).toHaveAttribute('data-area-parent', 'section');
  });

  test('absolute areas above the page displayed → nothing rendered (2.x)', () => {
    const { ctx } = makeAbsoluteCtx('3', '/sites/test/home/section');
    const { container } = renderFn(getGridFn(), { grid: '12', level: '3' }, ctx);
    expect(container.querySelector('[data-testid="area"]')).not.toBeInTheDocument();
  });

  test('absolute areas + listLimit → limit passed to the area', () => {
    const { ctx } = makeAbsoluteCtx('0', '/sites/test/home/section/page');
    ctx.currentNode.isNodeType = (t: string) => ['bootstrap5mix:predefinedGrid', 'bootstrap5mix:createAbsoluteAreas', 'bootstrap5mix:listLimit'].includes(t);
    const { container } = renderFn(getGridFn(), { grid: '12', level: '0', listLimit: '5' }, ctx);
    expect(container.querySelector('[data-testid="area"]')).toHaveAttribute('data-limit', '5');
    expect(container.querySelector('[data-testid="area"]')).toHaveAttribute('data-render-limit', '5');
  });

  test('predefinedGrid "4_8" → smaller first → areas "side","main"', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:predefinedGrid'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { grid: '4_8' }, ctx);
    const areas = container.querySelectorAll('[data-testid="area"]');
    const areaNames = Array.from(areas).map(a => a.getAttribute('data-area-name'));
    expect(areaNames[0]).toBe('side');
    expect(areaNames[1]).toBe('main');
  });

  test('predefinedGrid "8_4" → larger first → areas "main","side"', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:predefinedGrid'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { grid: '8_4' }, ctx);
    const areas = container.querySelectorAll('[data-testid="area"]');
    const areaNames = Array.from(areas).map(a => a.getAttribute('data-area-name'));
    expect(areaNames[0]).toBe('main');
    expect(areaNames[1]).toBe('side');
  });

  test('predefinedGrid "4_4_4" → 3 areas', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:predefinedGrid'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { grid: '4_4_4' }, ctx);
    const areas = container.querySelectorAll('[data-testid="area"]');
    expect(areas.length).toBe(3);
    const areaNames = Array.from(areas).map(a => a.getAttribute('data-area-name'));
    expect(areaNames).toContain('extra');
  });

  test('predefinedGrid "3_3_3_3" → 4 areas with extra2', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:predefinedGrid'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { grid: '3_3_3_3' }, ctx);
    const areas = container.querySelectorAll('[data-testid="area"]');
    expect(areas.length).toBe(4);
    const areaNames = Array.from(areas).map(a => a.getAttribute('data-area-name'));
    expect(areaNames).toContain('extra2');
  });

  test('predefinedGrid invalid (too many parts) + edit mode → warning alert', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:predefinedGrid'] }, { _editMode: true });
    const fn = getGridFn();
    const { container } = renderFn(fn, { grid: '2_2_2_2_2' }, ctx);
    expect(container.querySelector('.alert-warning')).toBeInTheDocument();
  });

  // ── customGrid ─────────────────────────────────────────────────────────────

  test('customGrid "col-md-6, col-md-6" → 2 divs with those classes', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:customGrid'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { gridClasses: 'col-md-6, col-md-6' }, ctx);
    const cols = container.querySelectorAll('.col-md-6');
    expect(cols.length).toBe(2);
  });

  test('customGrid → area names are col0, col1', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:customGrid'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { gridClasses: 'col-md-4, col-md-8' }, ctx);
    const areas = container.querySelectorAll('[data-testid="area"]');
    const names = Array.from(areas).map(a => a.getAttribute('data-area-name'));
    expect(names).toContain('col0');
    expect(names).toContain('col1');
  });

  test('customGrid empty + edit mode → warning alert', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:customGrid'] }, { _editMode: true });
    const fn = getGridFn();
    const { container } = renderFn(fn, { gridClasses: '' }, ctx);
    expect(container.querySelector('.alert-warning')).toBeInTheDocument();
  });

  // ── nogrid ─────────────────────────────────────────────────────────────────

  test('nogrid → single Area name="main"', () => {
    const ctx = makeGridCtx({});
    const fn = getGridFn();
    const { container } = renderFn(fn, {}, ctx);
    const areas = container.querySelectorAll('[data-testid="area"]');
    expect(areas.length).toBe(1);
    expect(areas[0]).toHaveAttribute('data-area-name', 'main');
  });

  // ── createSection ──────────────────────────────────────────────────────────

  test('createSection + sectionElement="section" → wraps output in <section>', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:createSection'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { sectionElement: 'section' }, ctx);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  test('createSection + sectionElement outside the choicelist → <div> (tag name allow-list, 2.x)', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:createSection'] });
    const { container } = renderFn(getGridFn(), { sectionElement: 'script', sectionId: 'x' }, ctx);
    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect(container.querySelector('div#x')).toBeInTheDocument();
  });

  test('createSection + sectionStyle → style attribute (CSS string turned into an object)', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:createSection'] });
    const { container } = renderFn(getGridFn(), { sectionElement: 'section', sectionStyle: 'background-color: red; padding-top: 2rem' }, ctx);
    const section = container.querySelector('section') as HTMLElement;
    expect(section.style.backgroundColor).toBe('red');
    expect(section.style.paddingTop).toBe('2rem');
  });

  test('createSection + sectionElement="div" → <div> wrapper', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:createSection'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { sectionElement: 'div' }, ctx);
    // No <section> should be present; outermost should be a div
    const section = container.querySelector('section');
    expect(section).not.toBeInTheDocument();
  });

  test('createSection + sectionId → id attribute on section', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:createSection'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { sectionElement: 'section', sectionId: 'my-section' }, ctx);
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('id', 'my-section');
  });

  test('createSection + sectionCssClass → className on section', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:createSection'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { sectionElement: 'section', sectionCssClass: 'hero-section' }, ctx);
    const section = container.querySelector('section');
    expect(section).toHaveClass('hero-section');
  });

  // ── createContainer ────────────────────────────────────────────────────────

  test('createContainer=true → .container div wrapping', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:createContainer'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.container')).toBeInTheDocument();
  });

  test('containerType="container-fluid" → .container-fluid', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:createContainer'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { containerType: 'container-fluid' }, ctx);
    expect(container.querySelector('.container-fluid')).toBeInTheDocument();
  });

  // ── createRow ──────────────────────────────────────────────────────────────

  test('createRow=true → .row div', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:createRow'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.row')).toBeInTheDocument();
  });

  test('createRow + rowVerticalAlignment="align-items-center" → class on row div', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:createRow'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { rowVerticalAlignment: 'align-items-center' }, ctx);
    const row = container.querySelector('.row');
    expect(row?.className).toContain('align-items-center');
  });

  test('createRow + rowHorizontalAlignment="justify-content-center" → class on row', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:createRow'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { rowHorizontalAlignment: 'justify-content-center' }, ctx);
    const row = container.querySelector('.row');
    expect(row?.className).toContain('justify-content-center');
  });

  test('createRow + rowVerticalAlignment="default" → omitted from row class', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:createRow'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { rowVerticalAlignment: 'default' }, ctx);
    const row = container.querySelector('.row');
    expect(row?.className).not.toContain('default');
  });

  // ── colNamePrefix ──────────────────────────────────────────────────────────

  test('/modules path → colNamePrefix with node name', () => {
    const ctx = {
      currentNode: makeNode({
        _id: 'grid-mod',
        _nodeName: 'my-grid',
        _path: '/modules/mymodule/templates/grid',
        _nodeTypes: ['bootstrap5mix:predefinedGrid'],
      }),
      renderContext: makeRenderContext(),
      mainNode: makeNode({ _id: 'grid-mod' }),
    };
    _setContext(ctx);
    const fn = getGridFn();
    const { container } = renderFn(fn, { grid: '12' }, ctx);
    const area = container.querySelector('[data-testid="area"]');
    expect(area?.getAttribute('data-area-name')).toBe('my-grid-main');
  });

  test('studiomode → colNamePrefix with node name', () => {
    const ctx = {
      currentNode: makeNode({
        _id: 'grid-studio',
        _nodeName: 'studio-grid',
        _path: '/sites/test/home/grid',
        _nodeTypes: ['bootstrap5mix:predefinedGrid'],
      }),
      renderContext: makeRenderContext({ _editModeConfig: 'studiomode' }),
      mainNode: makeNode({ _id: 'grid-studio' }),
    };
    _setContext(ctx);
    const fn = getGridFn();
    const { container } = renderFn(fn, { grid: '12' }, ctx);
    const area = container.querySelector('[data-testid="area"]');
    expect(area?.getAttribute('data-area-name')).toBe('studio-grid-main');
  });
});
