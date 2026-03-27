/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * bootstrap5nt:navbar — responsive navigation bar with brand, multi-level nav items,
 * optional login modal, and language switcher.
 * Site-level bootstrap5mix:siteBrand overrides component-level brand settings.
 * Language switch URLs use the approximated "{pagePath}.{lang}.html" pattern;
 * login form action and workspace permission gating need validation with Jahia JS engine team.
 */
import { buildNodeUrl, getChildNodes, jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";

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
    url = "#";
  } else if (page.isNodeType("jnt:externalLink")) {
    url = page.getPropertyAsString("j:url") ?? "#";
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
function isDisplayedInMenu(page: JCRNodeWrapper, navbarName: string): boolean {
  if (!page.hasProperty("j:displayInMenuName")) return true;
  const values = (page.getProperty("j:displayInMenuName") as any).getValues() as { getString: () => string }[];
  if (!values || values.length === 0) return true;
  return values.some((v) => v.getString() === navbarName);
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
    const siteNode = renderContext.getSite() as JCRNodeWrapper | undefined;
    let brandImage: JCRNodeWrapper | undefined;
    let brandImageMobile: JCRNodeWrapper | undefined;
    let brandText = "";

    if (siteNode?.isNodeType("bootstrap5mix:siteBrand")) {
      brandImage = siteNode.hasProperty("brandImage") ? siteNode.getProperty("brandImage").getNode() as JCRNodeWrapper : undefined;
      brandImageMobile = siteNode.hasProperty("brandImageMobile") ? siteNode.getProperty("brandImageMobile").getNode() as JCRNodeWrapper : undefined;
      brandText = siteNode.getPropertyAsString("brandText") ?? "";
    } else if (currentNode.isNodeType("bootstrap5mix:brand")) {
      brandImage = currentNode.hasProperty("brandImage") ? currentNode.getProperty("brandImage").getNode() as JCRNodeWrapper : undefined;
      brandImageMobile = currentNode.hasProperty("brandImageMobile") ? currentNode.getProperty("brandImageMobile").getNode() as JCRNodeWrapper : undefined;
      brandText = currentNode.getPropertyAsString("brandText") ?? "";
    }

    // ── Global settings ────────────────────────────────────────────────────
    let addContainerWithinTheNavbar = true;
    let addLoginButton = true;
    let addLanguageButton = true;
    let maxlevel = 2;
    let root = "";

    if (currentNode.isNodeType("bootstrap5mix:navbarGlobalSettings")) {
      addContainerWithinTheNavbar =
        currentNode.getPropertyAsString("addContainerWithinTheNavbar") !== "false";
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
      rootNode = currentPageNode.getParent() as JCRNodeWrapper | undefined;
    } else if (root === "customRootPage") {
      rootNode = currentNode.hasProperty("customRootPage") ? currentNode.getProperty("customRootPage").getNode() as JCRNodeWrapper : undefined;
      if (!rootNode && isEditMode) {
        // Edit-mode warning for missing customRootPage
      }
    }

    if (!rootNode) {
      const site: any = siteNode ?? renderContext.getSite();
      rootNode = site ? site.getHome() as JCRNodeWrapper : undefined;
    }

    // Root node URL (site home gets site.home.url)
    let rootNodeUrl = "#";
    if (rootNode) {
      if (rootNode.isNodeType("jnt:virtualsite")) {
        const site2: any = siteNode ?? renderContext.getSite();
        const homeNode = site2 ? site2.getHome() as JCRNodeWrapper : undefined;
        rootNodeUrl = homeNode ? buildNodeUrl(homeNode) : "#";
      } else {
        rootNodeUrl = buildNodeUrl(rootNode);
      }
    }

    // ── Navigation tree ────────────────────────────────────────────────────
    const mainResourcePath = mainNode.getPath();
    const navbarName = currentNode.getName();
    const level1Pages = rootNode ? getChildNodes(rootNode, 100).filter(n => n.isNodeType("jmix:navMenuItem")) : [];

    // ── Language switcher ──────────────────────────────────────────────────
    // ⚠️ ui:initLangBarAttributes has no JS equivalent.
    // Approximate: site.getLanguages() (validate API)
    const allLanguages: string[] = siteNode ? [...((siteNode as any).getLanguages() as unknown as Iterable<string>)] : [];
    // ⚠️ renderContext.getMainResourceLocale() — validate accessor
    const currentLocale = renderContext.getMainResourceLocale();
    const currentLang: string = currentLocale ? String(currentLocale.getLanguage()).toLowerCase() : "";
    const otherLanguages = allLanguages.filter(
      (lang: string) => lang !== currentLang,
    );
    // Invalidated languages for current page
    // ⚠️ j:invalidLanguages is a multi-value property — validate API
    const invalidLangs: string[] = [];

    // ── Login state ────────────────────────────────────────────────────────
    // ⚠️ renderContext.isLoggedIn() — validate JS context API
    const isLoggedIn: boolean = renderContext.isLoggedIn() as unknown as boolean;
    // ⚠️ currentUser.username — validate JS context API
    const currentUser = renderContext.getUser();
    const username: string = currentUser ? String(currentUser.getUsername()) : "";
    // ⚠️ url.logout / url.login / url.live / url.preview / url.edit / url.contribute — validate
    const urlGen = renderContext.getURLGenerator();
    const logoutUrl: string = urlGen ? String(urlGen.getLogout()) : "#";
    const liveUrl: string = urlGen ? String(urlGen.getLive()) : "#";
    const previewUrl: string = urlGen ? String(urlGen.getPreview()) : "#";
    const editUrl: string = urlGen ? String(urlGen.getEdit()) : "#";
    const loginNodeId = `login-${currentNode.getIdentifier()}`;

    // ── Inner content (brand + toggler + collapse area) ───────────────────
    const NavInner = (
      <>
        {/* Brand link */}
        <a className={brandLinkClass} href={rootNodeUrl}>
          {brandImage && (() => {
            const desktopUrl = buildNodeUrl(brandImage);
            if (brandImageMobile) {
              const mobileUrl = buildNodeUrl(brandImageMobile);
              return (
                <>
                  <img src={desktopUrl} className={`align-top d-none d-${expand}-inline-block`} alt="" />
                  <img src={mobileUrl} className={`align-top d-inline-block d-${expand}-none`} alt="" />
                </>
              );
            }
            return <img src={desktopUrl} className="d-inline-block align-top" alt="" />;
          })()}
          {!siteNode?.isNodeType("bootstrap5mix:siteBrand") && !currentNode.isNodeType("bootstrap5mix:brand")
            ? (siteNode?.getDisplayableName() ?? "")
            : brandText}
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
                  ? getChildNodes(l1, 100).filter(n => n.isNodeType("jmix:navMenuItem"))
                  : [];
                const hasDropdown = level2Pages.length > 0 && recursive;

                if (hasDropdown) {
                  const dropId = `navbarDropdownMen-${currentNode.getIdentifier()}-${l1.getIdentifier()}`;
                  return (
                    <li
                      key={l1.getIdentifier()}
                      className={`${liClass} dropdown`}
                    >
                      <a
                        className={`${navLinkClass} dropdown-toggle${(item1.isActive || item1.isInPath) ? " active" : ""}`}
                        href="#"
                        id={dropId}
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                        {...(item1.isActive ? { "aria-current": "page" } : {})}
                        {...(maxlevel >= 3 ? { "data-bs-auto-close": "outside" } : {})}
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

                          const level3Pages = maxlevel >= 3
                            ? getChildNodes(l2, 100).filter(n => n.isNodeType("jmix:navMenuItem"))
                            : [];
                          const hasSubDropdown = level3Pages.length > 0;

                          if (hasSubDropdown) {
                            const dropId3 = `navbarDropdownMen-${currentNode.getIdentifier()}-${l2.getIdentifier()}`;
                            return (
                              <div key={l2.getIdentifier()} className="dropend">
                                <a
                                  className={`dropdown-item dropdown-toggle${(item2.isActive || item2.isInPath) ? " active" : ""}`}
                                  href="#"
                                  id={dropId3}
                                  data-bs-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                  {...(item2.isActive ? { "aria-current": "page" } : {})}
                                >
                                  {item2.title}
                                </a>
                                <div className="dropdown-menu" aria-labelledby={dropId3}>
                                  <a
                                    className={`dropdown-item${item2.isActive ? " active" : ""}`}
                                    href={item2.url}
                                    {...(item2.isActive ? { "aria-current": "page" } : {})}
                                  >
                                    {item2.title}
                                  </a>
                                  <div className="dropdown-divider" />
                                  {level3Pages.map((l3) => {
                                    if (!isDisplayedInMenu(l3, navbarName)) return null;
                                    const item3 = resolveNavItem(l3, mainResourcePath);
                                    if (!item3) return null;
                                    return (
                                      <a
                                        key={l3.getIdentifier()}
                                        className={`dropdown-item${item3.isActive ? " active" : ""}`}
                                        href={item3.url}
                                        {...(item3.isActive ? { "aria-current": "page" } : {})}
                                      >
                                        {item3.title}
                                        {item3.isActive && (
                                          <span className="visually-hidden">(current)</span>
                                        )}
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <a
                              key={l2.getIdentifier()}
                              className={`dropdown-item${item2.isActive ? " active" : ""}`}
                              href={item2.url}
                              {...(item2.isActive ? { "aria-current": "page" } : {})}
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
                    className={liClass}
                  >
                    <a
                      className={`${navLinkClass}${item1.isActive ? " active" : ""}`}
                      href={item1.url}
                      {...(item1.isActive ? { "aria-current": "page" } : {})}
                    >
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
                      {!renderContext.isPreviewMode() && (
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
                      const switchUrl = buildNodeUrl(mainNode, { language: lang });
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
