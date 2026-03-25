/**
 * bootstrap5nt:navbar — SSR view
 *
 * Consolidates navbar.jsp + navbar.hidden.basenav.jsp + navbar.hidden.login.jsp
 * + navbar.hidden.languages.jsp into one TSX file.
 *
 * navbar.hidden.basenav-multilevel-resources.jsp only adds CSS/JS resources (handled
 * by the module's resource declarations); its nav tree logic is in basenav.jsp.
 *
 * Rendering parity checklist:
 *   [x] Brand: site-level bootstrap5mix:siteBrand overrides component-level bootstrap5mix:brand
 *       — brandImage (desktop), brandImageMobile (shown below expand breakpoint), brandText
 *   [x] bootstrap5mix:navbarGlobalSettings: addContainerWithinTheNavbar, addLoginButton,
 *       addLanguageButton, maxlevel, root
 *   [x] bootstrap5mix:customizeNavbar: navClass, divClass, togglerClass, brandLinkClass,
 *       ulClass, liClass, navLinkClass, loginMenuULClass
 *   [x] Defaults for all customizable classes
 *   [x] Expand breakpoint extracted from navbar-expand-* token in navClass
 *   [x] Root node resolution: currentPage / parentPage / customRootPage → site home fallback
 *   [x] Nav items: level 1 with optional level 2 dropdown (maxlevel ≥ 2)
 *   [x] j:displayInMenuName filtering (multi-value property)
 *   [x] Node type routing: jnt:navMenuText (#), jnt:externalLink, jnt:page, jnt:nodeLink
 *   [x] Active detection: mainResource path contains page path
 *   [x] Login fragment: logged-in dropdown (workspace switching) + anonymous login modal
 *   [x] Language switcher dropdown (active language shown, others linked)
 *
 * ⚠️  Open questions / blocked features:
 *   - renderContext.isLoggedIn() / currentUser.username — validate JS context API
 *   - url.login / url.logout / url.live / url.preview / url.edit / url.contribute —
 *     validate URLGenerator accessor in JS context
 *   - ui:loginArea (generates form action for Jahia login) — no JS equivalent;
 *     login form action URL is a TODO
 *   - ui:initLangBarAttributes — populates languageCodes from site active languages;
 *     replaced here by renderContext.getSite().getLanguages() (validate API)
 *   - b5:switchToLanguageLink — custom taglib that builds locale-switched URL;
 *     approximated as "{pagePath}.{lang}.html" (validate URL pattern)
 *   - jcr:hasPermission — no known JS equivalent; workspace-switching links always rendered
 *   - ui:isLoginError — no JS equivalent; login error detection omitted
 *   - renderContext.settings.distantPublicationServerMode — validate accessor
 */
import { getChildNodes, jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";

// ─── Nav item URL/title resolution ─────────────────────────────────────────

interface NavItem {
  url: string;
  title: string;
  isActive: boolean;
  node: JCRNodeWrapper;
}

function resolveNavItem(
  page: JCRNodeWrapper,
  mainResourcePath: string,
): NavItem | null {
  let url = "#";
  let title = page.getDisplayableName();

  if (page.isNodeType("jnt:navMenuText")) {
    url = "#";
  } else if (page.isNodeType("jnt:externalLink")) {
    url = page.getPropertyAsString("j:url") ?? "#";
  } else if (page.isNodeType("jnt:page")) {
    url = page.getUrl?.() ?? `${page.getPath()}.html`;
    title = page.getDisplayableName();
  } else if (page.isNodeType("jnt:nodeLink")) {
    const linkedNode = page.getProperty("j:node")?.getNode?.() as JCRNodeWrapper | undefined;
    if (linkedNode) {
      url = linkedNode.getUrl?.() ?? `${linkedNode.getPath()}.html`;
      title = page.getPropertyAsString("jcr:title") || linkedNode.getDisplayableName();
    }
  } else {
    return null;
  }

  const isActive = mainResourcePath.startsWith(page.getPath());
  return { url, title, isActive, node: page };
}

/**
 * Returns true when the page should appear in this navbar.
 * JSP: j:displayInMenuName is a multi-value property; page is shown when
 * the property is empty OR when the current navbar name is in the list.
 */
function isDisplayedInMenu(page: JCRNodeWrapper, navbarName: string): boolean {
  // ⚠️ Multi-value property access — validate API for getPropertyValues("j:displayInMenuName")
  const displayInMenuValues = (page.getProperty("j:displayInMenuName") as any)?.getValues?.();
  if (!displayInMenuValues || displayInMenuValues.length === 0) return true;
  return displayInMenuValues.some((v: { getString: () => string }) => v.getString() === navbarName);
}

// ─── Component ──────────────────────────────────────────────────────────────

jahiaComponent(
  {
    nodeType: "bootstrap5nt:navbar",
    componentType: "view",
    name: "default",
    displayName: "Navbar",
  },
  (_props: Record<string, unknown>) => {
    const { currentNode, renderContext, mainNode } = useServerContext();
    const isEditMode = renderContext.isEditMode();
    const navbarId = `navbar-${currentNode.getIdentifier()}`;

    // ── Brand resolution: site overrides component ─────────────────────────
    const siteNode = renderContext.getSite?.();
    let brandImage: JCRNodeWrapper | undefined;
    let brandImageMobile: JCRNodeWrapper | undefined;
    let brandText = "";

    if (siteNode?.isNodeType("bootstrap5mix:siteBrand")) {
      brandImage = siteNode.getProperty("brandImage")?.getNode?.() as JCRNodeWrapper | undefined;
      brandImageMobile = siteNode.getProperty("brandImageMobile")?.getNode?.() as JCRNodeWrapper | undefined;
      brandText = siteNode.getPropertyAsString("brandText") ?? "";
    } else if (currentNode.isNodeType("bootstrap5mix:brand")) {
      brandImage = currentNode.getProperty("brandImage")?.getNode?.() as JCRNodeWrapper | undefined;
      brandImageMobile = currentNode.getProperty("brandImageMobile")?.getNode?.() as JCRNodeWrapper | undefined;
      brandText = currentNode.getPropertyAsString("brandText") ?? "";
    }

    // ── Global settings ────────────────────────────────────────────────────
    let addContainerWithinTheNavbar = false;
    let addLoginButton = true;
    let addLanguageButton = true;
    let maxlevel = 2;
    let root = "";

    if (currentNode.isNodeType("bootstrap5mix:navbarGlobalSettings")) {
      addContainerWithinTheNavbar =
        currentNode.getPropertyAsString("addContainerWithinTheNavbar") === "true";
      addLoginButton = currentNode.getPropertyAsString("addLoginButton") !== "false";
      addLanguageButton = currentNode.getPropertyAsString("addLanguageButton") !== "false";
      maxlevel = parseInt(currentNode.getPropertyAsString("maxlevel") ?? "2", 10) || 2;
      root = currentNode.getPropertyAsString("root") ?? "";
    }
    const recursive = maxlevel > 1;

    // ── Customize classes ──────────────────────────────────────────────────
    let navClass = "navbar navbar-expand-lg navbar-light bg-light";
    let divClass = "collapse navbar-collapse";
    let togglerClass = "navbar-toggler navbar-toggler-right";
    let brandLinkClass = "navbar-brand";
    let ulClass = "navbar-nav me-auto";
    let liClass = "nav-item";
    let navLinkClass = "nav-link";
    let loginMenuULClass = "navbar-nav ms-auto";

    if (currentNode.isNodeType("bootstrap5mix:customizeNavbar")) {
      navClass = currentNode.getPropertyAsString("navClass") || navClass;
      divClass = currentNode.getPropertyAsString("divClass") || divClass;
      togglerClass = currentNode.getPropertyAsString("togglerClass") || togglerClass;
      brandLinkClass = currentNode.getPropertyAsString("brandLinkClass") || brandLinkClass;
      ulClass = currentNode.getPropertyAsString("ulClass") || ulClass;
      liClass = currentNode.getPropertyAsString("liClass") || liClass;
      navLinkClass = currentNode.getPropertyAsString("navLinkClass") || navLinkClass;
      loginMenuULClass = currentNode.getPropertyAsString("loginMenuULClass") || loginMenuULClass;
    }

    // ── Expand breakpoint (e.g. "lg" from "navbar-expand-lg") ─────────────
    let expand = "lg";
    for (const cls of navClass.split(" ")) {
      if (cls.startsWith("navbar-expand-")) {
        expand = cls.replace("navbar-expand-", "");
        break;
      }
    }

    // ── Root node resolution ───────────────────────────────────────────────
    // Resolve current page node (walk up to jmix:navMenuItem if needed)
    let currentPageNode: JCRNodeWrapper = mainNode;
    if (!currentPageNode.isNodeType("jmix:navMenuItem")) {
      currentPageNode = (currentPageNode.getAncestors() as unknown as JCRNodeWrapper[])
        .reverse()
        .find((n) => n.isNodeType("jmix:navMenuItem")) ?? currentPageNode;
    }

    let rootNode: JCRNodeWrapper | undefined;
    if (root === "currentPage") {
      rootNode = currentPageNode;
    } else if (root === "parentPage") {
      rootNode = currentPageNode.getParent?.() as JCRNodeWrapper | undefined;
    } else if (root === "customRootPage") {
      rootNode = currentNode.getProperty("customRootPage")?.getNode?.() as JCRNodeWrapper | undefined;
      if (!rootNode && isEditMode) {
        // Edit-mode warning for missing customRootPage
      }
    }

    if (!rootNode) rootNode = siteNode?.getHome?.() ?? renderContext.getSite?.()?.getHome?.();

    // Root node URL (site home gets site.home.url)
    let rootNodeUrl = "#";
    if (rootNode) {
      if (rootNode.isNodeType("jnt:virtualsite")) {
        rootNodeUrl = siteNode?.getHome?.()?.getUrl?.() ?? "#";
      } else {
        rootNodeUrl = rootNode.getUrl?.() ?? `${rootNode.getPath()}.html`;
      }
    }

    // ── Navigation tree ────────────────────────────────────────────────────
    const mainResourcePath = mainNode.getPath();
    const navbarName = currentNode.getName();
    const level1Pages = rootNode ? getChildNodes(rootNode).filter(n => n.isNodeType("jmix:navMenuItem")) : [];

    // ── Language switcher ──────────────────────────────────────────────────
    // ⚠️ ui:initLangBarAttributes has no JS equivalent.
    // Approximate: site.getLanguages() (validate API)
    const allLanguages: string[] = [...((siteNode?.getLanguages?.() as unknown as Iterable<string> | undefined) ?? [])];
    // ⚠️ renderContext.getMainResourceLocale() — validate accessor
    const currentLang: string =
      (renderContext.getMainResourceLocale?.()?.getLanguage?.() ?? "").toLowerCase();
    const otherLanguages = allLanguages.filter(
      (lang: string) => lang !== currentLang,
    );
    // Invalidated languages for current page
    // ⚠️ j:invalidLanguages is a multi-value property — validate API
    const invalidLangs: string[] = [];

    // ── Login state ────────────────────────────────────────────────────────
    // ⚠️ renderContext.isLoggedIn() — validate JS context API
    const isLoggedIn: boolean = renderContext.isLoggedIn?.() ?? false;
    // ⚠️ currentUser.username — validate JS context API
    const username: string = renderContext.getUser?.()?.getUsername?.() ?? "";
    // ⚠️ url.logout / url.login / url.live / url.preview / url.edit / url.contribute — validate
    const urlGen = renderContext.getURLGenerator?.();
    const logoutUrl: string = urlGen?.getLogout?.() ?? "#";
    const liveUrl: string = urlGen?.getLive?.() ?? "#";
    const previewUrl: string = urlGen?.getPreview?.() ?? "#";
    const editUrl: string = urlGen?.getEdit?.() ?? "#";
    const loginNodeId = `login-${currentNode.getIdentifier()}`;

    // ── Inner content (brand + toggler + collapse area) ───────────────────
    const NavInner = (
      <>
        {/* Brand link */}
        <a className={brandLinkClass} href={rootNodeUrl}>
          {brandImage && (() => {
            const desktopUrl = brandImage.getUrl?.() ?? "";
            if (brandImageMobile) {
              const mobileUrl = brandImageMobile.getUrl?.() ?? "";
              return (
                <>
                  <img src={desktopUrl} className={`align-top d-none d-${expand}-inline-block`} alt="" />
                  <img src={mobileUrl} className={`align-top d-inline-block d-${expand}-none`} alt="" />
                </>
              );
            }
            return <img src={desktopUrl} className="d-inline-block align-top" alt="" />;
          })()}
          {brandText}
        </a>

        {/* Mobile toggler */}
        <button
          className={togglerClass}
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#${navbarId}`}
          aria-controls={navbarId}
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Collapsible nav area */}
        <div className={divClass} id={navbarId}>

          {/* Navigation items */}
          {level1Pages.length > 0 && (
            <ul className={ulClass}>
              {level1Pages.map((l1) => {
                if (!isDisplayedInMenu(l1, navbarName)) return null;
                const item1 = resolveNavItem(l1, mainResourcePath);
                if (!item1) return null;

                const level2Pages = recursive
                  ? getChildNodes(l1).filter(n => n.isNodeType("jmix:navMenuItem"))
                  : [];
                const hasDropdown = level2Pages.length > 0 && recursive;

                if (hasDropdown) {
                  const dropId = `navbarDropdownMen-${currentNode.getIdentifier()}-${l1.getIdentifier()}`;
                  return (
                    <li
                      key={l1.getIdentifier()}
                      className={`${liClass}${item1.isActive ? " active" : ""} dropdown`}
                    >
                      <a
                        className={`${navLinkClass} dropdown-toggle${item1.isActive ? " active" : ""}`}
                        href="#"
                        id={dropId}
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        {item1.title}
                      </a>
                      <div className="dropdown-menu" aria-labelledby={dropId}>
                        <a className="dropdown-item" href={item1.url}>{item1.title}</a>
                        <div className="dropdown-divider" />
                        {level2Pages.map((l2) => {
                          if (!isDisplayedInMenu(l2, navbarName)) return null;
                          const item2 = resolveNavItem(l2, mainResourcePath);
                          if (!item2) return null;
                          return (
                            <a
                              key={l2.getIdentifier()}
                              className={`dropdown-item${item2.isActive ? " active" : ""}`}
                              href={item2.url}
                            >
                              {item2.title}
                              {item2.isActive && (
                                <span className="visually-hidden">(current)</span>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    </li>
                  );
                }

                return (
                  <li
                    key={l1.getIdentifier()}
                    className={`${liClass}${item1.isActive ? " active" : ""}`}
                  >
                    <a className={navLinkClass} href={item1.url}>
                      {item1.title}
                      {item1.isActive && (
                        <span className="visually-hidden">(current)</span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Login button */}
          {addLoginButton && (
            <>
              {isLoggedIn ? (
                <ul className={loginMenuULClass}>
                  <li className="nav-item dropdown">
                    <a
                      className="nav-item nav-link dropdown-toggle me-md-2"
                      href="#"
                      id={`list-${currentNode.getIdentifier()}`}
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      role="button"
                    >
                      {username}
                    </a>
                    <ul
                      className="dropdown-menu dropdown-menu-end"
                      aria-labelledby={`list-${currentNode.getIdentifier()}`}
                    >
                      {/* ⚠️ Workspace switching links: jcr:hasPermission has no JS equivalent.
                          Rendered unconditionally — validate permission-gating API. */}
                      {!isEditMode && (
                        <li>
                          <a href={liveUrl} className="dropdown-item text-primary">
                            Live
                          </a>
                        </li>
                      )}
                      {!renderContext.isPreviewMode?.() && (
                        <li>
                          <a href={previewUrl} className="dropdown-item text-secondary">
                            Preview
                          </a>
                        </li>
                      )}
                      {!isEditMode && (
                        <li>
                          <a href={editUrl} className="dropdown-item text-success">
                            Edit
                          </a>
                        </li>
                      )}
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <a className="dropdown-item logout" href={logoutUrl}>
                          Logout
                        </a>
                      </li>
                    </ul>
                  </li>
                </ul>
              ) : (
                <>
                  <ul className={loginMenuULClass}>
                    <li className="nav-item">
                      <a
                        className="nav-link py-2 login"
                        href="#"
                        role="button"
                        data-bs-toggle="modal"
                        data-bs-target={`#${loginNodeId}`}
                      >
                        Login
                      </a>
                    </li>
                  </ul>
                  {/* Login modal
                      ⚠️ ui:loginArea (form action URL for Jahia login) has no JS equivalent.
                      The form action is rendered as "#" — validate login URL accessor. */}
                  <div
                    className="modal fade"
                    id={loginNodeId}
                    tabIndex={-1}
                    aria-labelledby={`${loginNodeId}-label`}
                    aria-hidden="true"
                  >
                    <div className="modal-dialog modal-sm modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title" id={`${loginNodeId}-label`}>
                            Please log in
                          </h5>
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          />
                        </div>
                        {/* ⚠️ form action should be the Jahia login URL — validate */}
                        <form action="#" method="post">
                          <div className="modal-body">
                            <div className="input-group mb-3">
                              <span className="input-group-text" id="username">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                </svg>
                              </span>
                              <input
                                type="text"
                                className="form-control"
                                name="username"
                                placeholder="Username"
                                required
                                autoFocus
                                aria-describedby="username"
                              />
                            </div>
                            <div className="input-group mb-3">
                              <span className="input-group-text" id="password">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2zM2.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                                </svg>
                              </span>
                              <input
                                type="password"
                                className="form-control"
                                name="password"
                                placeholder="Password"
                                required
                                aria-describedby="password"
                              />
                            </div>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" id="useCookie" name="useCookie" />
                              <label className="form-check-label" htmlFor="useCookie">
                                Remember me
                              </label>
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                              Close
                            </button>
                            <button type="submit" name="loginButton" className="btn btn-primary">
                              Login
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Language switcher
              ⚠️ Language list from siteNode.getLanguages() — validate API.
              ⚠️ b5:switchToLanguageLink URL pattern — validate locale-switched URL construction. */}
          {addLanguageButton && otherLanguages.length > 0 && (
            <ul className="navbar-nav language-nav">
              <li className="nav-item dropdown">
                <a
                  href="#"
                  className="dropdown-toggle nav-link"
                  id="languageSwitchButton"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  aria-label="Change language"
                >
                  {currentLang.toUpperCase()}
                </a>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="languageSwitchButton"
                  role="menu"
                  id="language-menu"
                >
                  {otherLanguages
                    .filter((lang: string) => !invalidLangs.includes(lang))
                    .map((lang: string) => {
                      // ⚠️ URL pattern for language switch — approximation only
                      const switchUrl = `${mainNode.getPath()}.${lang}.html`;
                      return (
                        <li key={lang}>
                          <a className="dropdown-item" href={switchUrl}>
                            {lang.toUpperCase()}
                          </a>
                        </li>
                      );
                    })}
                </ul>
              </li>
            </ul>
          )}

        </div>
      </>
    );

    // ── Optional container wrapper ─────────────────────────────────────────
    return (
      <nav className={navClass}>
        {addContainerWithinTheNavbar ? (
          <div className="container">{NavInner}</div>
        ) : (
          NavInner
        )}
      </nav>
    );
  },
);
