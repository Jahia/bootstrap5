/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * Class of a text colour chosen by an editor. "muted" is stored by existing content: text-muted is
 * deprecated since Bootstrap 5.3 and replaced by text-body-secondary, which follows the colour mode.
 */
export function textColorClass(color: string | null | undefined): string {
  if (!color) return "";
  return color === "muted" ? "text-body-secondary" : `text-${color}`;
}
