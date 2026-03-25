import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeCtx, makeRenderContext, renderFn } from '../helpers';

import '../../components/Carousel/default.server';

function makeCarouselItem(id: string, props: any = {}): any {
  const imageNode = props.imageNode ?? null;
  return makeNode({
    _id: id,
    _nodeTypes: ['bootstrap5nt:carouselItem'],
    _nodeName: id,
    getProperty: (name: string) => {
      if (name === 'image') return imageNode ? { getNode: () => imageNode } : null;
      return null;
    },
    getPropertyAsString: (name: string) => {
      return props[name] ?? '';
    },
    isNodeType: (type: string) => {
      if (type === 'bootstrap5nt:carouselItem') return true;
      if (type === 'bootstrap5mix:advancedCarouselItem') return props._hasAdvanced ?? false;
      return false;
    },
    getIdentifier: () => id,
    getDisplayableName: () => props._name ?? id,
  });
}

describe('bootstrap5nt:carousel (default view)', () => {
  function getCarouselFn() {
    return _getComponent('bootstrap5nt:carousel', 'default');
  }

  function makeCarouselCtx(nodeOverrides: any = {}, rcOverrides: any = {}) {
    const ctx = {
      currentNode: makeNode(nodeOverrides),
      renderContext: makeRenderContext(rcOverrides),
      mainNode: makeNode(nodeOverrides),
    };
    _setContext(ctx);
    return ctx;
  }

  test('live mode: outer div has class "carousel slide"', () => {
    const ctx = makeCarouselCtx({ _id: 'car-1' }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    const div = container.querySelector('#carousel_car-1');
    expect(div).toBeInTheDocument();
    expect(div?.className).toContain('carousel');
    expect(div?.className).toContain('slide');
    expect(div?.className).not.toContain('carouseledit');
  });

  test('edit mode: outer div has class "carouseledit slide"', () => {
    const ctx = makeCarouselCtx({ _id: 'car-2' }, { _editMode: true });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    const div = container.querySelector('#carousel_car-2');
    expect(div?.className).toContain('carouseledit');
    expect(div?.className).not.toContain(' carousel ');
  });

  test('carouselId uses currentNode.getIdentifier()', () => {
    const ctx = makeCarouselCtx({ _id: 'my-carousel-id' });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('#carousel_my-carousel-id')).toBeInTheDocument();
  });

  test('no items → no indicators, no slides', () => {
    const ctx = makeCarouselCtx({ _id: 'car-3', _children: [] }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.carousel-indicators')).not.toBeInTheDocument();
    expect(container.querySelector('.carousel-item')).not.toBeInTheDocument();
  });

  test('with items in live mode → carousel-item divs rendered', () => {
    const item1 = makeCarouselItem('slide-1');
    const item2 = makeCarouselItem('slide-2');
    const ctx = makeCarouselCtx({ _id: 'car-4', _children: [item1, item2] }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    const items = container.querySelectorAll('.carousel-item');
    expect(items.length).toBe(2);
  });

  test('first item → "carousel-item active"', () => {
    const item1 = makeCarouselItem('slide-first');
    const item2 = makeCarouselItem('slide-second');
    const ctx = makeCarouselCtx({ _id: 'car-5', _children: [item1, item2] }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    const items = container.querySelectorAll('.carousel-item');
    expect(items[0]).toHaveClass('active');
    expect(items[1]).not.toHaveClass('active');
  });

  test('slide with image → img[src]', () => {
    const imageNode = makeNode({ _url: '/images/slide.jpg' });
    const item = makeCarouselItem('slide-img', { imageNode });
    const ctx = makeCarouselCtx({ _id: 'car-6', _children: [item] }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/slide.jpg');
  });

  test('slide with title + caption → carousel-caption h3 + p', () => {
    const item = makeCarouselItem('slide-cap', {
      'jcr:title': 'My Slide Title',
      caption: 'My Caption Text',
    });
    const ctx = makeCarouselCtx({ _id: 'car-7', _children: [item] }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    const caption = container.querySelector('.carousel-caption');
    expect(caption).toBeInTheDocument();
    expect(caption?.querySelector('h3')?.textContent).toBe('My Slide Title');
    expect(caption?.querySelector('p')?.textContent).toBe('My Caption Text');
  });

  test('useIndicators=false → no .carousel-indicators', () => {
    const item = makeCarouselItem('slide-1');
    const ctx = makeCarouselCtx({
      _id: 'car-8',
      _children: [item],
      _nodeTypes: ['bootstrap5mix:carouselAdvancedSettings'],
      _properties: { useIndicators: 'false' },
    }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.carousel-indicators')).not.toBeInTheDocument();
  });

  test('useLeftAndRightControls=false → no prev/next controls', () => {
    const item = makeCarouselItem('slide-1');
    const ctx = makeCarouselCtx({
      _id: 'car-9',
      _children: [item],
      _nodeTypes: ['bootstrap5mix:carouselAdvancedSettings'],
      _properties: { useLeftAndRightControls: 'false' },
    }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.carousel-control-prev')).not.toBeInTheDocument();
    expect(container.querySelector('.carousel-control-next')).not.toBeInTheDocument();
  });

  test('edit mode → no indicators', () => {
    const item = makeCarouselItem('slide-1');
    const ctx = makeCarouselCtx({ _id: 'car-10', _children: [item] }, { _editMode: true });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.carousel-indicators')).not.toBeInTheDocument();
  });

  test('edit mode → no prev/next controls', () => {
    const item = makeCarouselItem('slide-1');
    const ctx = makeCarouselCtx({ _id: 'car-11', _children: [item] }, { _editMode: true });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.carousel-control-prev')).not.toBeInTheDocument();
    expect(container.querySelector('.carousel-control-next')).not.toBeInTheDocument();
  });

  test('fade=true → "carousel-fade" class on outer div', () => {
    const ctx = makeCarouselCtx({
      _id: 'car-12',
      _nodeTypes: ['bootstrap5mix:carouselAdvancedSettings'],
      _properties: { fade: 'true' },
    }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    const div = container.querySelector('#carousel_car-12');
    expect(div?.className).toContain('carousel-fade');
  });

  test('variant="dark" → "carousel-dark" class', () => {
    const ctx = makeCarouselCtx({
      _id: 'car-13',
      _nodeTypes: ['bootstrap5mix:carouselAdvancedSettings'],
      _properties: { variant: 'dark' },
    }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    const div = container.querySelector('#carousel_car-13');
    expect(div?.className).toContain('carousel-dark');
  });

  test('custom interval (not 5000) → data-bs-interval attribute', () => {
    const ctx = makeCarouselCtx({
      _id: 'car-14',
      _nodeTypes: ['bootstrap5mix:carouselAdvancedSettings'],
      _properties: { interval: '3000' },
    }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    const div = container.querySelector('#carousel_car-14');
    expect(div).toHaveAttribute('data-bs-interval', '3000');
  });

  test('interval=5000 → no data-bs-interval attribute (default)', () => {
    const ctx = makeCarouselCtx({
      _id: 'car-15',
      _nodeTypes: ['bootstrap5mix:carouselAdvancedSettings'],
      _properties: { interval: '5000' },
    }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    const div = container.querySelector('#carousel_car-15');
    expect(div).not.toHaveAttribute('data-bs-interval');
  });

  test('advancedCarouselItem titleColor → "text-{color}" on h3', () => {
    const item = makeCarouselItem('slide-tc', {
      'jcr:title': 'Colored Title',
      _hasAdvanced: true,
      titleColor: 'primary',
    });
    const ctx = makeCarouselCtx({ _id: 'car-16', _children: [item] }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    const h3 = container.querySelector('.carousel-caption h3');
    expect(h3).toHaveClass('text-primary');
  });

  test('useIndicators=true (default) → .carousel-indicators rendered with items', () => {
    const item1 = makeCarouselItem('slide-a');
    const item2 = makeCarouselItem('slide-b');
    const ctx = makeCarouselCtx({ _id: 'car-17', _children: [item1, item2] }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    const indicators = container.querySelector('.carousel-indicators');
    expect(indicators).toBeInTheDocument();
    const lis = indicators?.querySelectorAll('li');
    expect(lis?.length).toBe(2);
  });

  test('live mode → prev/next controls rendered by default', () => {
    const item = makeCarouselItem('slide-x');
    const ctx = makeCarouselCtx({ _id: 'car-18', _children: [item] }, { _editMode: false });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.carousel-control-prev')).toBeInTheDocument();
    expect(container.querySelector('.carousel-control-next')).toBeInTheDocument();
  });

  test('edit mode → Area drop zone rendered', () => {
    const ctx = makeCarouselCtx({ _id: 'car-19' }, { _editMode: true });
    const fn = getCarouselFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('[data-testid="area"]')).toBeInTheDocument();
  });
});
