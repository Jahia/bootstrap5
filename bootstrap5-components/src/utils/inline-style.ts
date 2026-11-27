/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */
import type { CSSProperties } from "react";

/** Splits on `separator`, ignoring the ones inside parentheses or quotes (url(data:…;base64,…)). */
function splitOutside(value: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote = "";
  let current = "";
  for (const char of value) {
    if (quote) {
      if (char === quote) quote = "";
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth = Math.max(0, depth - 1);
    } else if (char === separator && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  parts.push(current);
  return parts;
}

/**
 * Turns the inline CSS an editor typed ("color: red; margin-top: 1rem") into the object React's
 * `style` prop requires. 2.x wrote the string as-is into the style attribute; React throws when it
 * is given a string. Returns undefined when there is no usable declaration.
 */
export function parseInlineStyle(css: string | null | undefined): CSSProperties | undefined {
  if (!css) return undefined;
  const style: Record<string, string> = {};
  for (const declaration of splitOutside(css, ";")) {
    const colon = declaration.indexOf(":");
    if (colon < 1) continue;
    const property = declaration.slice(0, colon).trim();
    const value = declaration.slice(colon + 1).trim();
    if (!property || !value || !/^-{0,2}[a-zA-Z][a-zA-Z0-9-]*$/.test(property)) continue;
    // Custom properties keep their name; the others become camelCase (-webkit-x → WebkitX, -ms-x → msX)
    const name = property.startsWith("--")
      ? property
      : property
        .toLowerCase()
        .replace(/^-ms-/, "ms-")
        .replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
    style[name] = value;
  }
  return Object.keys(style).length > 0 ? (style as CSSProperties) : undefined;
}
