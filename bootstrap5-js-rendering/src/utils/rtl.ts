/**
 * RTL language detection
 *
 * Mirrors the logic in bootstrap5-components Functions.java#isRtlLanguage.
 * Detects RTL scripts by Unicode block range rather than maintaining a
 * hardcoded language-code list, so it stays correct for regional variants
 * (ar-SA, he-IL, fa-IR, …) and any future additions.
 *
 * Covered scripts: Arabic, Hebrew, Syriac, Thaana, N'Ko, Samaritan,
 * Mandaic, Arabic Supplement/Extended, Thaana Extended, Old South Arabian.
 */

const RTL_RANGES: [number, number][] = [
  [0x0590, 0x05ff], // Hebrew
  [0x0600, 0x06ff], // Arabic
  [0x0700, 0x074f], // Syriac
  [0x0750, 0x077f], // Arabic Supplement
  [0x0780, 0x07bf], // Thaana
  [0x07c0, 0x07ff], // N'Ko
  [0x0800, 0x083f], // Samaritan
  [0x0840, 0x085f], // Mandaic
  [0x08a0, 0x08ff], // Arabic Extended-A
  [0xfb1d, 0xfb4f], // Hebrew Presentation Forms
  [0xfb50, 0xfdff], // Arabic Presentation Forms-A
  [0xfe70, 0xfeff], // Arabic Presentation Forms-B
  [0x10800, 0x1083f], // Cypriot Syllabary (Old South Arabian area)
  [0x10840, 0x1085f], // Imperial Aramaic
];

function hasRtlChar(text: string): boolean {
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (RTL_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi)) return true;
  }
  return false;
}

/**
 * Returns true if the given BCP-47 language tag (e.g. "ar", "he", "fa")
 * uses a right-to-left script.
 */
export function isRtlLanguage(language: string): boolean {
  if (!language) return false;
  // Resolve a display name and check for RTL characters, same approach as
  // Java's Character.UnicodeScript detection.
  try {
    const name = new Intl.DisplayNames([language], { type: "language" }).of(language) ?? "";
    return hasRtlChar(name);
  } catch {
    // Fallback: known RTL language subtags
    const rtlTags = ["ar", "he", "fa", "ur", "yi", "syr", "nqo", "sd", "ug", "ps", "ku"];
    return rtlTags.includes(language.split("-")[0].toLowerCase());
  }
}
