/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */
import { AddResources, useServerContext } from "@jahia/javascript-modules-library";

/**
 * Tooltips of the elements marked data-b5-tooltip (text in data-bs-title).
 *
 * Bootstrap's own triggers do not meet WCAG 1.4.13 (content on hover or focus): the tooltip cannot
 * be dismissed with Escape and closes when the pointer moves onto it. It is therefore driven by
 * hand: shown on hover and on focus, kept while the pointer is on the trigger or on the tooltip,
 * hidden on blur, on leaving both, and on Escape (without moving the focus).
 * The script registers once per page, whatever the number of components that add it.
 */
const TOOLTIP_SCRIPT = `<script>
(function () {
  if (window.__bootstrap5Tooltips) { return; }
  window.__bootstrap5Tooltips = true;
  var shown = [];
  function init() {
    if (!window.bootstrap) { return; }
    document.querySelectorAll('[data-b5-tooltip]').forEach(function (trigger) {
      var tooltip = new window.bootstrap.Tooltip(trigger, {
        trigger: 'manual',
        // In the body: inserted next to its trigger, a tooltip breaks button groups and input groups
        container: 'body',
        title: trigger.getAttribute('data-bs-title') || '',
        placement: trigger.getAttribute('data-b5-tooltip-placement') || 'top'
      });
      var timer = null;
      // Tracked from the moment it is asked for: Escape must also close a tooltip that is still fading in
      function show() { clearTimeout(timer); if (shown.indexOf(hide) === -1) { shown.push(hide); } tooltip.show(); }
      function hide() { clearTimeout(timer); tooltip.hide(); }
      function hideSoon() { clearTimeout(timer); timer = setTimeout(hide, 150); }
      trigger.addEventListener('mouseenter', show);
      trigger.addEventListener('focusin', show);
      trigger.addEventListener('mouseleave', hideSoon);
      trigger.addEventListener('focusout', hide);
      trigger.addEventListener('inserted.bs.tooltip', function () {
        var tip = document.getElementById(trigger.getAttribute('aria-describedby') || '');
        if (tip && !tip.__bootstrap5Hover) {
          tip.__bootstrap5Hover = true;
          tip.addEventListener('mouseenter', function () { clearTimeout(timer); });
          tip.addEventListener('mouseleave', hideSoon);
        }
      });
      trigger.addEventListener('hidden.bs.tooltip', function () {
        var index = shown.indexOf(hide);
        if (index !== -1) { shown.splice(index, 1); }
      });
      trigger.setAttribute('data-b5-tooltip-ready', 'true');
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { shown.slice().forEach(function (hide) { hide(); }); }
    });
  }
  // As soon as the document is parsed: Bootstrap's script is loaded before this one
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
</script>`;

/** Adds the tooltip script to the page (once). */
export const TooltipScript = () => {
  const { renderContext } = useServerContext();
  return (
    <AddResources
      type="inline"
      targetTag={renderContext.isEditMode() ? "head" : "body"}
      inlineResource={TOOLTIP_SCRIPT}
    />
  );
};
