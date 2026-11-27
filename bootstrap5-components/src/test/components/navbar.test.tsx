import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeRenderContext, makeLocale, makeUrlGen, renderFn } from '../helpers';

import '../../components/Navbar/default.server';

function makeNavPage(id: string, overrides: any = {}): any {
  const nodeTypes: string[] = overrides._nodeTypes ?? ['jnt:page', 'jmix:navMenuItem'];
  const path = overrides._path ?? `/sites/test/${id}`;
  return {
    getIdentifier: () => id,
    getDisplayableName: () => overrides._name ?? id,
    getName: () => id,
    getPath: () => path,
    getUrl: () => overrides._url ?? `${path}.html`,
    isNodeType: (t: string) => nodeTypes.includes(t),
    hasProperty: (name: string) => (overrides._properties ?? {})[name] !== undefined,
    getPropertyAsString: (name: string) => overrides._props?.[name] ?? '',
    getProperty: (name: string) => {
      const v = overrides._properties?.[name];
      return v !== undefined
        ? { getString: () => String(v), getNode: () => v, getValues: () => (Array.isArray(v) ? v.map((x: any) => ({ getString: () => String(x) })) : []) }
        : null;
    },
    getParent: () => overrides._parent ?? makeNode({ _id: 'parent' }),
    getAncestors: () => overrides._ancestors ?? [],
    hasPermission: (perm: string) => (overrides._permissions ?? []).includes(perm),
    getResolveSite: () => null,
    getI18N: overrides.getI18N ?? (() => { throw new Error('no translation'); }),
    _children: overrides._children ?? [],
  };
}

function makeSiteNode(overrides: any = {}): any {
  const langs: string[] = overrides._languages ?? [];
  return {
    getIdentifier: () => 'site-node',
    getDisplayableName: () => 'Test Site',
    getName: () => 'testsite',
    getSiteKey: () => 'testsite',
    getPath: () => '/sites/test',
    isNodeType: (t: string) => (overrides._nodeTypes ?? []).includes(t),
    hasProperty: (name: string) => (overrides._properties ?? {})[name] !== undefined,
    getPropertyAsString: (name: string) => overrides._properties?.[name] ?? '',
    getProperty: (name: string) => {
      const v = overrides._imageProps?.[name];
      return v !== undefined ? { getString: () => String(v), getNode: () => v, getValues: () => [] } : null;
    },
    getLanguages: () => langs,
    getActiveLiveLanguages: () => overrides._liveLanguages ?? langs,
    getLanguagesAsLocales: () => langs.map((code) => ({
      toString: () => code,
      getDisplayLanguage: () => ({ en: 'English', fr: 'français', de: 'Deutsch' } as Record<string, string>)[code] ?? code,
    })),
    isMixLanguagesActive: () => false,
    getHome: () => overrides._home ?? makeNavPage('home', { _path: '/sites/test/home' }),
    _children: overrides._children ?? [],
  };
}

describe('bootstrap5nt:navbar (default view)', () => {
  function getNavbarFn() {
    return _getComponent('bootstrap5nt:navbar', 'default');
  }

  function makeNavbarCtx(nodeOverrides: any = {}, rcOverrides: any = {}, mainOverrides: any = {}) {
    const currentNode = makeNode({
      _id: 'navbar-1',
      _nodeName: 'mainNav',
      _path: '/sites/test/home/navbar',
      ...nodeOverrides,
    });
    const mainNode = makeNavPage('main-page', {
      _path: '/sites/test/home',
      _ancestors: [],
      ...mainOverrides,
    });
    const ctx = {
      currentNode,
      renderContext: makeRenderContext(rcOverrides),
      mainNode,
    };
    _setContext(ctx);
    return ctx;
  }

  test('basic render → <nav> element present', () => {
    const ctx = makeNavbarCtx();
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  test('navbarId uses currentNode.getIdentifier()', () => {
    const ctx = makeNavbarCtx({ _id: 'my-navbar' });
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    // The collapse div should have id="navbar-my-navbar"
    expect(container.querySelector('#navbar-my-navbar')).toBeInTheDocument();
  });

  test('addContainerWithinTheNavbar=false → no .container inside nav', () => {
    const ctx = makeNavbarCtx({
      _nodeTypes: ['bootstrap5mix:navbarGlobalSettings'],
      _properties: { addContainerWithinTheNavbar: 'false' },
    });
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    const nav = container.querySelector('nav');
    expect(nav?.querySelector('.container')).not.toBeInTheDocument();
  });

  test('addContainerWithinTheNavbar=true → .container inside nav', () => {
    const ctx = makeNavbarCtx({
      _nodeTypes: ['bootstrap5mix:navbarGlobalSettings'],
      _properties: { addContainerWithinTheNavbar: 'true' },
    });
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    const nav = container.querySelector('nav');
    expect(nav?.querySelector('.container')).toBeInTheDocument();
  });

  test('nav items: jnt:page → <a href="/path.html">', () => {
    const page = makeNavPage('about', {
      _path: '/sites/test/about',
      _nodeTypes: ['jnt:page', 'jmix:navMenuItem'],
    });
    const siteNode = makeSiteNode({ _home: makeNavPage('home', { _children: [page] }) });
    const ctx = {
      currentNode: makeNode({
        _id: 'navbar-2',
        _nodeName: 'nav',
        _nodeTypes: [],
      }),
      renderContext: makeRenderContext({ _site: siteNode }),
      mainNode: makeNavPage('home', { _path: '/sites/test/other' }),
    };
    _setContext(ctx);
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    // Should have a link to /sites/test/about.html
    const links = Array.from(container.querySelectorAll('a'));
    const aboutLink = links.find(a => a.getAttribute('href') === '/sites/test/about.html');
    expect(aboutLink).toBeInTheDocument();
  });

  test('nav items: jnt:navMenuText → href="#"', () => {
    const textItem = makeNavPage('nav-text', {
      _nodeTypes: ['jnt:navMenuText', 'jmix:navMenuItem'],
    });
    const siteNode = makeSiteNode({ _home: makeNavPage('home', { _children: [textItem] }) });
    const ctx = {
      currentNode: makeNode({ _id: 'navbar-3', _nodeName: 'nav', _nodeTypes: [] }),
      renderContext: makeRenderContext({ _site: siteNode }),
      mainNode: makeNavPage('home', { _path: '/sites/test/other' }),
    };
    _setContext(ctx);
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    const navLinks = container.querySelectorAll('.nav-link');
    const hashLink = Array.from(navLinks).find(a => a.getAttribute('href') === '#' && a.textContent?.includes('nav-text'));
    expect(hashLink).toBeInTheDocument();
  });

  test('brand text → rendered in brand link', () => {
    const ctx = makeNavbarCtx({
      _nodeTypes: ['bootstrap5mix:brand'],
      _properties: { brandText: 'My Brand' },
    });
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    const brandLink = container.querySelector('.navbar-brand');
    expect(brandLink?.textContent).toContain('My Brand');
  });

  test('no brand settings → empty brand link, the site name is not shown (as 2.x)', () => {
    const ctx = makeNavbarCtx({}, { _site: makeSiteNode() });
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.navbar-brand')?.textContent?.trim()).toBe('');
  });

  test('addLoginButton=false → no login elements', () => {
    const ctx = makeNavbarCtx({
      _nodeTypes: ['bootstrap5mix:navbarGlobalSettings'],
      _properties: { addLoginButton: 'false' },
    });
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.login')).not.toBeInTheDocument();
    expect(container.querySelector('.logout')).not.toBeInTheDocument();
  });

  test('addLoginButton + isLoggedIn=false → Login link', () => {
    const urlGen = makeUrlGen();
    const ctx = {
      currentNode: makeNode({
        _id: 'navbar-log',
        _nodeName: 'nav',
        _nodeTypes: ['bootstrap5mix:navbarGlobalSettings'],
        _properties: { addLoginButton: 'true' },
      }),
      renderContext: makeRenderContext({ _loggedIn: false, _urlGen: urlGen }),
      mainNode: makeNavPage('home', { _path: '/sites/test/home' }),
    };
    _setContext(ctx);
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.login')).toBeInTheDocument();
  });

  test('login form posts to Jahia login with site and redirects (2.x ui:loginArea)', () => {
    const ctx = makeNavbarCtx({}, { _site: makeSiteNode(), _contextPath: '/ctx' });
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    const form = container.querySelector('form[name="loginForm"]');
    expect(form).toHaveAttribute('action', '/ctx/cms/login');
    expect(form?.querySelector('input[name="site"]')).toHaveAttribute('value', 'testsite');
    expect(form?.querySelector('input[name="redirect"]')?.getAttribute('value')).toBeTruthy();
    expect(form?.querySelector('input[name="failureRedirect"]')?.getAttribute('value')).toBeTruthy();
    // inputs are labelled, and ids are unique per navbar
    expect(container.querySelector('label[for="username-navbar-1"]')).toBeInTheDocument();
    expect(container.querySelector('#password-navbar-1')).toBeInTheDocument();
  });

  test('failed login (?loginError=) → error alert in the modal', () => {
    const ctx = makeNavbarCtx({}, { _site: makeSiteNode(), _params: { loginError: 'bad_password' } });
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.modal .alert-danger')).toBeInTheDocument();
  });

  test('logged in without jContentAccess → no Preview/Edit links, Logout only', () => {
    const user = { getUsername: () => 'visitor' };
    const ctx = {
      currentNode: makeNode({ _id: 'navbar-perm', _nodeName: 'nav' }),
      renderContext: makeRenderContext({ _loggedIn: true, _user: user, _urlGen: makeUrlGen() }),
      mainNode: makeNavPage('home', { _path: '/sites/test/home', _permissions: [] }),
    };
    _setContext(ctx);
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('a[href="/cms/edit"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href="/cms/preview"]')).not.toBeInTheDocument();
    expect(container.querySelector('a.logout')).toBeInTheDocument();
  });

  test('logged in with jContentAccess → Edit link', () => {
    const user = { getUsername: () => 'editor' };
    const ctx = {
      currentNode: makeNode({ _id: 'navbar-perm2', _nodeName: 'nav' }),
      renderContext: makeRenderContext({ _loggedIn: true, _user: user, _urlGen: makeUrlGen() }),
      mainNode: makeNavPage('home', { _path: '/sites/test/home', _permissions: ['jContentAccess'] }),
    };
    _setContext(ctx);
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('a[href="/cms/edit"]')).toBeInTheDocument();
  });

  test('addLoginButton + isLoggedIn=true → Logout link present', () => {
    const user = { getUsername: () => 'johndoe' };
    const urlGen = makeUrlGen();
    const ctx = {
      currentNode: makeNode({
        _id: 'navbar-loggedin',
        _nodeName: 'nav',
        _nodeTypes: ['bootstrap5mix:navbarGlobalSettings'],
        _properties: { addLoginButton: 'true' },
      }),
      renderContext: makeRenderContext({ _loggedIn: true, _user: user, _urlGen: urlGen }),
      mainNode: makeNavPage('home', { _path: '/sites/test/home' }),
    };
    _setContext(ctx);
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.logout')).toBeInTheDocument();
    // Username should appear somewhere
    expect(container.textContent).toContain('johndoe');
  });

  test('addLanguageButton + multiple languages → language switcher ul', () => {
    const locale = makeLocale('en');
    const siteNode = makeSiteNode({ _languages: ['en', 'fr', 'de'] });
    const ctx = {
      currentNode: makeNode({
        _id: 'navbar-lang',
        _nodeName: 'nav',
        _nodeTypes: ['bootstrap5mix:navbarGlobalSettings'],
        _properties: { addLanguageButton: 'true' },
      }),
      renderContext: makeRenderContext({ _site: siteNode, _locale: locale, _previewMode: true }),
      mainNode: makeNavPage('home', { _path: '/sites/test/home' }),
    };
    _setContext(ctx);
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.language-nav')).toBeInTheDocument();
  });

  test('addLanguageButton=false → no language switcher', () => {
    const siteNode = makeSiteNode({ _languages: ['en', 'fr'] });
    const ctx = {
      currentNode: makeNode({
        _id: 'navbar-nolang',
        _nodeName: 'nav',
        _nodeTypes: ['bootstrap5mix:navbarGlobalSettings'],
        _properties: { addLanguageButton: 'false' },
      }),
      renderContext: makeRenderContext({ _site: siteNode }),
      mainNode: makeNavPage('home', { _path: '/sites/test/home' }),
    };
    _setContext(ctx);
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.language-nav')).not.toBeInTheDocument();
  });

  test('active page → nav link has "active" class', () => {
    const activePage = makeNavPage('current', {
      _path: '/sites/test/current',
      _nodeTypes: ['jnt:page', 'jmix:navMenuItem'],
    });
    const siteNode = makeSiteNode({ _home: makeNavPage('home', { _children: [activePage] }) });
    const ctx = {
      currentNode: makeNode({ _id: 'navbar-active', _nodeName: 'nav', _nodeTypes: [] }),
      renderContext: makeRenderContext({ _site: siteNode }),
      mainNode: makeNavPage('current', { _path: '/sites/test/current' }),
    };
    _setContext(ctx);
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    const activeLink = container.querySelector('a.nav-link.active');
    expect(activeLink).toBeInTheDocument();
  });

  test('maxlevel=1 → no dropdown rendered', () => {
    const child = makeNavPage('child', {
      _path: '/sites/test/current/child',
      _nodeTypes: ['jnt:page', 'jmix:navMenuItem'],
    });
    const parentPage = makeNavPage('current', {
      _path: '/sites/test/current',
      _nodeTypes: ['jnt:page', 'jmix:navMenuItem'],
      _children: [child],
    });
    const siteNode = makeSiteNode({ _home: makeNavPage('home', { _children: [parentPage] }) });
    const ctx = {
      currentNode: makeNode({
        _id: 'navbar-maxlvl',
        _nodeName: 'nav',
        _nodeTypes: ['bootstrap5mix:navbarGlobalSettings'],
        _properties: { maxlevel: '1' },
      }),
      renderContext: makeRenderContext({ _site: siteNode }),
      mainNode: makeNavPage('current', { _path: '/sites/test/current' }),
    };
    _setContext(ctx);
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.dropdown')).not.toBeInTheDocument();
  });

  test('site brand overrides component brand text', () => {
    const siteNode = makeSiteNode({
      _nodeTypes: ['bootstrap5mix:siteBrand'],
      _properties: { brandText: 'Site Brand Text' },
    });
    const ctx = {
      currentNode: makeNode({
        _id: 'navbar-sitebrand',
        _nodeName: 'nav',
        _nodeTypes: ['bootstrap5mix:brand'],
        _properties: { brandText: 'Component Brand' },
      }),
      renderContext: makeRenderContext({ _site: siteNode }),
      mainNode: makeNavPage('home', { _path: '/sites/test/home' }),
    };
    _setContext(ctx);
    const fn = getNavbarFn();
    const { container } = renderFn(fn, {}, ctx);
    const brand = container.querySelector('.navbar-brand');
    expect(brand?.textContent).toContain('Site Brand Text');
    expect(brand?.textContent).not.toContain('Component Brand');
  });

  // ── Multi-level menu (port of the 2.x basenav-multilevel view) ─────────────

  /** home > l1 > l2 > l3 > l4 > l5, the page displayed being l3. */
  function makeDeepTree() {
    const l5 = makeNavPage('l5', { _path: '/sites/test/home/l1/l2/l3/l4/l5' });
    const l4 = makeNavPage('l4', { _path: '/sites/test/home/l1/l2/l3/l4', _children: [l5] });
    const l3 = makeNavPage('l3', { _path: '/sites/test/home/l1/l2/l3', _children: [l4] });
    const l2 = makeNavPage('l2', { _path: '/sites/test/home/l1/l2', _children: [l3] });
    const l1 = makeNavPage('l1', { _path: '/sites/test/home/l1', _children: [l2] });
    const home = makeNavPage('home', { _path: '/sites/test/home', _children: [l1] });
    return { home, l1, l2, l3, l4, l5 };
  }

  function renderDeep(maxlevel: string | undefined, extraProperties: any = {}, mainPath = '/sites/test/home/l1/l2/l3') {
    const tree = makeDeepTree();
    const ctx = {
      currentNode: makeNode({
        _id: 'navbar-deep',
        _nodeName: 'nav',
        _nodeTypes: maxlevel ? ['bootstrap5mix:navbarGlobalSettings'] : [],
        _properties: { ...(maxlevel ? { maxlevel } : {}), ...extraProperties },
      }),
      renderContext: makeRenderContext({ _site: makeSiteNode({ _home: tree.home }) }),
      mainNode: makeNavPage('main', { _path: mainPath, _parent: tree.l2 }),
    };
    _setContext(ctx);
    return { ...renderFn(getNavbarFn(), {}, ctx), tree };
  }
  const hrefs = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('ul.navbar-nav a')).map((a) => a.getAttribute('href'));

  test('maxlevel=5 → the five levels are rendered', () => {
    const { container } = renderDeep('5');
    for (const level of ['l1', 'l1/l2', 'l1/l2/l3', 'l1/l2/l3/l4', 'l1/l2/l3/l4/l5']) {
      expect(hrefs(container)).toContain(`/sites/test/home/${level}.html`);
    }
    // l2, l3 and l4 open a submenu; l5 is a plain item
    expect(container.querySelectorAll('li.dropend').length).toBe(3);
    expect(container.querySelectorAll('ul.submenu.dropdown-menu').length).toBe(3);
  });

  test('maxlevel=4 → level 5 is not rendered, level 4 is a plain item', () => {
    const { container } = renderDeep('4');
    expect(hrefs(container)).toContain('/sites/test/home/l1/l2/l3/l4.html');
    expect(hrefs(container)).not.toContain('/sites/test/home/l1/l2/l3/l4/l5.html');
    expect(container.querySelectorAll('li.dropend').length).toBe(2);
  });

  test('default maxlevel (2) → two levels', () => {
    const { container } = renderDeep(undefined);
    expect(hrefs(container)).toContain('/sites/test/home/l1/l2.html');
    expect(hrefs(container)).not.toContain('/sites/test/home/l1/l2/l3.html');
    expect(container.querySelector('li.dropend')).not.toBeInTheDocument();
  });

  test('current page → .active + aria-current; its ancestors → .inpath, not .active', () => {
    const { container } = renderDeep('5');
    const current = Array.from(container.querySelectorAll('[aria-current="page"]'));
    expect(current.length).toBeGreaterThan(0);
    current.forEach((link) => {
      expect(link).toHaveAttribute('href', '/sites/test/home/l1/l2/l3.html');
      expect(link).toHaveClass('active');
    });
    const l1Toggle = container.querySelector('li.dropdown > a.dropdown-toggle');
    expect(l1Toggle).toHaveClass('inpath');
    expect(l1Toggle).not.toHaveClass('active');
    const l2Toggle = container.querySelector('li.dropend > a.dropdown-toggle');
    expect(l2Toggle).toHaveClass('inpath');
    // pages below the current one are neither
    const l4 = Array.from(container.querySelectorAll('a')).filter((a) => a.getAttribute('href') === '/sites/test/home/l1/l2/l3/l4.html');
    l4.forEach((link) => { expect(link).not.toHaveClass('active'); expect(link).not.toHaveClass('inpath'); });
  });

  test('no "(current)" text: aria-current carries the state', () => {
    const { container } = renderDeep('5');
    expect(container.textContent).not.toContain('(current)');
  });

  test('a dropdown repeats its own page as first item, followed by a divider', () => {
    const { container } = renderDeep('2');
    const menu = container.querySelector('li.dropdown > ul.dropdown-menu');
    const first = menu?.querySelector(':scope > li:first-child > a');
    expect(first).toHaveAttribute('href', '/sites/test/home/l1.html');
    // 2.x markup: inside a top-level dropdown the page's own link keeps the top-level classes
    expect(first).toHaveClass('nav-link');
    expect(first?.parentElement).toHaveClass('nav-item');
    expect(menu?.querySelector(':scope > li:nth-child(2) > hr.dropdown-divider')).toBeInTheDocument();
  });

  // ── Root of the menu ───────────────────────────────────────────────────────

  test('root=currentPage is read without the navbarGlobalSettings mixin → menu of the page displayed', () => {
    const { container } = renderDeep(undefined, { root: 'currentPage' });
    // mainNode has no children in the fixture: the menu is empty, and the home tree is not used
    expect(hrefs(container)).not.toContain('/sites/test/home/l1.html');
  });

  test('root=parentPage → menu starts at the parent of the page displayed', () => {
    const { container } = renderDeep(undefined, { root: 'parentPage' });
    expect(hrefs(container)).toContain('/sites/test/home/l1/l2/l3.html');
    expect(hrefs(container)).not.toContain('/sites/test/home/l1.html');
  });

  test('root=customRootPage → menu starts at the chosen page', () => {
    const tree = makeDeepTree();
    const { container } = renderDeep(undefined, { root: 'customRootPage', customRootPage: tree.l3 });
    expect(hrefs(container)).toContain('/sites/test/home/l1/l2/l3/l4.html');
    expect(hrefs(container)).not.toContain('/sites/test/home/l1.html');
  });

  test('root=customRootPage without a page → empty menu (2.x)', () => {
    const { container } = renderDeep(undefined, { root: 'customRootPage' });
    expect(container.querySelector('ul.navbar-nav.me-auto')?.children.length).toBe(0);
  });

  test('root=homePage → menu starts at the home page', () => {
    const { container } = renderDeep(undefined, { root: 'homePage' });
    expect(hrefs(container)).toContain('/sites/test/home/l1.html');
  });

  test('j:displayInMenuName → page only shown in the menus it lists', () => {
    const shown = makeNavPage('shown', { _properties: { 'j:displayInMenuName': ['nav', 'footer'] } });
    const hidden = makeNavPage('hidden', { _properties: { 'j:displayInMenuName': ['footer'] } });
    const everywhere = makeNavPage('everywhere');
    const siteNode = makeSiteNode({ _home: makeNavPage('home', { _children: [shown, hidden, everywhere] }) });
    const ctx = {
      currentNode: makeNode({ _id: 'navbar-menus', _nodeName: 'nav' }),
      renderContext: makeRenderContext({ _site: siteNode }),
      mainNode: makeNavPage('main', { _path: '/sites/test/other' }),
    };
    _setContext(ctx);
    const { container } = renderFn(getNavbarFn(), {}, ctx);
    expect(hrefs(container)).toEqual(['/sites/test/shown.html', '/sites/test/everywhere.html']);
  });

  // ── Language switcher ──────────────────────────────────────────────────────

  function renderLanguages(siteOverrides: any, rcOverrides: any = {}, mainOverrides: any = {}) {
    const ctx = {
      currentNode: makeNode({ _id: 'navbar-lang2', _nodeName: 'nav' }),
      renderContext: makeRenderContext({ _site: makeSiteNode(siteOverrides), _locale: makeLocale('en'), _editMode: true, ...rcOverrides }),
      mainNode: makeNavPage('home', { _path: '/sites/test/home', ...mainOverrides }),
    };
    _setContext(ctx);
    return renderFn(getNavbarFn(), {}, ctx);
  }

  test('language links: native name, title, lang and hreflang; current language left out', () => {
    const { container } = renderLanguages({ _languages: ['en', 'fr', 'de'] });
    const links = Array.from(container.querySelectorAll('#language-menu a'));
    expect(links.map((a) => a.textContent)).toEqual(['Deutsch', 'français']);
    expect(links[1]).toHaveAttribute('lang', 'fr');
    expect(links[1]).toHaveAttribute('hreflang', 'fr');
    expect(links[1]).toHaveAttribute('title', 'français');
    expect(links[1].getAttribute('href')).toContain('lang=fr');
  });

  test('language toggle: visible code, and an accessible name that contains it', () => {
    const { container } = renderLanguages({ _languages: ['en', 'fr'] });
    const toggle = container.querySelector('#languageSwitchButton');
    expect(toggle?.textContent).toBe('EN');
    expect(toggle?.getAttribute('aria-label')).toContain('EN');
    expect(toggle?.getAttribute('aria-label')).toContain('bootstrap5nt_navbar.label.change');
  });

  test('languages invalidated on the page are not offered', () => {
    const { container } = renderLanguages({ _languages: ['en', 'fr', 'de'] }, {}, { _properties: { 'j:invalidLanguages': ['fr'] } });
    expect(Array.from(container.querySelectorAll('#language-menu a')).map((a) => a.textContent)).toEqual(['Deutsch']);
  });

  test('live → languages inactive in live are not offered', () => {
    const { container } = renderLanguages(
      { _languages: ['en', 'fr', 'de'], _liveLanguages: ['en', 'fr'] },
      { _editMode: false },
      {
        getI18N: (locale: any) => ({
          hasProperty: () => true,
          getProperty: (name: string) => ({ getString: () => (name === 'jcr:language' ? locale.toString() : 'true'), getBoolean: () => true }),
        }),
      },
    );
    expect(Array.from(container.querySelectorAll('#language-menu a')).map((a) => a.textContent)).toEqual(['français']);
  });

  test('single-language site → no language switcher', () => {
    const { container } = renderLanguages({ _languages: ['en'] });
    expect(container.querySelector('.language-nav')).not.toBeInTheDocument();
  });

  test('toggler and close button labels are translated', () => {
    const { container } = renderLanguages({ _languages: ['en'] });
    expect(container.querySelector('.navbar-toggler')).toHaveAttribute('aria-label', 'bootstrap5nt_navbar.label.toggle');
  });
});
