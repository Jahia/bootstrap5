import { parseInlineStyle } from '../../utils/inline-style';

describe('parseInlineStyle', () => {
  test('empty, null or declaration-less input → undefined', () => {
    expect(parseInlineStyle(undefined)).toBeUndefined();
    expect(parseInlineStyle(null)).toBeUndefined();
    expect(parseInlineStyle('')).toBeUndefined();
    expect(parseInlineStyle('not a declaration')).toBeUndefined();
    expect(parseInlineStyle(' ; ;')).toBeUndefined();
  });

  test('declarations → camelCase keys, trimmed values', () => {
    expect(parseInlineStyle('color: red; margin-top : 1rem ;')).toEqual({ color: 'red', marginTop: '1rem' });
  });

  test('no trailing semicolon, upper-case property', () => {
    expect(parseInlineStyle('BACKGROUND-COLOR:#fff')).toEqual({ backgroundColor: '#fff' });
  });

  test('vendor prefixes and custom properties', () => {
    expect(parseInlineStyle('-webkit-line-clamp: 2; -ms-transform: none; --bs-gutter-x: 0'))
      .toEqual({ WebkitLineClamp: '2', msTransform: 'none', '--bs-gutter-x': '0' });
  });

  test('semicolons and colons inside url() or quotes stay in the value', () => {
    expect(parseInlineStyle('background: url(data:image/png;base64,AAA=) no-repeat; content: "a;b"'))
      .toEqual({ background: 'url(data:image/png;base64,AAA=) no-repeat', content: '"a;b"' });
  });

  test('invalid property names are dropped', () => {
    expect(parseInlineStyle('co lor: red; 1x: 2; width: 10px')).toEqual({ width: '10px' });
  });
});
