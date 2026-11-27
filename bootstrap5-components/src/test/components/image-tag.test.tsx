import { render } from '@testing-library/react';
import React from 'react';
import { ImageTag, borderRadiusClass } from '../../utils/image';
import { makeNode } from '../helpers';

describe('ImageTag utility', () => {
  function renderImageTag(nodeOv: any = {}, imageOv: any = {}, extraProps: any = {}) {
    const node = makeNode(nodeOv);
    const imageNode = imageOv === null ? null : makeNode({ _url: '/test/image.jpg', _name: 'Test Image', ...imageOv });
    return render(
      React.createElement(ImageTag, { node, imageNode, ...extraProps })
    );
  }

  test('imageNode=null → renders nothing', () => {
    const node = makeNode();
    const { container } = render(React.createElement(ImageTag, { node, imageNode: null }));
    expect(container.firstChild).toBeNull();
  });

  test('basic image → img with src from imageNode.getUrl(), alt from displayableName', () => {
    const { container } = renderImageTag({}, { _url: '/img/photo.jpg', _name: 'A Photo' });
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/img/photo.jpg');
    expect(img).toHaveAttribute('alt', 'A Photo');
  });

  test('responsive=true (default) → img-fluid in class', () => {
    const { container } = renderImageTag({}, {}, { callerClass: '' });
    const img = container.querySelector('img');
    expect(img?.className).toContain('img-fluid');
  });

  test('responsive=false → no img-fluid in class', () => {
    const { container } = renderImageTag(
      {
        _nodeTypes: ['bootstrap5mix:imageAdvancedSettings'],
        _properties: { responsive: false },
      },
      {},
      { callerClass: 'img-fluid' }
    );
    const img = container.querySelector('img');
    expect(img?.className ?? '').not.toContain('img-fluid');
  });

  test('thumbnails=true → img-thumbnail in class', () => {
    const { container } = renderImageTag(
      {
        _nodeTypes: ['bootstrap5mix:imageAdvancedSettings'],
        _properties: { thumbnails: true, responsive: true },
      },
      {}
    );
    const img = container.querySelector('img');
    expect(img?.className).toContain('img-thumbnail');
  });

  test('borderRadius="rounded" (not "rounded-0") → appended to class', () => {
    const { container } = renderImageTag(
      {
        _nodeTypes: ['bootstrap5mix:imageAdvancedSettings'],
        _properties: { borderRadius: 'rounded' },
      },
      {}
    );
    const img = container.querySelector('img');
    expect(img?.className).toContain('rounded');
  });

  test('borderRadius="rounded-0" → NOT appended to class', () => {
    const { container } = renderImageTag(
      {
        _nodeTypes: ['bootstrap5mix:imageAdvancedSettings'],
        _properties: { borderRadius: 'rounded-0' },
      },
      {}
    );
    const img = container.querySelector('img');
    expect(img?.className ?? '').not.toContain('rounded-0');
  });

  test('borderRadiusSize not "default" → appended to class', () => {
    const { container } = renderImageTag(
      {
        _nodeTypes: ['bootstrap5mix:imageAdvancedSettings'],
        _properties: { borderRadiusSize: 'rounded-2' },
      },
      {}
    );
    const img = container.querySelector('img');
    expect(img?.className).toContain('rounded-2');
  });

  test('borderRadiusSize="default" → NOT appended', () => {
    const { container } = renderImageTag(
      {
        _nodeTypes: ['bootstrap5mix:imageAdvancedSettings'],
        _properties: { borderRadiusSize: 'default' },
      },
      {}
    );
    const img = container.querySelector('img');
    expect(img?.className ?? '').not.toContain('default');
  });

  test('align="start" → float-start in class', () => {
    const { container } = renderImageTag(
      {
        _nodeTypes: ['bootstrap5mix:imageAdvancedSettings'],
        _properties: { align: 'start' },
      },
      {}
    );
    const img = container.querySelector('img');
    expect(img?.className).toContain('float-start');
  });

  test('align="end" → float-end in class', () => {
    const { container } = renderImageTag(
      {
        _nodeTypes: ['bootstrap5mix:imageAdvancedSettings'],
        _properties: { align: 'end' },
      },
      {}
    );
    const img = container.querySelector('img');
    expect(img?.className).toContain('float-end');
  });

  test('align="center" → mx-auto d-block in class', () => {
    const { container } = renderImageTag(
      {
        _nodeTypes: ['bootstrap5mix:imageAdvancedSettings'],
        _properties: { align: 'center' },
      },
      {}
    );
    const img = container.querySelector('img');
    expect(img?.className).toContain('mx-auto');
    expect(img?.className).toContain('d-block');
  });

  test('imageClass from advanced settings → merged into className', () => {
    const { container } = renderImageTag(
      {
        _nodeTypes: ['bootstrap5mix:imageAdvancedSettings'],
        _properties: { imageClass: 'custom-image-class' },
      },
      {},
      { callerClass: 'base-class' }
    );
    const img = container.querySelector('img');
    expect(img?.className).toContain('custom-image-class');
    expect(img?.className).toContain('base-class');
  });

  test('imageStyle → style attribute on img (CSS string turned into an object)', () => {
    const { container } = renderImageTag(
      {
        _nodeTypes: ['bootstrap5mix:imageAdvancedSettings'],
        _properties: { imageStyle: 'border: 1px solid red; max-width: 50%' },
      },
      {}
    );
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.style.border).toBe('1px solid red');
    expect(img.style.maxWidth).toBe('50%');
  });

  test('imageID → id attribute on img', () => {
    const { container } = renderImageTag(
      {
        _nodeTypes: ['bootstrap5mix:imageAdvancedSettings'],
        _properties: { imageID: 'hero-image' },
      },
      {}
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('id', 'hero-image');
  });

  test('alt text from advanced settings → overrides displayableName', () => {
    const { container } = renderImageTag(
      {
        _nodeTypes: ['bootstrap5mix:imageAdvancedSettings'],
        _properties: { alt: 'Custom Alt Text' },
      },
      { _name: 'Node Name' }
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', 'Custom Alt Text');
  });

  test('callerClass is the base class; advanced settings append on top', () => {
    const { container } = renderImageTag(
      {
        _nodeTypes: ['bootstrap5mix:imageAdvancedSettings'],
        _properties: { imageClass: 'appended-class' },
      },
      {},
      { callerClass: 'caller-base' }
    );
    const img = container.querySelector('img');
    expect(img?.className).toContain('caller-base');
    expect(img?.className).toContain('appended-class');
  });

  test('callerClass="figure-img img-fluid" → img-fluid already present, not duplicated', () => {
    const { container } = renderImageTag(
      {},
      {},
      { callerClass: 'figure-img img-fluid' }
    );
    const img = container.querySelector('img');
    const classStr = img?.className ?? '';
    // Should have img-fluid but not duplicated
    const occurrences = classStr.split('img-fluid').length - 1;
    expect(occurrences).toBe(1);
  });

  // One class per case, as Bootstrap documents (rounded-top-3), never a shape and a size side by side
  describe('borderRadiusClass', () => {
    test.each([
      ['rounded', 'rounded-3', 'rounded-3'],
      ['rounded-top', 'rounded-3', 'rounded-top-3'],
      ['rounded-start', 'rounded-1', 'rounded-start-1'],
      ['rounded-top', 'default', 'rounded-top'],
      ['rounded-top', '', 'rounded-top'],
      ['rounded-circle', 'rounded-3', 'rounded-circle'],
      ['rounded-pill', 'rounded-2', 'rounded-pill'],
      ['rounded-0', 'rounded-3', ''],
      ['', 'rounded-2', 'rounded-2'],
      ['', 'default', ''],
      ['rounded', 'rounded-5', 'rounded-5'],
      ['rounded-top', 'x" onload="y', 'rounded-top'],
    ])('shape "%s" + size "%s" → "%s"', (shape, size, expected) => {
      expect(borderRadiusClass(shape, size)).toBe(expected);
    });
  });
});
