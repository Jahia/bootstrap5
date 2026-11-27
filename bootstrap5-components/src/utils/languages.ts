/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";

export interface SiteLanguage {
  /** Jahia language code, e.g. "fr" or "fr_CH" */
  code: string;
  /** BCP 47 tag for the lang / hreflang attributes, e.g. "fr-CH" */
  tag: string;
  /** Name of the language in that language ("français"), or the code when it cannot be resolved */
  label: string;
}

/** Copies a Java collection, array or iterable of strings into a JS array. */
function toStrings(values: unknown): string[] {
  if (values === null || values === undefined) return [];
  try {
    return [...(values as Iterable<unknown>)].map(String);
  } catch {
    const arrayLike = values as { length?: number; [index: number]: unknown };
    const result: string[] = [];
    for (let i = 0; i < (arrayLike.length ?? 0); i++) result.push(String(arrayLike[i]));
    return result;
  }
}

/** Languages invalidated on the node (j:invalidLanguages), empty when the property is not set. */
export function getInvalidLanguages(node: JCRNodeWrapper): string[] {
  try {
    if (!node.hasProperty("j:invalidLanguages")) return [];
    const values = node.getProperty("j:invalidLanguages").getValues() as unknown as { getString(): string }[];
    const result: string[] = [];
    for (let i = 0; i < values.length; i++) result.push(String(values[i].getString()));
    return result;
  } catch {
    return [];
  }
}

/**
 * The languages a visitor can switch to on the page displayed: what the 2.x
 * `<ui:initLangBarAttributes activeLanguagesOnly="${renderContext.liveMode}"/>` tag put in
 * `languageCodes`, sorted by code, each with the label the b5:switchToLanguageLink tag printed.
 *
 * - In live mode only the languages active in live are listed, and (unless the site mixes
 *   languages) only those in which the page is published and not invalidated.
 * - In the other modes every language of the site is listed.
 *
 * Returns an empty array when the site has fewer than two languages, as the tag did.
 */
export function getSiteLanguages(renderContext: RenderContext, mainNode: JCRNodeWrapper): SiteLanguage[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const site = renderContext.getSite() as any;
  if (!site) return [];

  const live = Boolean(renderContext.isLiveMode());
  let codes: string[];
  try {
    codes = toStrings(live ? site.getActiveLiveLanguages() : site.getLanguages()).sort();
  } catch {
    return [];
  }
  if (codes.length < 2) return [];

  // Locale objects by code, to read the display name and the page translations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locales: Record<string, any> = {};
  try {
    const siteLocales = site.getLanguagesAsLocales();
    for (let i = 0; i < siteLocales.length; i++) {
      locales[String(siteLocales[i].toString())] = siteLocales[i];
    }
  } catch {
    // labels fall back to the language code
  }

  let mixLanguages = false;
  try {
    mixLanguages = Boolean(site.isMixLanguagesActive());
  } catch {
    mixLanguages = false;
  }
  const invalid = getInvalidLanguages(mainNode);

  const isAllowed = (code: string): boolean => {
    if (!live || mixLanguages) return true;
    const locale = locales[code];
    if (!locale) return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const translation = mainNode.getI18N(locale) as any;
      return String(translation.getProperty("jcr:language").getString()) === code
        && Boolean(translation.hasProperty("j:published"))
        && Boolean(translation.getProperty("j:published").getBoolean())
        && !invalid.includes(code);
    } catch {
      return false; // no translation in that language
    }
  };

  return codes.filter(isAllowed).map((code) => {
    let label = "";
    try {
      const locale = locales[code];
      if (locale) label = String(locale.getDisplayLanguage(locale));
    } catch {
      label = "";
    }
    return { code, tag: code.replace(/_/g, "-"), label: label || code.toUpperCase() };
  });
}
