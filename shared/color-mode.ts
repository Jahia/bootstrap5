/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * Colour mode (Bootstrap's data-bs-theme on <html>): light, dark, or auto, which follows the
 * visitor's system setting.
 *
 * - The default comes from the site (data-b5-color-mode-default on <html>, written by the page
 *   template); a visitor's own choice, made with the switcher of the navbar, is kept in
 *   localStorage and wins.
 * - The switcher is a set of buttons carrying data-bs-theme-value. The script keeps their
 *   aria-pressed state, the check mark and the name of the toggle in sync, and gives the focus
 *   back to the toggle after a choice.
 *
 * The same script is added by the page templates (in the head, so the page does not flash in the
 * wrong mode) and by the navbar (for template sets that do not add it). It registers once.
 */
export const COLOR_MODE_SCRIPT = `<script>
(function () {
  if (window.__bootstrap5ColorMode) { return; }
  window.__bootstrap5ColorMode = true;
  var KEY = 'bootstrap5-color-mode';
  var MODES = ['light', 'dark', 'auto'];
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function valid(mode) { return MODES.indexOf(mode) !== -1 ? mode : null; }
  function stored() { try { return valid(window.localStorage.getItem(KEY)); } catch (e) { return null; } }
  function store(mode) { try { window.localStorage.setItem(KEY, mode); } catch (e) { /* private mode */ } }
  function current() { return stored() || valid(root.getAttribute('data-b5-color-mode-default')) || 'light'; }
  function apply(mode) {
    root.setAttribute('data-bs-theme', mode === 'auto' ? (media && media.matches ? 'dark' : 'light') : mode);
  }
  function sync(mode) {
    var activeLabel = '';
    document.querySelectorAll('[data-bs-theme-value]').forEach(function (button) {
      var active = button.getAttribute('data-bs-theme-value') === mode;
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.classList.toggle('active', active);
      var check = button.querySelector('[data-b5-color-mode-check]');
      if (check) { check.hidden = !active; }
      if (active) { activeLabel = button.getAttribute('data-b5-color-mode-label') || ''; }
    });
    document.querySelectorAll('[data-b5-color-mode-name]').forEach(function (name) {
      name.textContent = name.getAttribute('data-b5-color-mode-title') + ': ' + activeLabel;
    });
  }
  apply(current());
  if (media && media.addEventListener) {
    media.addEventListener('change', function () { if (current() === 'auto') { apply('auto'); } });
  }
  document.addEventListener('click', function (event) {
    var button = event.target && event.target.closest ? event.target.closest('[data-bs-theme-value]') : null;
    var mode = button ? valid(button.getAttribute('data-bs-theme-value')) : null;
    if (!mode) { return; }
    store(mode);
    apply(mode);
    sync(mode);
    var dropdown = button.closest('.dropdown');
    var toggle = dropdown ? dropdown.querySelector('[data-bs-toggle="dropdown"]') : null;
    if (toggle) { toggle.focus(); }
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { sync(current()); });
  } else {
    sync(current());
  }
})();
</script>`;

/** The colour modes a site or a visitor can choose. */
export const COLOR_MODES = ["light", "dark", "auto"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

/** Reads the default colour mode of a site (bootstrap5mix:siteColorMode); "light" when not set. */
export function getSiteColorMode(site: { isNodeType(type: string): boolean; getPropertyAsString(name: string): string | null } | null | undefined): ColorMode {
  try {
    if (site?.isNodeType("bootstrap5mix:siteColorMode")) {
      const mode = site.getPropertyAsString("colorMode");
      if (mode === "dark" || mode === "auto") return mode;
    }
  } catch {
    // unreadable site settings: the light mode
  }
  return "light";
}
