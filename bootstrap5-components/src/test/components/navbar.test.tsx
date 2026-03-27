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
      return v !== undefined ? { getString: () => String(v), getNode: () => v, getValues: () => [] } : null;
    },
    getParent: () => overrides._parent ?? makeNode({ _id: 'parent' }),
    getAncestors: () => overrides._ancestors ?? [],
    _children: overrides._children ?? [],
  };
}

function makeSiteNode(overrides: any = {}): any {
  const langs: string[] = overrides._languages ?? [];
  return {
    getIdentifier: () => 'site-node',
    getDisplayableName: () => 'Test Site',
    getName: () => 'testsite',
    getPath: () => '/sites/test',
    isNodeType: (t: string) => (overrides._nodeTypes ?? []).includes(t),
    hasProperty: (name: string) => (overrides._properties ?? {})[name] !== undefined,
    getPropertyAsString: (name: string) => overrides._properties?.[name] ?? '',
    getProperty: (name: string) => {
      const v = overrides._imageProps?.[name];
      return v !== undefined ? { getString: () => String(v), getNode: () => v, getValues: () => [] } : null;
    },
    getLanguages: () => langs,
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
      renderContext: makeRenderContext({ _site: siteNode, _locale: locale }),
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
});
