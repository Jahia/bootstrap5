import { safeUrl } from '../../utils/safe-url';

describe('safeUrl — same rules as the 2.x b5:safeUrl function', () => {
  test.each([
    ['https://www.jahia.com', 'https://www.jahia.com'],
    ['http://example.com/a?b=c#d', 'http://example.com/a?b=c#d'],
    ['mailto:someone@example.com', 'mailto:someone@example.com'],
    ['tel:+41000000000', 'tel:+41000000000'],
    ['/relative/path.html', '/relative/path.html'],
    ['page.html?x=1:2', 'page.html?x=1:2'],
    ['#anchor', '#anchor'],
    ['  https://trimmed.example  ', 'https://trimmed.example'],
  ])('keeps a safe URL: %s', (url, expected) => {
    expect(safeUrl(url)).toBe(expected);
  });

  test.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    'java\tscript:alert(1)',
    ' \u0001javascript:alert(1)',
    'data:text/html;base64,PHNjcmlwdD4=',
    'vbscript:msgbox(1)',
  ])('replaces an active scheme with "#": %s', (url) => {
    expect(safeUrl(url)).toBe('#');
  });

  test.each([undefined, null, '', '   '])('returns "#" when there is no URL: %s', (url) => {
    expect(safeUrl(url)).toBe('#');
  });
});
