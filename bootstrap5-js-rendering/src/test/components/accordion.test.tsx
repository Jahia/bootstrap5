import { screen } from '@testing-library/react';
import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeCtx, makeRenderContext, renderFn } from '../helpers';

// Register components
import '../../components/Accordion/default.server';
import '../../components/Accordion/accordion-item.server';

describe('bootstrap5nt:accordions (default view)', () => {
  function getAccordionFn() {
    return _getComponent('bootstrap5nt:accordions', 'default');
  }

  test('flush=false → .accordion without accordion-flush', () => {
    const ctx = makeCtx({ _id: 'acc-1' });
    _setContext(ctx);
    const fn = getAccordionFn();
    const { container } = renderFn(fn, { flush: false }, ctx);
    const div = container.querySelector('.accordion');
    expect(div).toBeInTheDocument();
    expect(div).not.toHaveClass('accordion-flush');
  });

  test('flush=true → .accordion.accordion-flush', () => {
    const ctx = makeCtx({ _id: 'acc-2' });
    _setContext(ctx);
    const fn = getAccordionFn();
    const { container } = renderFn(fn, { flush: true }, ctx);
    const div = container.querySelector('.accordion');
    expect(div).toBeInTheDocument();
    expect(div).toHaveClass('accordion-flush');
  });

  test('accordion id uses currentNode.getIdentifier()', () => {
    const ctx = makeCtx({ _id: 'my-unique-id' });
    _setContext(ctx);
    const fn = getAccordionFn();
    const { container } = renderFn(fn, {}, ctx);
    const div = container.querySelector('#accordion-my-unique-id');
    expect(div).toBeInTheDocument();
  });

  test('renders RenderChildren with filter bootstrap5nt:accordion', () => {
    const ctx = makeCtx({ _id: 'acc-3' });
    _setContext(ctx);
    const fn = getAccordionFn();
    const { container } = renderFn(fn, {}, ctx);
    const rc = container.querySelector('[data-testid="render-children"]');
    expect(rc).toBeInTheDocument();
    expect(rc).toHaveAttribute('data-filter', 'bootstrap5nt:accordion');
  });

  test('renders Area for edit-mode drop zone', () => {
    const ctx = makeCtx({ _id: 'acc-4' });
    _setContext(ctx);
    const fn = getAccordionFn();
    const { container } = renderFn(fn, {}, ctx);
    const area = container.querySelector('[data-testid="area"]');
    expect(area).toBeInTheDocument();
    expect(area).toHaveAttribute('data-area-name', 'panels');
  });
});

describe('bootstrap5nt:accordion (default view)', () => {
  function getItemFn() {
    return _getComponent('bootstrap5nt:accordion', 'default');
  }

  function makeItemCtx(overrides: any = {}) {
    const parentNode = makeNode({ _id: 'parent-id-123' });
    const currentNode = makeNode({
      _id: 'item-id-456',
      _name: 'Displayable Name',
      _parent: parentNode,
      ...overrides,
    });
    const ctx = {
      currentNode,
      renderContext: makeRenderContext(),
      mainNode: currentNode,
    };
    _setContext(ctx);
    return ctx;
  }

  test('title from prop renders in button', () => {
    const ctx = makeItemCtx();
    const fn = getItemFn();
    const { container } = renderFn(fn, { 'jcr:title': 'My Title' }, ctx);
    const button = container.querySelector('.accordion-button');
    expect(button).toHaveTextContent('My Title');
  });

  test('title falls back to displayableName when jcr:title absent', () => {
    const ctx = makeItemCtx();
    const fn = getItemFn();
    const { container } = renderFn(fn, {}, ctx);
    const button = container.querySelector('.accordion-button');
    expect(button).toHaveTextContent('Displayable Name');
  });

  test('show=true → accordion-collapse collapse show', () => {
    const ctx = makeItemCtx();
    const fn = getItemFn();
    const { container } = renderFn(fn, { show: true }, ctx);
    const collapse = container.querySelector('.accordion-collapse');
    expect(collapse).toHaveClass('collapse');
    expect(collapse).toHaveClass('show');
  });

  test('show=false → accordion-collapse collapse without show', () => {
    const ctx = makeItemCtx();
    const fn = getItemFn();
    const { container } = renderFn(fn, { show: false }, ctx);
    const collapse = container.querySelector('.accordion-collapse');
    expect(collapse).toHaveClass('collapse');
    expect(collapse).not.toHaveClass('show');
  });

  test('text set → dangerouslySetInnerHTML rendered', () => {
    const ctx = makeItemCtx();
    const fn = getItemFn();
    const { container } = renderFn(fn, { text: '<p>Hello</p>' }, ctx);
    const body = container.querySelector('.accordion-body');
    expect(body?.innerHTML).toContain('<p>Hello</p>');
  });

  test('text absent → no inline div with HTML', () => {
    const ctx = makeItemCtx();
    const fn = getItemFn();
    const { container } = renderFn(fn, {}, ctx);
    // The accordion-body should not contain any dangerouslySetInnerHTML div
    const body = container.querySelector('.accordion-body');
    // Only Area child should be inside (no p tag from HTML)
    expect(body?.querySelector('p')).not.toBeInTheDocument();
  });

  test('IDs are derived from currentNode and parent identifiers', () => {
    const ctx = makeItemCtx();
    const fn = getItemFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('#accordion-item-id-456')).toBeInTheDocument();
    expect(container.querySelector('#collapse-item-id-456')).toBeInTheDocument();
    const collapseDiv = container.querySelector('#collapse-item-id-456');
    expect(collapseDiv).toHaveAttribute('data-bs-parent', '#accordion-parent-id-123');
  });

  test('accordion-item has accordion-header with h2', () => {
    const ctx = makeItemCtx();
    const fn = getItemFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.accordion-item')).toBeInTheDocument();
    expect(container.querySelector('.accordion-header')).toBeInTheDocument();
    expect(container.querySelector('h2.accordion-header')).toBeInTheDocument();
  });
});
