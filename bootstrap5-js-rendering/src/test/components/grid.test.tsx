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

  test('createSection=true → wraps output in <section>', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:createSection'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('section')).toBeInTheDocument();
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
    const { container } = renderFn(fn, { sectionId: 'my-section' }, ctx);
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('id', 'my-section');
  });

  test('createSection + sectionCssClass → className on section', () => {
    const ctx = makeGridCtx({ _nodeTypes: ['bootstrap5mix:createSection'] });
    const fn = getGridFn();
    const { container } = renderFn(fn, { sectionCssClass: 'hero-section' }, ctx);
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
