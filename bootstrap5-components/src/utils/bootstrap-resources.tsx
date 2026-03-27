/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * Shared Bootstrap resource helpers.
 *
 * CSS (bootstrap.min.css) is loaded globally by bootstrap5nt_version/html/version.jsp.
 * JS (bootstrap.bundle.min.js) must be declared per-component; Jahia deduplicates it
 * so the file is only sent once even when multiple components request it.
 */
import { AddResources, useServerContext } from "@jahia/javascript-modules-library";

/**
 * Emits bootstrap.bundle.min.js.
 * - Live mode  → targetTag="body"  (deferred, after page content)
 * - Edit mode  → targetTag="head"  (Jahia edit frame requires scripts in <head>)
 * Jahia deduplicates the resource automatically across multiple components.
 */
export const BootstrapJS = () => {
  const { renderContext } = useServerContext();
  const targetTag = renderContext.isEditMode() ? "head" : "body";
  return <AddResources type="javascript" resources="bootstrap.bundle.min.js" targetTag={targetTag} />;
};
