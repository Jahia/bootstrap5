import { screen } from '@testing-library/react';
import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeCtx, makeRenderContext, renderFn } from '../helpers';

import '../../components/Button/default.server';

// We need to re-export buildButtonClass for testing it. Since it's private,
// we test it indirectly through the rendered output of the component.

describe('bootstrap5nt:button — buildButtonClass via rendered output', () => {
  function getButtonFn() {
    return _getComponent('bootstrap5nt:button', 'default');
  }

  function makeButtonCtx(rcOverrides: any = {}) {
    const ctx = makeCtx({ _id: 'btn-1' }, rcOverrides);
    _setContext(ctx);
    return ctx;
  }

  // Helper: renders internalLink with a link node to get the <a> className
  function renderInternalLink(props: any, rcOverrides: any = {}) {
    const ctx = makeButtonCtx(rcOverrides);
    const linkNode = makeNode({ _id: 'link-node', _name: 'Link Page', _url: '/test/page' });
    const fn = getButtonFn();
    return renderFn(fn, { buttonType: 'internalLink', internalLink: linkNode, ...props }, ctx);
  }

  test('style="primary" outline=false → "btn btn-primary"', () => {
    const { container } = renderInternalLink({ style: 'primary', outline: false });
    const a = container.querySelector('a');
    expect(a).toHaveClass('btn', 'btn-primary');
    expect(a?.className).not.toContain('btn-outline');
  });

  test('style="danger" outline=true → "btn btn-outline-danger"', () => {
    const { container } = renderInternalLink({ style: 'danger', outline: true });
    const a = container.querySelector('a');
    expect(a?.className).toContain('btn-outline-danger');
  });

  test('size="lg" → includes "lg" in class', () => {
    const { container } = renderInternalLink({ size: 'lg' });
    const a = container.querySelector('a');
    expect(a?.className).toContain('lg');
  });

  test('size="default" → no size class appended', () => {
    const { container } = renderInternalLink({ size: 'default' });
    const a = container.querySelector('a');
    expect(a?.className).not.toContain('default');
  });

  test('block=true → includes "btn-block"', () => {
    const { container } = renderInternalLink({ block: true });
    const a = container.querySelector('a');
    expect(a?.className).toContain('btn-block');
  });

  test('state="active" → includes "active"', () => {
    const { container } = renderInternalLink({ state: 'active' });
    const a = container.querySelector('a');
    expect(a?.className).toContain('active');
  });

  test('state="disabled" → includes "disabled"', () => {
    const { container } = renderInternalLink({ state: 'disabled' });
    const a = container.querySelector('a');
    expect(a?.className).toContain('disabled');
  });

  test('style="custom" cssClass="my-btn" → class is "my-btn"', () => {
    const { container } = renderInternalLink({ style: 'custom', cssClass: 'my-btn' });
    const a = container.querySelector('a');
    expect(a?.className).toBe('my-btn');
  });

  test('disableTextWrapping=true → "text-nowrap" in class', () => {
    const { container } = renderInternalLink({ disableTextWrapping: true });
    const a = container.querySelector('a');
    expect(a?.className).toContain('text-nowrap');
  });

  test('stretchedLink=true → "stretched-link" in class', () => {
    const { container } = renderInternalLink({ stretchedLink: true });
    const a = container.querySelector('a');
    expect(a?.className).toContain('stretched-link');
  });
});

describe('bootstrap5nt:button — internalLink type', () => {
  function getButtonFn() {
    return _getComponent('bootstrap5nt:button', 'default');
  }

  test('with linkNode → renders <a> with href from linkNode.getUrl()', () => {
    const ctx = makeCtx({ _id: 'btn-il-1' });
    _setContext(ctx);
    const linkNode = makeNode({ _url: '/sites/test/page' });
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'internalLink', internalLink: linkNode }, ctx);
    const a = container.querySelector('a');
    expect(a).toBeInTheDocument();
    expect(a).toHaveAttribute('href', '/sites/test/page');
  });

  test('with linkNode + jcr:title → label is jcr:title', () => {
    const ctx = makeCtx({ _id: 'btn-il-2' });
    _setContext(ctx);
    const linkNode = makeNode({ _url: '/page', _name: 'Page Name' });
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'internalLink', 'jcr:title': 'Custom Label', internalLink: linkNode }, ctx);
    expect(container.querySelector('a')?.textContent).toBe('Custom Label');
  });

  test('with linkNode + no title → label falls back to linkNode.getDisplayableName()', () => {
    const ctx = makeCtx({ _id: 'btn-il-3' });
    _setContext(ctx);
    const linkNode = makeNode({ _url: '/page', _name: 'Link Page Name' });
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'internalLink', internalLink: linkNode }, ctx);
    expect(container.querySelector('a')?.textContent).toBe('Link Page Name');
  });

  test('no linkNode + edit mode → warning badge', () => {
    const ctx = makeCtx({ _id: 'btn-il-4' }, { _editMode: true });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'internalLink' }, ctx);
    const badge = container.querySelector('.badge-warning');
    expect(badge).toBeInTheDocument();
  });

  test('no linkNode + live mode → null (no output)', () => {
    const ctx = makeCtx({ _id: 'btn-il-5' }, { _editMode: false });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'internalLink' }, ctx);
    expect(container.querySelector('a')).not.toBeInTheDocument();
    expect(container.querySelector('.badge')).not.toBeInTheDocument();
  });
});

describe('bootstrap5nt:button — externalLink type', () => {
  function getButtonFn() {
    return _getComponent('bootstrap5nt:button', 'default');
  }

  test('valid URL → renders <a href="..."> with label', () => {
    const ctx = makeCtx({ _id: 'btn-el-1' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'externalLink', externalLink: 'https://example.com', 'jcr:title': 'Visit' }, ctx);
    const a = container.querySelector('a');
    expect(a).toBeInTheDocument();
    expect(a).toHaveAttribute('href', 'https://example.com');
    expect(a?.textContent).toBe('Visit');
  });

  test('no URL + edit mode → warning badge', () => {
    const ctx = makeCtx({ _id: 'btn-el-2' }, { _editMode: true });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'externalLink', externalLink: '' }, ctx);
    expect(container.querySelector('.badge-warning')).toBeInTheDocument();
  });

  test('no URL + live mode → renders <a href=""> (not null)', () => {
    const ctx = makeCtx({ _id: 'btn-el-3' }, { _editMode: false });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'externalLink', externalLink: '' }, ctx);
    // externalLink '' is blank but not edit mode → should NOT show warning, should show <a>
    const a = container.querySelector('a');
    expect(a).toBeInTheDocument();
    expect(a).toHaveAttribute('href', '');
  });

  test('http:// as URL → treated as blank, edit mode → warning', () => {
    const ctx = makeCtx({ _id: 'btn-el-4' }, { _editMode: true });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'externalLink', externalLink: 'http://' }, ctx);
    expect(container.querySelector('.badge-warning')).toBeInTheDocument();
  });
});

describe('bootstrap5nt:button — modal type', () => {
  function getButtonFn() {
    return _getComponent('bootstrap5nt:button', 'default');
  }

  test('renders trigger button + modal div', () => {
    const ctx = makeCtx({ _id: 'btn-modal-1' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'modal' }, ctx);
    expect(container.querySelector('button[data-bs-toggle="modal"]')).toBeInTheDocument();
    expect(container.querySelector('.modal')).toBeInTheDocument();
  });

  test('trigger button has data-bs-toggle="modal"', () => {
    const ctx = makeCtx({ _id: 'btn-modal-2' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'modal' }, ctx);
    const btn = container.querySelector('button[data-bs-toggle="modal"]');
    expect(btn).toHaveAttribute('data-bs-target', '#modal-btn-modal-2');
  });

  test('modalTitle → renders modal header with h5', () => {
    const ctx = makeCtx({ _id: 'btn-modal-3' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'modal', modalTitle: 'My Modal Title' }, ctx);
    const header = container.querySelector('.modal-header');
    expect(header).toBeInTheDocument();
    expect(header?.textContent).toContain('My Modal Title');
  });

  test('no modalTitle → no modal header', () => {
    const ctx = makeCtx({ _id: 'btn-modal-4' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'modal' }, ctx);
    expect(container.querySelector('.modal-header')).not.toBeInTheDocument();
  });

  test('staticBackdrop=true → data-bs-backdrop="static" + data-bs-keyboard="false"', () => {
    const ctx = makeCtx({ _id: 'btn-modal-5' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'modal', staticBackdrop: true }, ctx);
    const modal = container.querySelector('.modal');
    expect(modal).toHaveAttribute('data-bs-backdrop', 'static');
    expect(modal).toHaveAttribute('data-bs-keyboard', 'false');
  });

  test('verticallyCentered=true → "modal-dialog-centered" class', () => {
    const ctx = makeCtx({ _id: 'btn-modal-6' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'modal', verticallyCentered: true }, ctx);
    const dialog = container.querySelector('.modal-dialog');
    expect(dialog).toHaveClass('modal-dialog-centered');
  });

  test('modalSize="lg" → "modal-lg" class on dialog', () => {
    const ctx = makeCtx({ _id: 'btn-modal-7' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'modal', modalSize: 'lg' }, ctx);
    const dialog = container.querySelector('.modal-dialog');
    expect(dialog?.className).toContain('modal-lg');
  });

  test('modalSize="default" → no modal-default class', () => {
    const ctx = makeCtx({ _id: 'btn-modal-8' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'modal', modalSize: 'default' }, ctx);
    const dialog = container.querySelector('.modal-dialog');
    expect(dialog?.className).not.toContain('modal-default');
  });
});

describe('bootstrap5nt:button — collapse type', () => {
  function getButtonFn() {
    return _getComponent('bootstrap5nt:button', 'default');
  }

  test('show=true → button/link has "show" class', () => {
    const ctx = makeCtx({ _id: 'btn-col-1' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'collapse', show: true }, ctx);
    const a = container.querySelector('a[data-bs-toggle="collapse"]');
    expect(a).toHaveClass('show');
  });

  test('show=false → no show class', () => {
    const ctx = makeCtx({ _id: 'btn-col-2' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'collapse', show: false }, ctx);
    const a = container.querySelector('a[data-bs-toggle="collapse"]');
    expect(a).not.toHaveClass('show');
  });

  test('data-bs-toggle="collapse" on link', () => {
    const ctx = makeCtx({ _id: 'btn-col-3' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'collapse' }, ctx);
    expect(container.querySelector('[data-bs-toggle="collapse"]')).toBeInTheDocument();
  });

  test('collapse div rendered', () => {
    const ctx = makeCtx({ _id: 'btn-col-4' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'collapse' }, ctx);
    expect(container.querySelector('.collapse')).toBeInTheDocument();
  });
});

describe('bootstrap5nt:button — popover type', () => {
  function getButtonFn() {
    return _getComponent('bootstrap5nt:button', 'default');
  }

  test('data-bs-toggle="popover" on button', () => {
    const ctx = makeCtx({ _id: 'btn-pop-1' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'popover' }, ctx);
    expect(container.querySelector('[data-bs-toggle="popover"]')).toBeInTheDocument();
  });

  test('popoverTitle set → title attribute', () => {
    const ctx = makeCtx({ _id: 'btn-pop-2' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'popover', popoverTitle: 'My Popover' }, ctx);
    const btn = container.querySelector('[data-bs-toggle="popover"]');
    expect(btn).toHaveAttribute('title', 'My Popover');
  });

  test('popoverContent set → data-bs-content attribute', () => {
    const ctx = makeCtx({ _id: 'btn-pop-3' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'popover', popoverContent: 'Some content' }, ctx);
    const btn = container.querySelector('[data-bs-toggle="popover"]');
    expect(btn).toHaveAttribute('data-bs-content', 'Some content');
  });

  test('direction="bottom" → data-bs-placement="bottom"', () => {
    const ctx = makeCtx({ _id: 'btn-pop-4' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'popover', direction: 'bottom' }, ctx);
    const btn = container.querySelector('[data-bs-toggle="popover"]');
    expect(btn).toHaveAttribute('data-bs-placement', 'bottom');
  });

  test('default direction → data-bs-placement="top"', () => {
    const ctx = makeCtx({ _id: 'btn-pop-5' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'popover' }, ctx);
    const btn = container.querySelector('[data-bs-toggle="popover"]');
    expect(btn).toHaveAttribute('data-bs-placement', 'top');
  });

  test('html=true → data-bs-html="true"', () => {
    const ctx = makeCtx({ _id: 'btn-pop-6' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'popover', html: true }, ctx);
    const btn = container.querySelector('[data-bs-toggle="popover"]');
    expect(btn).toHaveAttribute('data-bs-html', 'true');
  });

  test('always includes AddResources (init script)', () => {
    const ctx = makeCtx({ _id: 'btn-pop-7' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'popover' }, ctx);
    expect(container.querySelector('[data-testid="add-resources"]')).toBeInTheDocument();
  });
});

describe('bootstrap5nt:button — Offcanvas type', () => {
  function getButtonFn() {
    return _getComponent('bootstrap5nt:button', 'default');
  }

  test('renders button + offcanvas div', () => {
    const ctx = makeCtx({ _id: 'btn-oc-1' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'Offcanvas' }, ctx);
    expect(container.querySelector('button[data-bs-toggle="offcanvas"]')).toBeInTheDocument();
    expect(container.querySelector('.offcanvas')).toBeInTheDocument();
  });

  test('placement="end" → "offcanvas-end"', () => {
    const ctx = makeCtx({ _id: 'btn-oc-2' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'Offcanvas', placement: 'end' }, ctx);
    const offcanvas = container.querySelector('.offcanvas');
    expect(offcanvas).toHaveClass('offcanvas-end');
  });

  test('default placement → "offcanvas-start"', () => {
    const ctx = makeCtx({ _id: 'btn-oc-3' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'Offcanvas' }, ctx);
    const offcanvas = container.querySelector('.offcanvas');
    expect(offcanvas).toHaveClass('offcanvas-start');
  });

  test('OffcanvasTitle set → offcanvas-header rendered', () => {
    const ctx = makeCtx({ _id: 'btn-oc-4' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'Offcanvas', OffcanvasTitle: 'My Offcanvas' }, ctx);
    expect(container.querySelector('.offcanvas-header')).toBeInTheDocument();
    expect(container.querySelector('.offcanvas-title')?.textContent).toBe('My Offcanvas');
  });

  test('OffcanvasTitle absent → no header', () => {
    const ctx = makeCtx({ _id: 'btn-oc-5' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'Offcanvas' }, ctx);
    expect(container.querySelector('.offcanvas-header')).not.toBeInTheDocument();
  });

  test('enableBodyScrolling=true → data-bs-scroll="true"', () => {
    const ctx = makeCtx({ _id: 'btn-oc-6' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'Offcanvas', enableBodyScrolling: true }, ctx);
    const offcanvas = container.querySelector('.offcanvas');
    expect(offcanvas).toHaveAttribute('data-bs-scroll', 'true');
  });

  test('enableBodyScrolling=false → data-bs-scroll="false"', () => {
    const ctx = makeCtx({ _id: 'btn-oc-7' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'Offcanvas', enableBodyScrolling: false }, ctx);
    const offcanvas = container.querySelector('.offcanvas');
    expect(offcanvas).toHaveAttribute('data-bs-scroll', 'false');
  });

  test('enableBackdrop=false → data-bs-backdrop="false"', () => {
    const ctx = makeCtx({ _id: 'btn-oc-8' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'Offcanvas', enableBackdrop: false }, ctx);
    const offcanvas = container.querySelector('.offcanvas');
    expect(offcanvas).toHaveAttribute('data-bs-backdrop', 'false');
  });

  test('enableBackdrop default (undefined) → data-bs-backdrop="true"', () => {
    const ctx = makeCtx({ _id: 'btn-oc-9' });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'Offcanvas' }, ctx);
    const offcanvas = container.querySelector('.offcanvas');
    expect(offcanvas).toHaveAttribute('data-bs-backdrop', 'true');
  });
});

describe('bootstrap5nt:button — default (unknown type)', () => {
  function getButtonFn() {
    return _getComponent('bootstrap5nt:button', 'default');
  }

  test('unknown buttonType + edit mode → warning badge', () => {
    const ctx = makeCtx({ _id: 'btn-unk-1' }, { _editMode: true });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'unknownType' }, ctx);
    expect(container.querySelector('.badge-warning')).toBeInTheDocument();
  });

  test('unknown buttonType + live mode → null', () => {
    const ctx = makeCtx({ _id: 'btn-unk-2' }, { _editMode: false });
    _setContext(ctx);
    const fn = getButtonFn();
    const { container } = renderFn(fn, { buttonType: 'unknownType' }, ctx);
    expect(container.firstChild).toBeNull();
  });
});
