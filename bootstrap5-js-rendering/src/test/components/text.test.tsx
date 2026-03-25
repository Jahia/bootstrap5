import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeRenderContext, renderFn } from '../helpers';

import '../../components/Text/default.server';

describe('bootstrap5nt:text (default view)', () => {
  function getTextFn() {
    return _getComponent('bootstrap5nt:text', 'default');
  }

  function makeTextCtx(textValue: string | null) {
    const properties: Record<string, any> = {};
    if (textValue !== null) {
      properties['text'] = textValue;
    }

    const currentNode = makeNode({
      _id: 'text-1',
      _properties: properties,
    });

    const ctx = {
      currentNode,
      renderContext: makeRenderContext(),
      mainNode: currentNode,
    };
    _setContext(ctx);
    return ctx;
  }

  test('empty html → renders null (no output)', () => {
    const ctx = makeTextCtx('');
    const fn = getTextFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.firstChild).toBeNull();
  });

  test('html not set → renders null', () => {
    const ctx = makeTextCtx(null);
    const fn = getTextFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.firstChild).toBeNull();
  });

  test('html set → renders div with dangerouslySetInnerHTML', () => {
    const ctx = makeTextCtx('<p>Hello World</p>');
    const fn = getTextFn();
    const { container } = renderFn(fn, {}, ctx);
    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
    expect(div?.innerHTML).toBe('<p>Hello World</p>');
  });

  test('html set with rich content → rendered verbatim', () => {
    const html = '<h2>Title</h2><p>Some <strong>bold</strong> text</p>';
    const ctx = makeTextCtx(html);
    const fn = getTextFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('h2')?.textContent).toBe('Title');
    expect(container.querySelector('strong')?.textContent).toBe('bold');
  });

  test('whitespace-only html → still renders (not considered empty)', () => {
    const ctx = makeTextCtx('   ');
    const fn = getTextFn();
    const { container } = renderFn(fn, {}, ctx);
    // '   ' is truthy, so it should render a div
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});
