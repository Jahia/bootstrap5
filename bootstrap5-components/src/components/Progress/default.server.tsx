/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:progress — a progress bar showing a value set by the editor (static content, not a
 * live indicator).
 */
import { jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";

interface ProgressProps {
  /**
   * What the bar measures: its accessible name. A field of its own, placed after the value in the
   * form: with the title as first field, editors typed the value in it. The type keeps mix:title
   * (hidden in the form) so that the node is named like the other components.
   */
  label?: string;
  value?: number;
  max?: number;
  color?: string;
  striped?: boolean;
  showValue?: boolean;
}

/** Contextual colours offered by the choicelist; anything else renders the default bar. */
const COLORS = new Set(["success", "info", "warning", "danger"]);

jahiaComponent(
  {
    nodeType: "bootstrap5nt:progress",
    componentType: "view",
    name: "default",
    displayName: "Progress bar",
  },
  ({ label, value, max, color, striped, showValue }: ProgressProps) => {
    const { t } = useTranslation();

    const maximum = Number(max) > 0 ? Number(max) : 100;
    const current = Math.min(Math.max(Number(value) || 0, 0), maximum);
    const percent = Math.round((current / maximum) * 100);

    // text-bg-* sets a text colour that contrasts with the fill (bg-warning / bg-info with the
    // default white text do not)
    const barClass = [
      "progress-bar",
      color && COLORS.has(color) ? `text-bg-${color}` : undefined,
      striped ? "progress-bar-striped" : undefined,
    ].filter(Boolean).join(" ");

    return (
      // The role, name and values are on the wrapper (Bootstrap 5.3), not on the inner bar.
      // A progress bar must have a name: the editor's label, or a translated default.
      <div
        className="progress"
        role="progressbar"
        aria-label={(label ?? "").trim() || t("bootstrap5nt_progress.label.default")}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={maximum}
        {...(maximum === 100 ? {} : { "aria-valuetext": `${percent}%` })}
      >
        <div className={barClass} style={{ width: `${percent}%` }}>
          {showValue ? `${percent}%` : null}
        </div>
      </div>
    );
  },
);
