import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeCtx, makeRenderContext, renderFn } from '../helpers';
import { getSiteColorMode } from '../../../../shared/color-mode';

import '../../components/Button/default.server';
import '../../components/ButtonGroup/default.server';
import '../../components/Progress/default.server';
import '../../components/Navbar/default.server';

const makeButton = (id: string, buttonType: string) =>
  makeNode({ _id: id, _nodeTypes: ['bootstrap5nt:button'], _properties: { buttonType } });

describe('bootstrap5nt:buttonGroup (default view)', () => {
  const getFn = () => _getComponent('bootstrap5nt:buttonGroup', 'default');

  function render(props: any, children: any[], rcOverrides: any = {}) {
    const ctx = makeCtx({ _id: 'group-1', _children: children }, rcOverrides);
    _setContext(ctx);
    return renderFn(getFn(), props, ctx);
  }

  test('renders its buttons, in order, inside .btn-group', () => {
    const { container } = render({}, [makeButton('b1', 'externalLink'), makeNode({ _id: 'x' }), makeButton('b2', 'modal')]);
    const rendered = Array.from(container.querySelectorAll('.btn-group > [data-testid="render-node"]'));
    expect(rendered.map((n) => n.getAttribute('data-node-id'))).toEqual(['b1', 'b2']);
  });

  test('named group → role="group" with that name', () => {
    const { container } = render({ 'jcr:title': 'Share' }, [makeButton('b1', 'externalLink')]);
    const group = container.querySelector('.btn-group');
    expect(group).toHaveAttribute('role', 'group');
    expect(group).toHaveAttribute('aria-label', 'Share');
  });

  test('unnamed group → still a group, with a translated default name; never a toolbar', () => {
    const { container } = render({ 'jcr:title': '  ' }, [makeButton('b1', 'externalLink')]);
    const group = container.querySelector('.btn-group');
    expect(group).toHaveAttribute('role', 'group');
    expect(group).toHaveAttribute('aria-label', 'bootstrap5nt_buttonGroup.label.default');
    expect(container.querySelector('[role="toolbar"]')).not.toBeInTheDocument();
  });

  test('vertical and size classes', () => {
    const { container } = render({ vertical: true, size: 'btn-group-sm' }, []);
    expect(container.querySelector('.btn-group-vertical')).toHaveClass('btn-group-sm');
    expect(container.querySelector('.btn-group')).not.toBeInTheDocument();
  });

  test('default size adds no class', () => {
    const { container } = render({ size: 'default' }, []);
    expect(container.querySelector('.btn-group')?.className).toBe('btn-group');
  });

  test('panels of modal / collapse / offcanvas buttons are rendered after the group, not inside', () => {
    const { container } = render({}, [makeButton('m', 'modal'), makeButton('l', 'externalLink'), makeButton('o', 'Offcanvas')]);
    const panels = Array.from(container.querySelectorAll('[data-testid="render-node"][data-view="hidden.panel"]'));
    expect(panels.map((n) => n.getAttribute('data-node-id'))).toEqual(['m', 'o']);
    panels.forEach((panel) => expect(panel.closest('.btn-group')).toBeNull());
  });

  test('edit mode → button to add a button; live → none', () => {
    expect(render({}, [], { _editMode: true }).container.querySelector('[data-testid="add-content-buttons"]'))
      .toHaveAttribute('data-node-types', 'bootstrap5nt:button');
    expect(render({}, []).container.querySelector('[data-testid="add-content-buttons"]')).not.toBeInTheDocument();
  });
});

describe('bootstrap5nt:button inside a group, and its panel view', () => {
  const modalProps = { buttonType: 'modal', 'jcr:title': 'Open', modalTitle: 'Title' };

  function ctxIn(parentTypes: string[]) {
    const ctx = makeCtx({ _id: 'btn-g', _parent: makeNode({ _id: 'parent', _nodeTypes: parentTypes }) });
    _setContext(ctx);
    return ctx;
  }

  test('on its own → trigger and panel', () => {
    const ctx = ctxIn([]);
    const { container } = renderFn(_getComponent('bootstrap5nt:button', 'default'), modalProps, ctx);
    expect(container.querySelector('[data-bs-toggle="modal"]')).toBeInTheDocument();
    expect(container.querySelector('.modal')).toBeInTheDocument();
  });

  test('inside a button group → trigger only', () => {
    const ctx = ctxIn(['bootstrap5nt:buttonGroup']);
    const { container } = renderFn(_getComponent('bootstrap5nt:button', 'default'), modalProps, ctx);
    expect(container.querySelector('[data-bs-toggle="modal"]')).toBeInTheDocument();
    expect(container.querySelector('.modal')).not.toBeInTheDocument();
  });

  test('panel view → panel only, tied to the same trigger id', () => {
    const ctx = ctxIn(['bootstrap5nt:buttonGroup']);
    const { container } = renderFn(_getComponent('bootstrap5nt:button', 'hidden.panel'), modalProps, ctx);
    expect(container.querySelector('[data-bs-toggle="modal"]')).not.toBeInTheDocument();
    expect(container.querySelector('.modal')).toHaveAttribute('id', 'modal-btn-g');
  });

  test('panel view of a link button → nothing', () => {
    const ctx = ctxIn(['bootstrap5nt:buttonGroup']);
    const { container } = renderFn(_getComponent('bootstrap5nt:button', 'hidden.panel'),
      { buttonType: 'externalLink', externalLink: 'https://example.com' }, ctx);
    expect(container.querySelector('a, button, .modal')).not.toBeInTheDocument();
  });
});

describe('bootstrap5nt:button tooltip', () => {
  const getFn = () => _getComponent('bootstrap5nt:button', 'default');
  function render(props: any) {
    const ctx = makeCtx({ _id: 'btn-t' });
    _setContext(ctx);
    return renderFn(getFn(), props, ctx);
  }

  test('tooltip text → data-bs-title, never title; placement kept', () => {
    const { container } = render({ buttonType: 'externalLink', externalLink: 'https://example.com', 'jcr:title': 'Docs', tooltip: 'Opens the documentation', tooltipPlacement: 'bottom' });
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('data-b5-tooltip', 'true');
    expect(link).toHaveAttribute('data-bs-title', 'Opens the documentation');
    expect(link).toHaveAttribute('data-b5-tooltip-placement', 'bottom');
    expect(link).not.toHaveAttribute('title');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  test('tooltip on a modal trigger keeps data-bs-toggle="modal"', () => {
    const { container } = render({ buttonType: 'modal', 'jcr:title': 'Open', tooltip: 'More' });
    const trigger = container.querySelector('[data-bs-toggle="modal"]');
    expect(trigger).toHaveAttribute('data-bs-title', 'More');
  });

  test('no tooltip text → no tooltip attribute', () => {
    const { container } = render({ buttonType: 'externalLink', externalLink: 'https://example.com', tooltip: '  ' });
    expect(container.querySelector('[data-b5-tooltip]')).not.toBeInTheDocument();
  });

  test('popover and disabled buttons get no tooltip', () => {
    expect(render({ buttonType: 'popover', tooltip: 'x' }).container.querySelector('[data-b5-tooltip]')).not.toBeInTheDocument();
    expect(render({ buttonType: 'collapse', state: 'disabled', tooltip: 'x' }).container.querySelector('[data-b5-tooltip]')).not.toBeInTheDocument();
  });

  test('active state → no aria-pressed (not allowed on links, not a toggle)', () => {
    const { container } = render({ buttonType: 'externalLink', externalLink: 'https://example.com', state: 'active' });
    expect(container.querySelector('[aria-pressed]')).not.toBeInTheDocument();
  });
});

describe('bootstrap5nt:progress (default view)', () => {
  const getFn = () => _getComponent('bootstrap5nt:progress', 'default');
  function render(props: any) {
    const ctx = makeCtx({ _id: 'progress-1' });
    _setContext(ctx);
    const { container } = renderFn(getFn(), props, ctx);
    return { wrapper: container.querySelector('.progress') as HTMLElement, bar: container.querySelector('.progress-bar') as HTMLElement };
  }

  test('role, name and values are on the wrapper, not on the bar', () => {
    const { wrapper, bar } = render({ label: 'Funds raised', value: 40, max: 100 });
    expect(wrapper).toHaveAttribute('role', 'progressbar');
    expect(wrapper).toHaveAttribute('aria-label', 'Funds raised');
    expect(wrapper).toHaveAttribute('aria-valuenow', '40');
    expect(wrapper).toHaveAttribute('aria-valuemin', '0');
    expect(wrapper).toHaveAttribute('aria-valuemax', '100');
    expect(bar).not.toHaveAttribute('role');
    expect(bar.style.width).toBe('40%');
  });

  test('no label → translated default name', () => {
    expect(render({ value: 10 }).wrapper).toHaveAttribute('aria-label', 'bootstrap5nt_progress.label.default');
  });

  test('max other than 100 → percentage width and aria-valuetext', () => {
    const { wrapper, bar } = render({ value: 3, max: 12 });
    expect(bar.style.width).toBe('25%');
    expect(wrapper).toHaveAttribute('aria-valuenow', '3');
    expect(wrapper).toHaveAttribute('aria-valuemax', '12');
    expect(wrapper).toHaveAttribute('aria-valuetext', '25%');
  });

  test('values are clamped: above max, below zero, invalid max', () => {
    expect(render({ value: 250, max: 100 }).bar.style.width).toBe('100%');
    expect(render({ value: -5, max: 100 }).bar.style.width).toBe('0%');
    expect(render({ value: 50, max: 0 }).wrapper).toHaveAttribute('aria-valuemax', '100');
  });

  test('colour uses text-bg-* (contrasting text); unknown colour ignored', () => {
    expect(render({ value: 10, color: 'warning' }).bar).toHaveClass('text-bg-warning');
    expect(render({ value: 10, color: 'default' }).bar.className).toBe('progress-bar');
    expect(render({ value: 10, color: 'x" onload="y' }).bar.className).toBe('progress-bar');
  });

  test('striped, never animated; percentage shown on request', () => {
    const { bar } = render({ value: 30, striped: true, showValue: true });
    expect(bar).toHaveClass('progress-bar-striped');
    expect(bar).not.toHaveClass('progress-bar-animated');
    expect(bar.textContent).toBe('30%');
    expect(render({ value: 30 }).bar.textContent).toBe('');
  });
});

describe('colour mode', () => {
  const site = (mode?: string) => makeNode({
    _nodeTypes: mode ? ['bootstrap5mix:siteColorMode'] : [],
    _properties: mode ? { colorMode: mode } : {},
  });

  test('getSiteColorMode: site setting, light by default or when invalid', () => {
    expect(getSiteColorMode(site('dark'))).toBe('dark');
    expect(getSiteColorMode(site('auto'))).toBe('auto');
    expect(getSiteColorMode(site('light'))).toBe('light');
    expect(getSiteColorMode(site('pink'))).toBe('light');
    expect(getSiteColorMode(site())).toBe('light');
    expect(getSiteColorMode(null)).toBe('light');
  });

  function renderNavbar(properties: Record<string, string>, siteMode?: string) {
    const siteNode: any = site(siteMode);
    siteNode.getHome = () => makeNode({ _id: 'home', _path: '/sites/test/home' });
    siteNode.getLanguages = () => ['en'];
    siteNode.getActiveLiveLanguages = () => ['en'];
    siteNode.getLanguagesAsLocales = () => [];
    siteNode.isMixLanguagesActive = () => false;
    siteNode.getSiteKey = () => 'test';
    const ctx = {
      currentNode: makeNode({ _id: 'nav-cm', _nodeName: 'nav', _nodeTypes: ['bootstrap5mix:navbarGlobalSettings'], _properties: properties }),
      renderContext: makeRenderContext({ _site: siteNode }),
      mainNode: makeNode({ _id: 'page', _path: '/sites/test/home' }),
    };
    _setContext(ctx);
    return renderFn(_getComponent('bootstrap5nt:navbar', 'default'), {}, ctx).container;
  }

  test('switcher off by default', () => {
    expect(renderNavbar({}).querySelector('.color-mode-nav')).not.toBeInTheDocument();
  });

  test('switcher: a real button toggle named "title: current", three buttons with aria-pressed', () => {
    const container = renderNavbar({ addColorModeButton: 'true' }, 'dark');
    const toggle = container.querySelector('.color-mode-nav [data-bs-toggle="dropdown"]');
    expect(toggle?.tagName).toBe('BUTTON');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle?.textContent).toBe('bootstrap5nt_navbar.colorMode: bootstrap5nt_navbar.colorMode.dark');
    expect(toggle?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');

    const options = Array.from(container.querySelectorAll('.color-mode-nav [data-bs-theme-value]'));
    expect(options.map((o) => o.getAttribute('data-bs-theme-value'))).toEqual(['light', 'dark', 'auto']);
    expect(options.map((o) => o.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
    options.forEach((o) => expect(o.tagName).toBe('BUTTON'));
    // No menu roles: the options are plain buttons
    expect(container.querySelector('.color-mode-nav [role="menu"], .color-mode-nav [role="menuitem"]')).not.toBeInTheDocument();
    // The current choice does not rely on colour alone: a check mark, hidden for the others
    const checks = options.map((o) => (o.querySelector('[data-b5-color-mode-check]') as HTMLElement).hidden);
    expect(checks).toEqual([true, false, true]);
  });
});
