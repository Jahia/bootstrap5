import { getInvalidLanguages, getSiteLanguages } from '../../utils/languages';
import { makeNode, makeRenderContext } from '../helpers';

const NAMES: Record<string, string> = { en: 'English', fr: 'français', de: 'Deutsch', fr_CH: 'français' };
const makeLocale = (code: string) => ({ toString: () => code, getDisplayLanguage: () => NAMES[code] });

function makeSite(languages: string[], options: { live?: string[]; mix?: boolean } = {}) {
  return {
    getLanguages: () => new Set(languages),
    getActiveLiveLanguages: () => new Set(options.live ?? languages),
    getLanguagesAsLocales: () => languages.map(makeLocale),
    isMixLanguagesActive: () => options.mix ?? false,
  };
}

/** A page whose translations are published in the given languages. */
function makePage(published: string[], invalid: string[] = []) {
  return makeNode({
    _properties: invalid.length ? { 'j:invalidLanguages': invalid } : {},
    getI18N: (locale: any) => {
      const code = locale.toString();
      if (!published.includes(code)) throw new Error('no translation');
      const props: Record<string, any> = { 'jcr:language': code, 'j:published': true };
      return {
        hasProperty: (name: string) => name in props,
        getProperty: (name: string) => ({ getString: () => String(props[name]), getBoolean: () => Boolean(props[name]) }),
      };
    },
  });
}

describe('getSiteLanguages', () => {
  test('fewer than two languages → empty', () => {
    const rc = makeRenderContext({ _site: makeSite(['en']) });
    expect(getSiteLanguages(rc, makePage(['en']))).toEqual([]);
  });

  test('no site → empty', () => {
    expect(getSiteLanguages(makeRenderContext(), makePage([]))).toEqual([]);
  });

  test('edit / preview → every site language, sorted, with native names and BCP 47 tags', () => {
    const rc = makeRenderContext({ _site: makeSite(['fr_CH', 'en', 'de']), _editMode: true });
    expect(getSiteLanguages(rc, makePage([]))).toEqual([
      { code: 'de', tag: 'de', label: 'Deutsch' },
      { code: 'en', tag: 'en', label: 'English' },
      { code: 'fr_CH', tag: 'fr-CH', label: 'français' },
    ]);
  });

  test('live → only languages active in live', () => {
    const rc = makeRenderContext({ _site: makeSite(['en', 'fr', 'de'], { live: ['en', 'fr'] }) });
    expect(getSiteLanguages(rc, makePage(['en', 'fr', 'de'])).map((l) => l.code)).toEqual(['en', 'fr']);
  });

  test('live → only languages in which the page is published', () => {
    const rc = makeRenderContext({ _site: makeSite(['en', 'fr', 'de']) });
    expect(getSiteLanguages(rc, makePage(['en', 'de'])).map((l) => l.code)).toEqual(['de', 'en']);
  });

  test('live → invalidated languages are left out', () => {
    const rc = makeRenderContext({ _site: makeSite(['en', 'fr', 'de']) });
    expect(getSiteLanguages(rc, makePage(['en', 'fr', 'de'], ['fr'])).map((l) => l.code)).toEqual(['de', 'en']);
  });

  test('live with mixed languages → no publication check', () => {
    const rc = makeRenderContext({ _site: makeSite(['en', 'fr'], { mix: true }) });
    expect(getSiteLanguages(rc, makePage(['en'])).map((l) => l.code)).toEqual(['en', 'fr']);
  });

  test('label falls back to the upper-cased code', () => {
    const site = { ...makeSite(['en', 'fr']), getLanguagesAsLocales: () => { throw new Error('unavailable'); } };
    const rc = makeRenderContext({ _site: site, _editMode: true });
    expect(getSiteLanguages(rc, makePage([])).map((l) => l.label)).toEqual(['EN', 'FR']);
  });
});

describe('getInvalidLanguages', () => {
  test('property not set → empty', () => {
    expect(getInvalidLanguages(makeNode())).toEqual([]);
  });
  test('multi-valued property → codes', () => {
    expect(getInvalidLanguages(makeNode({ _properties: { 'j:invalidLanguages': ['fr', 'de'] } }))).toEqual(['fr', 'de']);
  });
});
