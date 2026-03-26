import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeCtx, renderFn } from '../helpers';

import '../../components/Figure/default.server';

describe('bootstrap5nt:figure (default view)', () => {
  function getFigureFn() {
    return _getComponent('bootstrap5nt:figure', 'default');
  }

  test('with image → renders figure > img', () => {
    const imageNode = makeNode({ _url: '/files/photo.jpg', _name: 'Photo' });
    const ctx = makeCtx({ _id: 'fig-1' });
    _setContext(ctx);
    const fn = getFigureFn();
    const { container } = renderFn(fn, { image: imageNode }, ctx);
    expect(container.querySelector('figure')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', '/files/photo.jpg');
  });

  test('no image → figure renders without img', () => {
    const ctx = makeCtx({ _id: 'fig-2' });
    _setContext(ctx);
    const fn = getFigureFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('figure')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  test('caption set → figcaption rendered', () => {
    const imageNode = makeNode({ _url: '/f.jpg' });
    const ctx = makeCtx({ _id: 'fig-3' });
    _setContext(ctx);
    const fn = getFigureFn();
    const { container } = renderFn(fn, { image: imageNode, 'jcr:title': 'My Caption' }, ctx);
    const caption = container.querySelector('figcaption');
    expect(caption).toBeInTheDocument();
    expect(caption?.textContent).toBe('My Caption');
  });

  test('no caption → no figcaption', () => {
    const imageNode = makeNode({ _url: '/f.jpg' });
    const ctx = makeCtx({ _id: 'fig-4' });
    _setContext(ctx);
    const fn = getFigureFn();
    const { container } = renderFn(fn, { image: imageNode }, ctx);
    expect(container.querySelector('figcaption')).not.toBeInTheDocument();
  });

  test('captionAlignment from mixin → class on figcaption', () => {
    const imageNode = makeNode({ _url: '/f.jpg' });
    const ctx = {
      currentNode: makeNode({
        _id: 'fig-5',
        _nodeTypes: ['bootstrap5mix:figureAdvancedSettings'],
        _properties: { captionAlignment: 'text-center' },
      }),
      renderContext: { isEditMode: () => false },
      mainNode: makeNode({ _id: 'fig-5' }),
    };
    _setContext(ctx);
    const fn = getFigureFn();
    const { container } = renderFn(fn, { image: imageNode, 'jcr:title': 'Caption' }, ctx);
    const caption = container.querySelector('figcaption');
    expect(caption).toHaveClass('text-center');
  });

  test('no mixin → no captionAlignment class on figcaption', () => {
    const imageNode = makeNode({ _url: '/f.jpg' });
    const ctx = makeCtx({ _id: 'fig-6' });
    _setContext(ctx);
    const fn = getFigureFn();
    const { container } = renderFn(fn, { image: imageNode, 'jcr:title': 'Caption' }, ctx);
    const caption = container.querySelector('figcaption');
    expect(caption?.className).toBe('figure-caption');
  });

  test('figure has class "figure"', () => {
    const ctx = makeCtx({ _id: 'fig-7' });
    _setContext(ctx);
    const fn = getFigureFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('figure.figure')).toBeInTheDocument();
  });
});
