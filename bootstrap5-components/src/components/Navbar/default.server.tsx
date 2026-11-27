/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:navbar — responsive navigation bar with brand, multi-level nav items,
 * optional login modal, and language switcher.
 * Site-level bootstrap5mix:siteBrand overrides component-level brand settings.
 * The navigation tree is the port of the 2.x "basenav-multilevel" view: up to maxlevel (1 to 5)
 * levels, .active on the current page and .inpath on its ancestors.
 */
import { AddResources, buildNodeUrl, getChildNodes, jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { COLOR_MODE_SCRIPT, COLOR_MODES, getSiteColorMode } from "../../utils/color-mode.js";
import { getInvalidLanguages, getSiteLanguages } from "../../utils/languages.js";
import { safeUrl } from "../../utils/safe-url.js";
import { BootstrapJS } from "../../utils/bootstrap-resources.js";
import { getReferencedNode } from "../../utils/node.js";

// ─── Nav item URL/title resolution ─────────────────────────────────────────

interface NavItem {
  url: string;
  title: string;
  /** Exact match — this IS the current page */
  isActive: boolean;
  /** Ancestor of the current page (in path but not current) */
  isInPath: boolean;
  node: JCRNodeWrapper;
}

function resolveNavItem(
  page: JCRNodeWrapper,
  mainResourcePath: string,
): NavItem | null {
  let url = "#";
  let title = page.getDisplayableName();

  if (page.isNodeType("jnt:navMenuText")) {
    // a menu text has no page of its own: the URL stays "#"
  } else if (page.isNodeType("jnt:externalLink")) {
    // safeUrl: an editor-set javascript:/data: URL becomes "#" (as in 2.x)
    url = safeUrl(page.getPropertyAsString("j:url"));
  } else if (page.isNodeType("jnt:page")) {
    url = buildNodeUrl(page);
    title = page.getDisplayableName();
  } else if (page.isNodeType("jnt:nodeLink")) {
    const jNodeProp = page.hasProperty("j:node") ? page.getProperty("j:node") : undefined;
    const linkedNode = jNodeProp ? jNodeProp.getNode() as JCRNodeWrapper : undefined;
    if (linkedNode) {
      url = buildNodeUrl(linkedNode);
      title = page.getPropertyAsString("jcr:title") || linkedNode.getDisplayableName();
    }
  } else {
    return null;
  }

  const pagePath = page.getPath();
  const isActive = mainResourcePath === pagePath;
  const isInPath = !isActive && mainResourcePath.startsWith(pagePath + "/");
  return { url, title, isActive, isInPath, node: page };
}

/**
 * Returns true when the page should appear in this navbar.
 * JSP: j:displayInMenuName is a multi-value property; page is shown when
 * the property is empty OR when the current navbar name is in the list.
 */
/**
 * Whether this server only receives publications (remote publication target). SettingsBean is a Java
 * host object: GraalVM refuses optional-chained calls on it ("execute ... Message not supported"),
 * so the method is called plainly; if it cannot be read, the server is treated as an authoring one
 * (the links stay gated by the jContentAccess / contributeModeAccess permissions anyway).
 */
function isDistantPublicationServer(renderContext: { getSettings(): unknown }): boolean {
  try {
    const settings = renderContext.getSettings() as { isDistantPublicationServerMode(): boolean };
    return Boolean(settings.isDistantPublicationServerMode());
  } catch {
    return false;
  }
}

/** Whether the page's site is a remote publication copy (jmix:remotelyPublished), called plainly (see above). */
function isRemotelyPublished(page: JCRNodeWrapper): boolean {
  try {
    const site = page.getResolveSite();
    return site?.isNodeType("jmix:remotelyPublished") ?? false;
  } catch {
    return false;
  }
}

function isDisplayedInMenu(page: JCRNodeWrapper, navbarName: string): boolean {
  if (!page.hasProperty("j:displayInMenuName")) return true;
  // As the 2.x view: once the property is set, the page only shows in the menus it lists
  const values = (page.getProperty("j:displayInMenuName") as any).getValues() as { getString: () => string }[];
  if (!values) return false;
  for (const value of values) {
    if (String(value.getString() ?? "").trim() === navbarName) return true;
  }
  return false;
}

// ─── View helpers ───────────────────────────────────────────────────────────

type ServerContext = ReturnType<typeof useServerContext>;
type RenderContext = ServerContext["renderContext"];
type Translate = (key: string) => string;

interface BrandSettings {
  brandImage?: JCRNodeWrapper;
  brandImageMobile?: JCRNodeWrapper;
  brandText: string;
}

/** Brand resolution: site overrides component. */
function resolveBrand(siteNode: JCRNodeWrapper | undefined, currentNode: JCRNodeWrapper): BrandSettings {
  if (siteNode?.isNodeType("bootstrap5mix:siteBrand")) {
    return {
      brandImage: getReferencedNode(siteNode, "brandImage"),
      brandImageMobile: getReferencedNode(siteNode, "brandImageMobile"),
      brandText: siteNode.getPropertyAsString("brandText") ?? "",
    };
  }
  if (currentNode.isNodeType("bootstrap5mix:brand")) {
    return {
      brandImage: getReferencedNode(currentNode, "brandImage"),
      brandImageMobile: getReferencedNode(currentNode, "brandImageMobile"),
      brandText: currentNode.getPropertyAsString("brandText") ?? "",
    };
  }
  return { brandText: "" };
}

interface GlobalSettings {
  addContainerWithinTheNavbar: boolean;
  addLoginButton: boolean;
  addLanguageButton: boolean;
  addColorModeButton: boolean;
  maxlevel: number;
  root: string;
}

/** Global settings (bootstrap5mix:navbarGlobalSettings) and the root of the menu. */
function resolveGlobalSettings(currentNode: JCRNodeWrapper): GlobalSettings {
  // Without bootstrap5mix:navbarGlobalSettings 2.x rendered no container (login and languages on)
  const settings: GlobalSettings = {
    addContainerWithinTheNavbar: false,
    addLoginButton: true,
    addLanguageButton: true,
    addColorModeButton: false,
    maxlevel: 2,
    // "root" is a property of bootstrap5nt:navbar itself, not of the global settings mixin
    root: currentNode.hasProperty("root") ? (currentNode.getPropertyAsString("root") ?? "") : "",
  };

  if (currentNode.isNodeType("bootstrap5mix:navbarGlobalSettings")) {
    settings.addContainerWithinTheNavbar =
      currentNode.getPropertyAsString("addContainerWithinTheNavbar") !== "false";
    settings.addLoginButton = currentNode.getPropertyAsString("addLoginButton") !== "false";
    settings.addLanguageButton = currentNode.getPropertyAsString("addLanguageButton") !== "false";
    settings.addColorModeButton = currentNode.getPropertyAsString("addColorModeButton") === "true";
    settings.maxlevel = Number.parseInt(currentNode.getPropertyAsString("maxlevel") ?? "2", 10) || 2;
  }
  return settings;
}

interface NavClasses {
  navClass: string;
  divClass: string;
  togglerClass: string;
  brandLinkClass: string;
  ulClass: string;
  liClass: string;
  navLinkClass: string;
  loginMenuULClass: string;
}

/** Customize classes (bootstrap5mix:customizeNavbar). */
function resolveNavClasses(currentNode: JCRNodeWrapper): NavClasses {
  const classes: NavClasses = {
    // navbar-light is deprecated (and has no rule left in the CSS); bg-body-tertiary is the same
    // light grey as bg-light in light mode, and follows the colour mode
    navClass: "navbar navbar-expand-lg bg-body-tertiary",
    divClass: "collapse navbar-collapse",
    togglerClass: "navbar-toggler",
    brandLinkClass: "navbar-brand",
    ulClass: "navbar-nav me-auto",
    liClass: "nav-item",
    navLinkClass: "nav-link",
    loginMenuULClass: "navbar-nav ms-auto",
  };

  if (currentNode.isNodeType("bootstrap5mix:customizeNavbar")) {
    for (const key of Object.keys(classes) as (keyof NavClasses)[]) {
      classes[key] = currentNode.getPropertyAsString(key) || classes[key];
    }
  }
  return classes;
}

/** Expand breakpoint (e.g. "lg" from "navbar-expand-lg"). */
function resolveExpand(navClass: string): string {
  for (const cls of navClass.split(" ")) {
    if (cls.startsWith("navbar-expand-")) {
      return cls.replace("navbar-expand-", "");
    }
  }
  return "lg";
}

/** Resolve current page node (walk up to jmix:navMenuItem if needed). */
function resolveCurrentPageNode(mainNode: JCRNodeWrapper): JCRNodeWrapper {
  let currentPageNode: JCRNodeWrapper = mainNode;
  if (!currentPageNode.isNodeType("jmix:navMenuItem")) {
    currentPageNode = (currentPageNode.getAncestors() as unknown as JCRNodeWrapper[])
      .reverse()
      .find((n) => n.isNodeType("jmix:navMenuItem")) ?? currentPageNode;
  }
  return currentPageNode;
}

function resolveHomeNode(
  siteNode: JCRNodeWrapper | undefined,
  renderContext: RenderContext,
): JCRNodeWrapper | undefined {
  const site: any = siteNode ?? renderContext.getSite();
  return site ? site.getHome() as JCRNodeWrapper : undefined;
}

/** Brand link target, as 2.x navbar.jsp: the current or parent page, the home page otherwise. */
function resolveRootNode(
  root: string,
  currentPageNode: JCRNodeWrapper,
  homeNode: JCRNodeWrapper | undefined,
): JCRNodeWrapper | undefined {
  let rootNode: JCRNodeWrapper | undefined;
  if (root === "currentPage") {
    rootNode = currentPageNode;
  } else if (root === "parentPage") {
    try {
      rootNode = currentPageNode.getParent() as JCRNodeWrapper | undefined;
    } catch {
      rootNode = undefined;
    }
  }
  rootNode ??= homeNode;
  return rootNode;
}

/**
 * Start of the menu, as the 2.x basenav-multilevel view: the page displayed, its parent, the
 * custom root page (no menu when it is not set or gone), the home page otherwise.
 */
function resolveMenuRootNode(
  root: string,
  mainNode: JCRNodeWrapper,
  currentNode: JCRNodeWrapper,
  homeNode: JCRNodeWrapper | undefined,
): JCRNodeWrapper | undefined {
  if (root === "currentPage") return mainNode;
  if (root === "parentPage") {
    try {
      return mainNode.getParent() as JCRNodeWrapper | undefined;
    } catch {
      return undefined;
    }
  }
  if (root === "customRootPage") return getReferencedNode(currentNode, "customRootPage");
  return homeNode;
}

/** Root node URL (site home gets site.home.url). */
function resolveRootNodeUrl(
  rootNode: JCRNodeWrapper | undefined,
  homeNode: JCRNodeWrapper | undefined,
): string {
  if (!rootNode) return "#";
  if (rootNode.isNodeType("jnt:virtualsite")) {
    return homeNode ? buildNodeUrl(homeNode) : "#";
  }
  return buildNodeUrl(rootNode);
}

// ─── Navigation tree ────────────────────────────────────────────────────────

interface MenuContext {
  currentNode: JCRNodeWrapper;
  liClass: string;
  navLinkClass: string;
  maxlevel: number;
  mainResourcePath: string;
  navbarName: string;
}

const navChildren = (parent: JCRNodeWrapper): JCRNodeWrapper[] =>
  getChildNodes(parent, 100).filter((n) => n.isNodeType("jmix:navMenuItem"));

function itemStateClass(item: NavItem): string {
  const inPathClass = item.isInPath ? " inpath" : "";
  return item.isActive ? " active" : inPathClass;
}

function renderSimpleItem(ctx: MenuContext, item: NavItem, level: number, key: string): ReactNode {
  const stateClass = itemStateClass(item);
  const current = item.isActive ? { "aria-current": "page" as const } : {};
  return level === 1 ? (
    <li key={key} className={ctx.liClass}>
      <a className={`${ctx.navLinkClass}${stateClass}`} href={item.url} {...current}>{item.title}</a>
    </li>
  ) : (
    <li key={key}>
      <a className={`dropdown-item${stateClass}`} href={item.url} {...current}>{item.title}</a>
    </li>
  );
}

/** Top-level entry with a dropdown. */
function renderDropdownEntry(
  ctx: MenuContext,
  page: JCRNodeWrapper,
  item: NavItem,
  level: number,
  ownLink: ReactNode,
): ReactNode {
  const pageId = page.getIdentifier();
  const stateClass = itemStateClass(item);
  const dropId = `dropdown-${ctx.currentNode.getIdentifier()}-${pageId}`;
  return (
    <li key={pageId} className={`${ctx.liClass} dropdown`}>
      <a
        className={`${ctx.navLinkClass} dropdown-toggle${stateClass}`}
        href="#"
        id={dropId}
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        {...(ctx.maxlevel >= 3 ? { "data-bs-auto-close": "outside" } : {})}
      >
        {item.title}
      </a>
      <ul className="dropdown-menu" aria-labelledby={dropId}>
        {ownLink}
        {renderMenu(ctx, page, level + 1)}
      </ul>
    </li>
  );
}

/**
 * Level 2 and below: same structure as 2.x (li.dropend > a + ul.submenu) so that
 * multilevel-nav.css / multilevel-nav.js and site CSS apply
 */
function renderDropendEntry(
  ctx: MenuContext,
  page: JCRNodeWrapper,
  item: NavItem,
  level: number,
  ownLink: ReactNode,
): ReactNode {
  const pageId = page.getIdentifier();
  const stateClass = itemStateClass(item);
  const dropendId = `dropend-${ctx.currentNode.getIdentifier()}-${pageId}`;
  return (
    <li key={pageId} className="dropend">
      <a
        className={`dropdown-item dropdown-toggle${stateClass}`}
        href={item.url}
        id={dropendId}
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {item.title}
      </a>
      <ul className="submenu dropdown-menu" aria-labelledby={dropendId}>
        {ownLink}
        {renderMenu(ctx, page, level + 1)}
      </ul>
    </li>
  );
}

function renderMenuEntry(ctx: MenuContext, page: JCRNodeWrapper, level: number): ReactNode {
  if (!isDisplayedInMenu(page, ctx.navbarName)) return null;
  const item = resolveNavItem(page, ctx.mainResourcePath);
  if (!item) return null;
  const pageId = page.getIdentifier();
  if (level >= ctx.maxlevel || navChildren(page).length === 0) {
    return renderSimpleItem(ctx, item, level, pageId);
  }

  // A menu text has no page of its own: no link to it inside its own menu.
  // The link is rendered with the classes of the level of the page, as 2.x did: inside a
  // top-level dropdown it is a .nav-item / .nav-link, which is what 2.x sites are styled for.
  const ownLink = page.isNodeType("jnt:navMenuText") ? null : (
    <>
      {renderSimpleItem(ctx, item, level, `${pageId}-self`)}
      <li><hr className="dropdown-divider" /></li>
    </>
  );

  return level === 1
    ? renderDropdownEntry(ctx, page, item, level, ownLink)
    : renderDropendEntry(ctx, page, item, level, ownLink);
}

/** Renders the menu items below `parent`, level after level, down to maxlevel. */
function renderMenu(ctx: MenuContext, parent: JCRNodeWrapper, level: number): ReactNode[] {
  return navChildren(parent).map((page) => renderMenuEntry(ctx, page, level));
}

// ─── Language switcher ──────────────────────────────────────────────────────

interface LanguageState {
  currentLang: string;
  siteLanguages: ReturnType<typeof getSiteLanguages>;
  otherLanguages: ReturnType<typeof getSiteLanguages>;
}

/**
 * What ui:initLangBarAttributes computed in 2.x: in live, only the active languages in which
 * the page is published; the page's invalidated languages are left out in every mode
 */
function resolveLanguages(
  renderContext: RenderContext,
  mainNode: JCRNodeWrapper,
  addLanguageButton: boolean,
): LanguageState {
  const currentLocale = renderContext.getMainResourceLocale();
  const currentLang: string = currentLocale ? String(currentLocale.getLanguage()).toLowerCase() : "";
  const currentLocaleCode: string = currentLocale && typeof (currentLocale as any).toString === "function"
    ? String((currentLocale as any).toString())
    : currentLang;
  const siteLanguages = addLanguageButton ? getSiteLanguages(renderContext, mainNode) : [];
  const invalidLangs = getInvalidLanguages(mainNode);
  const otherLanguages = siteLanguages.filter(
    (language) => language.code !== currentLocaleCode && language.code !== currentLang
      && !invalidLangs.includes(language.code),
  );
  return { currentLang, siteLanguages, otherLanguages };
}

// ─── Login state ────────────────────────────────────────────────────────────

interface LoginState {
  isLoggedIn: boolean;
  username: string;
  logoutUrl: string;
  liveUrl: string;
  previewUrl: string;
  editUrl: string;
  contributeUrl: string;
  loginNodeId: string;
  loginAction: string;
  siteKey: string;
  currentPageUrl: string;
  loginError: string;
  loginErrorAttribute: Record<string, string>;
  showWorkspaceLinks: boolean;
  canUseJContent: boolean;
  canContribute: boolean;
}

function resolveLoginState(
  renderContext: RenderContext,
  currentNode: JCRNodeWrapper,
  mainNode: JCRNodeWrapper,
  siteNode: JCRNodeWrapper | undefined,
): LoginState {
  const isLoggedIn: boolean = renderContext.isLoggedIn() as unknown as boolean;
  const currentUser = renderContext.getUser();
  const username: string = currentUser ? String(currentUser.getUsername()) : "";
  const urlGen = renderContext.getURLGenerator();
  const logoutUrl: string = urlGen ? String(urlGen.getLogout()) : "#";
  const liveUrl: string = urlGen ? String(urlGen.getLive()) : "#";
  const previewUrl: string = urlGen ? String(urlGen.getPreview()) : "#";
  const editUrl: string = urlGen ? String(urlGen.getEdit()) : "#";
  const loginNodeId = `login-${currentNode.getIdentifier()}`;
  // ui:loginArea equivalent: POST to Jahia's login servlet, back to this page on success or failure
  const request = renderContext.getRequest();
  const loginAction = `${request.getContextPath()}/cms/login`;
  const siteKey = siteNode ? String((siteNode as any).getSiteKey()) : "";
  const currentPageUrl = buildNodeUrl(mainNode);
  // Jahia's login valve sends back a failed login with ?loginError=bad_password / account_locked
  const loginError = String(request.getParameter("loginError") ?? "");
  // data-b5-login-error marks the modal the constant script below reopens
  const loginErrorAttribute: Record<string, string> = loginError
    ? { "aria-describedby": `${loginNodeId}-error`, "data-b5-login-error": "true" }
    : {};
  // Workspace links, as 2.x: not on a remote publication server nor on content published from live
  const showWorkspaceLinks = !isDistantPublicationServer(renderContext)
    && mainNode.getPropertyAsString("j:originWS") !== "live"
    && !isRemotelyPublished(mainNode);
  const canUseJContent = mainNode.hasPermission("jContentAccess");
  const canContribute = mainNode.hasPermission("contributeModeAccess");
  const contributeUrl: string = urlGen ? String(urlGen.getContribute()) : "#";
  return {
    isLoggedIn, username, logoutUrl, liveUrl, previewUrl, editUrl, contributeUrl, loginNodeId,
    loginAction, siteKey, currentPageUrl, loginError, loginErrorAttribute, showWorkspaceLinks,
    canUseJContent, canContribute,
  };
}

// ─── Rendering ──────────────────────────────────────────────────────────────

/** Everything the rendering helpers need, computed once at the top of the view (hooks included). */
interface NavbarView {
  t: Translate;
  renderContext: RenderContext;
  currentNode: JCRNodeWrapper;
  mainNode: JCRNodeWrapper;
  siteNode: JCRNodeWrapper | undefined;
  isEditMode: boolean;
  navbarId: string;
  expand: string;
  brand: BrandSettings;
  settings: GlobalSettings;
  classes: NavClasses;
  menuRootNode: JCRNodeWrapper | undefined;
  rootNodeUrl: string;
  menuCtx: MenuContext;
  languages: LanguageState;
  login: LoginState;
}

function renderBrandImage(v: NavbarView, brandImage: JCRNodeWrapper) {
  const { brand, siteNode, expand } = v;
  // As in 2.x: a logo without brand text is the link's only content, so it carries the site name
  const alt = brand.brandText ? "" : (siteNode?.getDisplayableName() ?? "");
  const desktopUrl = buildNodeUrl(brandImage);
  if (brand.brandImageMobile) {
    const mobileUrl = buildNodeUrl(brand.brandImageMobile);
    return (
      <>
        <img src={desktopUrl} className={`align-top d-none d-${expand}-inline-block`} alt={alt} />
        <img src={mobileUrl} className={`align-top d-inline-block d-${expand}-none`} alt={alt} />
      </>
    );
  }
  return <img src={desktopUrl} className="d-inline-block align-top" alt={alt} />;
}

function renderBrandLink(v: NavbarView) {
  const { brand, siteNode, classes, rootNodeUrl } = v;
  const { brandImage, brandText } = brand;
  return (
    <>
      {/* Brand link */}
      {/* A brand link without image nor text is an empty link: it is then named after the site */}
      <a
        className={classes.brandLinkClass}
        href={rootNodeUrl}
        {...(!brandImage && !brandText ? { "aria-label": siteNode?.getDisplayableName() ?? "" } : {})}
      >
        {brandImage && renderBrandImage(v, brandImage)}
        {/* Only the configured brand text, as in 2.x: no brand settings, no text */}
        {brandText}
      </a>
    </>
  );
}

function renderToggler(v: NavbarView) {
  const { t, classes, navbarId } = v;
  return (
    <button
      className={classes.togglerClass}
      type="button"
      data-bs-toggle="collapse"
      data-bs-target={`#${navbarId}`}
      aria-controls={navbarId}
      aria-expanded="false"
      aria-label={t("bootstrap5nt_navbar.label.toggle")}
    >
      <span className="navbar-toggler-icon" aria-hidden="true" />
    </button>
  );
}

function renderWorkspaceLinks(v: NavbarView) {
  const { t, renderContext, isEditMode, login } = v;
  const { liveUrl, previewUrl, editUrl, contributeUrl, canUseJContent, canContribute } = login;
  return (
    <>
      {!renderContext.isLiveMode() && (
        <li>
          <a href={liveUrl} className="dropdown-item text-primary">
            {t("bootstrap5nt_navbar.label.live")}
          </a>
        </li>
      )}
      {!renderContext.isPreviewMode() && canUseJContent && (
        <li>
          <a href={previewUrl} className="dropdown-item text-secondary">
            {t("bootstrap5nt_navbar.label.preview")}
          </a>
        </li>
      )}
      {!isEditMode && canUseJContent && (
        <li>
          <a href={editUrl} className="dropdown-item text-success">
            {t("bootstrap5nt_navbar.label.edit")}
          </a>
        </li>
      )}
      {!isEditMode && !canUseJContent && canContribute && (
        <li>
          <a href={contributeUrl} className="dropdown-item">
            {t("bootstrap5nt_navbar.label.contribute")}
          </a>
        </li>
      )}
    </>
  );
}

function renderUserMenu(v: NavbarView) {
  const { t, currentNode, classes, login } = v;
  return (
    <ul className={classes.loginMenuULClass}>
      <li className="nav-item dropdown">
        <a
          className="nav-item nav-link dropdown-toggle me-md-2"
          href="#"
          id={`list-${currentNode.getIdentifier()}`}
          data-bs-toggle="dropdown"
          aria-expanded="false"
          role="button"
        >
          {login.username}
        </a>
        <ul
          className="dropdown-menu dropdown-menu-end"
          aria-labelledby={`list-${currentNode.getIdentifier()}`}
        >
          {login.showWorkspaceLinks && renderWorkspaceLinks(v)}
          <li><hr className="dropdown-divider" /></li>
          <li>
            <a className="dropdown-item logout" href={login.logoutUrl}>
              {t("bootstrap5nt_navbar.label.logout")}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  );
}

function renderLoginFields(v: NavbarView) {
  const { t, currentNode, login } = v;
  const { loginNodeId, loginError } = login;
  return (
    <>
      {loginError && (
        <div className="alert alert-danger" role="alert" id={`${loginNodeId}-error`}>
          {t(loginError === "account_locked" ? "message.accountLocked" : "message.invalidUsernamePassword")}
        </div>
      )}
      <label htmlFor={`username-${currentNode.getIdentifier()}`} className="visually-hidden">
        {t("label.username")}
      </label>
      <div className="input-group mb-3">
        <span className="input-group-text" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          </svg>
        </span>
        <input
          type="text"
          className="form-control"
          id={`username-${currentNode.getIdentifier()}`}
          name="username"
          autoComplete="username"
          placeholder={t("label.username")}
          required
          data-b5-autofocus="true"
        />
      </div>
      <label htmlFor={`password-${currentNode.getIdentifier()}`} className="visually-hidden">
        {t("label.password")}
      </label>
      <div className="input-group mb-3">
        <span className="input-group-text" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-key-fill" viewBox="0 0 16 16">
            <path d="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2zM2.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          </svg>
        </span>
        <input
          type="password"
          className="form-control"
          id={`password-${currentNode.getIdentifier()}`}
          name="password"
          autoComplete="current-password"
          placeholder={t("label.password")}
          required
        />
      </div>
      <div className="form-check">
        <input className="form-check-input" type="checkbox" id={`useCookie-${currentNode.getIdentifier()}`} name="useCookie" />
        <label className="form-check-label" htmlFor={`useCookie-${currentNode.getIdentifier()}`}>
          {t("loginForm.rememberMe.label")}
        </label>
      </div>
    </>
  );
}

function renderLoginModal(v: NavbarView) {
  const { t, login } = v;
  const { loginNodeId, loginAction, siteKey, currentPageUrl, loginErrorAttribute } = login;
  return (
    <div
      className="modal fade"
      id={loginNodeId}
      tabIndex={-1}
      aria-labelledby={`${loginNodeId}-label`}
      {...loginErrorAttribute}
      aria-hidden="true"
    >
      {/* What ui:loginArea rendered: Jahia's login servlet, the site, and where to go back */}
      {/* Bootstrap's structure is .modal > .modal-dialog > .modal-content: the form is the
          modal content itself (a form around the dialog breaks its vertical centring) */}
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <form className="modal-content" action={loginAction} method="post" name="loginForm">
          <input type="hidden" name="site" value={siteKey} />
          <input type="hidden" name="redirect" value={currentPageUrl} />
          <input type="hidden" name="failureRedirect" value={currentPageUrl} />
          <div className="modal-header">
            <h5 className="modal-title" id={`${loginNodeId}-label`}>
              {t("bootstrap5nt_navbar.label.pleaselogin")}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label={t("bootstrap5nt_navbar.label.close")} />
          </div>
          <div className="modal-body">
            {renderLoginFields(v)}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              {t("bootstrap5nt_navbar.label.close")}
            </button>
            <button type="submit" name="loginButton" className="btn btn-primary">
              {t("bootstrap5nt_navbar.label.login")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function renderLoginArea(v: NavbarView) {
  const { t, isEditMode, classes, login } = v;
  const { loginNodeId, loginError } = login;
  return (
    <>
      <ul className={classes.loginMenuULClass}>
        <li className="nav-item">
          <button
            className="nav-link py-2 login btn btn-link"
            type="button"
            data-bs-toggle="modal"
            data-bs-target={`#${loginNodeId}`}
          >
            {t("bootstrap5nt_navbar.label.login")}
          </button>
        </li>
      </ul>
      {renderLoginModal(v)}
      {/* The autofocus attribute has no effect in a Bootstrap modal: focus the first field
          once the modal is shown (Bootstrap docs, Modal, "How it works") */}
      <AddResources
        type="inline"
        targetTag={isEditMode ? "head" : "body"}
        inlineResource={`<script>if (!window.__bootstrap5ModalFocus) { window.__bootstrap5ModalFocus = true; document.addEventListener("shown.bs.modal", function (e) { var f = e.target && e.target.querySelector ? e.target.querySelector("[data-b5-autofocus]") : null; if (f) { f.focus(); } }); }</script>`}
      />
      {/* After a failed login, open the modal again so the error is visible (as 2.x) */}
      {loginError && (
        <AddResources
          type="inline"
          targetTag={isEditMode ? "head" : "body"}
          inlineResource={`<script>window.addEventListener("load", function () { var m = document.querySelector('[data-b5-login-error]'); if (m && window.bootstrap) { new bootstrap.Modal(m, { keyboard: false }).show(); } });</script>`}
        />
      )}
    </>
  );
}

/** Login button / user menu: same structure, labels and permission checks as the 2.x login view. */
function renderLogin(v: NavbarView) {
  return (
    <>
      {v.login.isLoggedIn ? renderUserMenu(v) : renderLoginArea(v)}
    </>
  );
}

/**
 * Colour mode switcher. The state shown here is the default of the site; the script
 * replaces it with the visitor's own choice, if any, as soon as the page is loaded.
 */
function renderColorModeSwitcher(v: NavbarView) {
  const { t, currentNode, siteNode } = v;
  const siteMode = getSiteColorMode(siteNode as any);
  const title = t("bootstrap5nt_navbar.colorMode");
  const siteModeLabel = t(`bootstrap5nt_navbar.colorMode.${siteMode}`);
  const toggleId = `color-mode-${currentNode.getIdentifier()}`;
  return (
    <ul className="navbar-nav color-mode-nav">
      <li className="nav-item dropdown">
        <button
          type="button"
          className="nav-link dropdown-toggle btn btn-link"
          id={toggleId}
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M8 15A7 7 0 1 0 8 1zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16"/>
          </svg>
          <span className="visually-hidden" data-b5-color-mode-name="true" data-b5-color-mode-title={title}>
            {`${title}: ${siteModeLabel}`}
          </span>
        </button>
        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={toggleId}>
          {COLOR_MODES.map((mode) => {
            const label = t(`bootstrap5nt_navbar.colorMode.${mode}`);
            const active = mode === siteMode;
            return (
              <li key={mode}>
                <button
                  type="button"
                  className={`dropdown-item d-flex align-items-center${active ? " active" : ""}`}
                  data-bs-theme-value={mode}
                  data-b5-color-mode-label={label}
                  aria-pressed={active ? "true" : "false"}
                >
                  {label}
                  <span className="ms-auto ps-3" data-b5-color-mode-check="true" aria-hidden="true" hidden={!active}>&#10003;</span>
                </button>
              </li>
            );
          })}
        </ul>
      </li>
    </ul>
  );
}

function renderLanguageSwitcher(v: NavbarView) {
  const { t, mainNode, languages } = v;
  const { currentLang, otherLanguages } = languages;
  return (
    <ul className="navbar-nav language-nav">
      <li className="nav-item dropdown">
        <a
          href="#"
          className="dropdown-toggle nav-link"
          id="languageSwitchButton"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          aria-label={`${currentLang.toUpperCase()} - ${t("bootstrap5nt_navbar.label.change")}`}
        >
          {currentLang.toUpperCase()}
        </a>
        <ul
          className="dropdown-menu dropdown-menu-end"
          aria-labelledby="languageSwitchButton"
          id="language-menu"
        >
          {otherLanguages.map((language) => (
            <li key={language.code}>
              <a
                className="dropdown-item"
                title={language.label}
                href={buildNodeUrl(mainNode, { language: language.code })}
                lang={language.tag}
                hrefLang={language.tag}
              >
                {language.label}
              </a>
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
}

/** Inner content (brand + toggler + collapse area). */
function renderNavInner(v: NavbarView) {
  const { classes, navbarId, settings, menuRootNode, menuCtx, languages } = v;
  return (
    <>
      {renderBrandLink(v)}

      {/* Mobile toggler */}
      {renderToggler(v)}

      {/* Collapsible nav area */}
      <div className={classes.divClass} id={navbarId}>

        {/* Navigation items */}
        <ul className={classes.ulClass}>
          {menuRootNode ? renderMenu(menuCtx, menuRootNode, 1) : null}
        </ul>

        {settings.addLoginButton && renderLogin(v)}

        {settings.addColorModeButton && renderColorModeSwitcher(v)}

        {/* Language switcher: shown when the site offers at least two languages (as 2.x) */}
        {settings.addLanguageButton && languages.siteLanguages.length > 1 && renderLanguageSwitcher(v)}

      </div>
    </>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

jahiaComponent(
  {
    nodeType: "bootstrap5nt:navbar",
    componentType: "view",
    name: "default",
    displayName: "Navbar",
    // Same cache keys as the 2.x navbar views: the active item depends on the page, the user menu on the
    // user, the login modal on a failed login (without them one cached navbar served every page/user)
    properties: {
      "cache.mainResource": "true",
      "cache.perUser": "true",
      "cache.requestParameters": "loginError,username",
    },
  },
  (_props: Record<string, unknown>) => {
    const { currentNode, renderContext, mainNode } = useServerContext();
    const { t } = useTranslation();
    const isEditMode = renderContext.isEditMode();
    const siteNode = renderContext.getSite() as JCRNodeWrapper | undefined;
    const settings = resolveGlobalSettings(currentNode);
    const classes = resolveNavClasses(currentNode);
    // Resolve current page node (walk up to jmix:navMenuItem if needed)
    const currentPageNode = resolveCurrentPageNode(mainNode);
    const homeNode = resolveHomeNode(siteNode, renderContext);
    const rootNode = resolveRootNode(settings.root, currentPageNode, homeNode);

    const view: NavbarView = {
      t,
      renderContext,
      currentNode,
      mainNode,
      siteNode,
      isEditMode,
      navbarId: `navbar-${currentNode.getIdentifier()}`,
      expand: resolveExpand(classes.navClass),
      brand: resolveBrand(siteNode, currentNode),
      settings,
      classes,
      menuRootNode: resolveMenuRootNode(settings.root, mainNode, currentNode, homeNode),
      rootNodeUrl: resolveRootNodeUrl(rootNode, homeNode),
      menuCtx: {
        currentNode,
        liClass: classes.liClass,
        navLinkClass: classes.navLinkClass,
        maxlevel: settings.maxlevel,
        mainResourcePath: mainNode.getPath(),
        navbarName: currentNode.getName(),
      },
      languages: resolveLanguages(renderContext, mainNode, settings.addLanguageButton),
      login: resolveLoginState(renderContext, currentNode, mainNode, siteNode),
    };
    const navInner = renderNavInner(view);

    // ── Optional container wrapper ─────────────────────────────────────────
    return (
      <>
        {/* Dropdowns need Bootstrap's JS; Jahia sends each resource once per page */}
        <BootstrapJS />
        {settings.addColorModeButton && (
          <AddResources type="inline" targetTag="head" inlineResource={COLOR_MODE_SCRIPT} />
        )}
        {settings.maxlevel > 1 && (
          // Multi-level menus: submenu positioning and touch support, as the 2.x multilevel resources
          <>
            <AddResources type="css" resources="multilevel-nav.css" />
            <AddResources type="javascript" resources="multilevel-nav.js" targetTag={isEditMode ? "head" : "body"} />
          </>
        )}
        <nav className={classes.navClass}>
          {settings.addContainerWithinTheNavbar ? (
            <div className="container">{navInner}</div>
          ) : (
            navInner
          )}
        </nav>
      </>
    );
  },
);
