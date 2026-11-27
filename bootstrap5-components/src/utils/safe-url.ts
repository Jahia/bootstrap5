/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/** Schemes a link set by an editor may use; anything else (javascript:, data:, vbscript:…) is refused. */
const SAFE_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

/** A scheme is only present when the ":" comes before any "/", "?" or "#". */
const URL_SCHEME = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;

/** Browsers ignore ASCII control characters and whitespace inside a scheme ("java\tscript:"). */
// eslint-disable-next-line no-control-regex
const CONTROL_AND_SPACE = /[\u0000- \u007F]+/g;

/**
 * Returns the URL an editor set when it is relative or uses a safe scheme, and "#" otherwise, so that
 * a link cannot run script when followed. Same rules as the 2.x b5:safeUrl JSP function.
 */
export function safeUrl(url: string | null | undefined): string {
  const trimmed = (url ?? "").trim();
  if (trimmed === "") {
    return "#";
  }
  const scheme = URL_SCHEME.exec(trimmed.replaceAll(CONTROL_AND_SPACE, ""));
  if (!scheme) {
    return trimmed;
  }
  return SAFE_SCHEMES.has(scheme[1].toLowerCase()) ? trimmed : "#";
}
