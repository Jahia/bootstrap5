/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * The part the starter templates share: the <html> element, the <head> with its resources, and the
 * start of the <body> (Bootstrap's script and the skip link). A template only adds what differs:
 * the classes of <html> and <body>, and the header, main content and footer areas (children).
 */
import type { ReactNode } from "react";
import { AddResources } from "@jahia/javascript-modules-library";
import { COLOR_MODE_SCRIPT, type ColorMode } from "../../../bootstrap5-components/src/utils/color-mode";

interface StarterPageProps {
  language: string;
  isRtl: boolean;
  colorMode: ColorMode;
  isEditMode: boolean;
  /** Content of <title> */
  title: string;
  /** Text of the skip link, translated by the template */
  skipToContentLabel: string;
  /** Class of <html>, when the template has one */
  htmlClassName?: string;
  /** Class of <body>, when the template has one */
  bodyClassName?: string;
  /** What follows the skip link: header, main landmark and footer */
  children: ReactNode;
}

export function StarterPage({
  language,
  isRtl,
  colorMode,
  isEditMode,
  title,
  skipToContentLabel,
  htmlClassName,
  bodyClassName,
  children,
}: Readonly<StarterPageProps>) {
  return (
    <html
      lang={language}
      // Default colour mode of the site; "auto" and the visitor's own choice are resolved by the script
      data-bs-theme={colorMode === "dark" ? "dark" : "light"}
      data-b5-color-mode-default={colorMode}
      className={htmlClassName}
      {...(isRtl ? { dir: "rtl" } : {})}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        {/* One stylesheet only: the right-to-left build for right-to-left languages */}
        <AddResources type="css" resources={isRtl ? "bootstrap.rtl.min.css" : "bootstrap.min.css"} />
        {/* Colour mode: applied before the page is painted (the visitor's choice, or the site default) */}
        <AddResources type="inline" targetTag="head" inlineResource={COLOR_MODE_SCRIPT} />
        {isEditMode && (
          <AddResources type="css" resources="starter-edit.css" />
        )}
        {isEditMode && (
          <AddResources
            type="javascript"
            resources="bootstrap.bundle.min.js"
            targetTag="head"
          />
        )}
      </head>
      <body className={bodyClassName}>
        {!isEditMode && (
          <AddResources
            type="javascript"
            resources="bootstrap.bundle.min.js"
            targetTag="body"
          />
        )}
        {/* First focusable element of the page: lets keyboard users jump over the header */}
        <a className="visually-hidden-focusable" href="#main">{skipToContentLabel}</a>
        {children}
      </body>
    </html>
  );
}
