import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeCtx, makeRenderContext, renderFn } from '../helpers';

import '../../components/Card/default.server';

describe('bootstrap5nt:card (default view)', () => {
  function getCardFn() {
    return _getComponent('bootstrap5nt:card', 'default');
  }

  function makeCardCtx(nodeOverrides: any = {}, rcOverrides: any = {}) {
    const ctx = {
      currentNode: makeNode(nodeOverrides),
      renderContext: makeRenderContext(rcOverrides),
      mainNode: makeNode(nodeOverrides),
    };
    _setContext(ctx);
    return ctx;
  }

  test('title set with default headerSize → renders div.card-header', () => {
    const ctx = makeCardCtx();
    const fn = getCardFn();
    const { container } = renderFn(fn, { 'jcr:title': 'My Card Title' }, ctx);
    const header = container.querySelector('.card-header');
    expect(header).toBeInTheDocument();
    expect(header?.tagName).toBe('DIV');
    expect(header?.textContent).toBe('My Card Title');
  });

  test('title set with headerSize="h3" → renders h3.card-header', () => {
    const ctx = makeCardCtx();
    const fn = getCardFn();
    const { container } = renderFn(fn, { 'jcr:title': 'H3 Title', headerSize: 'h3' }, ctx);
    const header = container.querySelector('h3.card-header');
    expect(header).toBeInTheDocument();
  });

  test('no title → no header element', () => {
    const ctx = makeCardCtx();
    const fn = getCardFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.card-header')).not.toBeInTheDocument();
  });

  test('image → ImageTag renders img element', () => {
    const ctx = makeCardCtx();
    const imageNode = makeNode({ _url: '/files/img.jpg', _name: 'Image' });
    const fn = getCardFn();
    const { container } = renderFn(fn, { image: imageNode }, ctx);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/files/img.jpg');
  });

  test('no image → no img element', () => {
    const ctx = makeCardCtx();
    const fn = getCardFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  test('footer set → card-footer with text', () => {
    const ctx = makeCardCtx();
    const fn = getCardFn();
    const { container } = renderFn(fn, { footer: 'Footer text' }, ctx);
    const footer = container.querySelector('.card-footer');
    expect(footer).toBeInTheDocument();
    expect(footer?.textContent).toContain('Footer text');
  });

  test('freeFooter=true → Area in card-footer', () => {
    const ctx = makeCardCtx({
      _nodeTypes: ['bootstrap5mix:cardAdvancedSettings'],
      _properties: { freeFooter: 'true', cssClass: 'card' },
    });
    const fn = getCardFn();
    const { container } = renderFn(fn, {}, ctx);
    const footer = container.querySelector('.card-footer');
    expect(footer).toBeInTheDocument();
    const area = footer?.querySelector('[data-testid="area"]');
    expect(area).toBeInTheDocument();
  });

  test('textAlign="text-center" → alignment class on outer div', () => {
    const ctx = makeCardCtx();
    const fn = getCardFn();
    const { container } = renderFn(fn, { textAlign: 'text-center' }, ctx);
    const outer = container.querySelector('.card');
    expect(outer?.className).toContain('text-center');
  });

  test('textAlign="text-start" → no extra class on outer div', () => {
    const ctx = makeCardCtx();
    const fn = getCardFn();
    const { container } = renderFn(fn, { textAlign: 'text-start' }, ctx);
    const outer = container.querySelector('.card');
    expect(outer?.className).not.toContain('text-start');
  });

  test('colors mixin → bg-primary, text-white, border-dark classes', () => {
    const ctx = makeCardCtx({
      _nodeTypes: ['bootstrap5mix:colors'],
      _properties: { backgroundColor: 'primary', textColor: 'white', borderColor: 'dark' },
    });
    const fn = getCardFn();
    const { container } = renderFn(fn, {}, ctx);
    const outer = container.firstElementChild;
    expect(outer?.className).toContain('bg-primary');
    expect(outer?.className).toContain('text-white');
    expect(outer?.className).toContain('border-dark');
  });

  test('colors mixin: backgroundColor="default" → no bg class', () => {
    const ctx = makeCardCtx({
      _nodeTypes: ['bootstrap5mix:colors'],
      _properties: { backgroundColor: 'default', textColor: '', borderColor: 'default' },
    });
    const fn = getCardFn();
    const { container } = renderFn(fn, {}, ctx);
    const outer = container.firstElementChild;
    expect(outer?.className).not.toContain('bg-default');
  });

  test('cardAdvancedSettings mixin → custom CSS class on outer div', () => {
    const ctx = makeCardCtx({
      _nodeTypes: ['bootstrap5mix:cardAdvancedSettings'],
      _properties: { cssClass: 'my-custom-card', cardBodyCssClass: 'card-body', cardHeaderCssClass: 'card-header', freeFooter: 'false' },
    });
    const fn = getCardFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.my-custom-card')).toBeInTheDocument();
  });

  test('bodyChildren rendered via Render', () => {
    const child1 = makeNode({ _id: 'child-1', _nodeTypes: ['jmix:droppableContent'], _nodeName: 'child-1' });
    const child2 = makeNode({ _id: 'child-2', _nodeTypes: ['jmix:droppableContent'], _nodeName: 'child-2' });
    const ctx = makeCardCtx({ _children: [child1, child2] });
    const fn = getCardFn();
    const { container } = renderFn(fn, {}, ctx);
    const rendered = container.querySelectorAll('[data-testid="render-node"]');
    expect(rendered.length).toBe(2);
  });

  test('edit mode → Area in card body', () => {
    const ctx = makeCardCtx({}, { _editMode: true });
    const fn = getCardFn();
    const { container } = renderFn(fn, {}, ctx);
    const body = container.querySelector('.card-body');
    const area = body?.querySelector('[data-testid="area"]');
    expect(area).toBeInTheDocument();
  });

  test('live mode → no Area in card body', () => {
    const ctx = makeCardCtx({}, { _editMode: false });
    const fn = getCardFn();
    const { container } = renderFn(fn, {}, ctx);
    const body = container.querySelector('.card-body');
    const area = body?.querySelector('[data-testid="area"]');
    expect(area).not.toBeInTheDocument();
  });

  test('cardFooter-named children excluded from bodyChildren', () => {
    const normal = makeNode({ _id: 'c1', _nodeTypes: ['jmix:droppableContent'], _nodeName: 'normal' });
    const footerChild = makeNode({ _id: 'c2', _nodeTypes: ['jmix:droppableContent'], _nodeName: 'cardFooter' });
    const ctx = makeCardCtx({ _children: [normal, footerChild] });
    const fn = getCardFn();
    const { container } = renderFn(fn, {}, ctx);
    const rendered = container.querySelectorAll('[data-testid="render-node"]');
    // Only 'normal' should be rendered (footerChild excluded)
    expect(rendered.length).toBe(1);
    expect(rendered[0]).toHaveAttribute('data-node-id', 'c1');
  });
});
