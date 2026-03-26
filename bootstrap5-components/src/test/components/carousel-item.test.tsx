import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeRenderContext, renderFn } from '../helpers';

import '../../components/Carousel/carousel-item.server';

function makeCarouselItemCtx(overrides: {
  _editMode?: boolean;
  id?: string;
  parentChildren?: any[];
  imageNode?: any;
  _hasAdvanced?: boolean;
  advancedProps?: Record<string, string>;
} = {}) {
  const id = overrides.id ?? 'item-1';
  const imageNode = overrides.imageNode ?? null;

  const currentNode: any = {
    getIdentifier: () => id,
    getDisplayableName: () => id,
    getName: () => id,
    getPath: () => `/slides/${id}`,
    isNodeType: (type: string) => {
      if (type === 'bootstrap5nt:carouselItem') return true;
      if (type === 'bootstrap5mix:advancedCarouselItem') return overrides._hasAdvanced ?? false;
      return false;
    },
    getProperty: (name: string) => {
      if (name === 'image') return imageNode ? { getNode: () => imageNode } : null;
      return null;
    },
    getPropertyAsString: (name: string) => {
      return overrides.advancedProps?.[name] ?? '';
    },
    _children: [],
  };

  // Build siblings: parent has children including currentNode
  const siblings = overrides.parentChildren ?? [currentNode];
  const parentNode = makeNode({ _id: 'parent-carousel', _children: siblings });
  currentNode.getParent = () => parentNode;

  const ctx = {
    currentNode,
    renderContext: makeRenderContext({ _editMode: overrides._editMode ?? false }),
    mainNode: currentNode,
  };
  _setContext(ctx);
  return ctx;
}

describe('bootstrap5nt:carouselItem (default standalone view)', () => {
  function getItemFn() {
    return _getComponent('bootstrap5nt:carouselItem', 'default');
  }

  test('live mode: renders carousel-item div', () => {
    const ctx = makeCarouselItemCtx({ _editMode: false });
    const fn = getItemFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.carousel-item')).toBeInTheDocument();
  });

  test('edit mode: compact thumbnail layout (d-flex gap-3 align-items-start)', () => {
    const ctx = makeCarouselItemCtx({ _editMode: true });
    const fn = getItemFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.d-flex.gap-3.align-items-start')).toBeInTheDocument();
    expect(container.querySelector('.carousel-item')).not.toBeInTheDocument();
  });

  test('first sibling → "carousel-item active"', () => {
    const item1 = makeNode({ _id: 'first', _nodeTypes: ['bootstrap5nt:carouselItem'] });
    const item2 = makeNode({ _id: 'second', _nodeTypes: ['bootstrap5nt:carouselItem'] });

    // currentNode is item1 (first)
    const currentNode: any = {
      ...item1,
      getIdentifier: () => 'first',
      isNodeType: (t: string) => t === 'bootstrap5nt:carouselItem',
      getProperty: () => null,
      getPropertyAsString: () => '',
    };
    const parentNode = makeNode({ _id: 'parent', _children: [currentNode, item2] });
    currentNode.getParent = () => parentNode;

    const ctx = {
      currentNode,
      renderContext: makeRenderContext({ _editMode: false }),
      mainNode: currentNode,
    };
    _setContext(ctx);
    const fn = getItemFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.carousel-item')).toHaveClass('active');
  });

  test('not first sibling → no "active" class', () => {
    const item1 = makeNode({ _id: 'first', _nodeTypes: ['bootstrap5nt:carouselItem'] });

    const currentNode: any = {
      getIdentifier: () => 'second',
      isNodeType: (t: string) => t === 'bootstrap5nt:carouselItem',
      getProperty: () => null,
      getPropertyAsString: () => '',
      _children: [],
    };
    const parentNode = makeNode({ _id: 'parent', _children: [item1, currentNode] });
    currentNode.getParent = () => parentNode;

    const ctx = {
      currentNode,
      renderContext: makeRenderContext({ _editMode: false }),
      mainNode: currentNode,
    };
    _setContext(ctx);
    const fn = getItemFn();
    const { container } = renderFn(fn, {}, ctx);
    const item = container.querySelector('.carousel-item');
    expect(item).not.toHaveClass('active');
  });

  test('image present → renders img with src', () => {
    const imageNode = makeNode({ _url: '/img/slide.jpg' });
    const ctx = makeCarouselItemCtx({ imageNode });
    const fn = getItemFn();
    const { container } = renderFn(fn, {}, ctx);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/img/slide.jpg');
  });

  test('no image → no img element in live mode', () => {
    const ctx = makeCarouselItemCtx({ _editMode: false });
    const fn = getItemFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  test('title + caption → rendered in caption div', () => {
    const ctx = makeCarouselItemCtx({ _editMode: false });
    const fn = getItemFn();
    const { container } = renderFn(fn, { 'jcr:title': 'Slide Title', caption: 'Slide Caption' }, ctx);
    const captionDiv = container.querySelector('.carousel-caption');
    expect(captionDiv).toBeInTheDocument();
    expect(captionDiv?.querySelector('h3')?.textContent).toBe('Slide Title');
    expect(captionDiv?.querySelector('p')?.textContent).toBe('Slide Caption');
  });

  test('no title and no caption → no caption div', () => {
    const ctx = makeCarouselItemCtx({ _editMode: false });
    const fn = getItemFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.carousel-caption')).not.toBeInTheDocument();
  });

  test('advancedCarouselItem: titleColor → text-{color} on h3', () => {
    const ctx = makeCarouselItemCtx({
      _hasAdvanced: true,
      advancedProps: { titleColor: 'danger' },
    });
    const fn = getItemFn();
    const { container } = renderFn(fn, { 'jcr:title': 'Colored' }, ctx);
    const h3 = container.querySelector('h3');
    expect(h3).toHaveClass('text-danger');
  });

  test('advancedCarouselItem: carouselItemClass → appended to carousel-item class', () => {
    const ctx = makeCarouselItemCtx({
      _hasAdvanced: true,
      advancedProps: { carouselItemClass: 'my-slide' },
    });
    const fn = getItemFn();
    const { container } = renderFn(fn, {}, ctx);
    const item = container.querySelector('.carousel-item');
    expect(item?.className).toContain('my-slide');
  });

  test('advancedCarouselItem: interval → data-bs-interval attribute', () => {
    const ctx = makeCarouselItemCtx({
      _hasAdvanced: true,
      advancedProps: { interval: '2000' },
    });
    const fn = getItemFn();
    const { container } = renderFn(fn, {}, ctx);
    const item = container.querySelector('.carousel-item');
    expect(item).toHaveAttribute('data-bs-interval', '2000');
  });
});
