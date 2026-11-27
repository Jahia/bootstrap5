import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeCtx, makeRenderContext, renderFn } from '../helpers';
import { textColorClass } from '../../utils/colors';

import '../../components/Carousel/default.server';
import '../../components/Navbar/default.server';
import '../../components/Button/default.server';

// Points checked against the Bootstrap 5.3 documentation: classes removed or deprecated since
// Bootstrap 4, and options that had no effect.
describe('Bootstrap 5.3 documentation conformance', () => {
  describe('carousel', () => {
    function render(properties: Record<string, string> | null) {
      const ctx = makeCtx({
        _id: 'car-1',
        _nodeTypes: properties ? ['bootstrap5mix:carouselAdvancedSettings'] : [],
        _properties: properties ?? {},
      });
      _setContext(ctx);
      return renderFn(_getComponent('bootstrap5nt:carousel', 'default'), {}, ctx).container.querySelector('.carousel') as HTMLElement;
    }

    test('no settings → Bootstrap defaults are left alone (pauses on hover)', () => {
      expect(render(null)).not.toHaveAttribute('data-bs-pause');
    });

    test('pause on hover unticked → data-bs-pause="false" ("hover" is the default, omitting it changes nothing)', () => {
      expect(render({ pause: 'false' })).toHaveAttribute('data-bs-pause', 'false');
    });

    test('pause on hover ticked → data-bs-pause="hover"', () => {
      expect(render({ pause: 'true' })).toHaveAttribute('data-bs-pause', 'hover');
    });

    test('dark variant → data-bs-theme="dark" (carousel-dark is deprecated since 5.3)', () => {
      expect(render({ variant: 'dark' })).toHaveAttribute('data-bs-theme', 'dark');
      expect(render({ variant: 'white' })).not.toHaveAttribute('data-bs-theme');
    });
  });

  describe('navbar defaults', () => {
    test('no customisation → documented classes, without the deprecated navbar-light / bg-light', () => {
      const ctx = {
        currentNode: makeNode({ _id: 'nav-d', _nodeName: 'nav' }),
        renderContext: makeRenderContext({ _previewMode: true }),
        mainNode: makeNode({ _id: 'page', _path: '/sites/test/home' }),
      };
      _setContext(ctx);
      const { container } = renderFn(_getComponent('bootstrap5nt:navbar', 'default'), {}, ctx);
      const nav = container.querySelector('nav') as HTMLElement;
      expect(nav.className).toBe('navbar navbar-expand-lg bg-body-tertiary');
      expect(container.querySelector('.navbar-toggler')?.className).toBe('navbar-toggler');
    });

    test('login modal follows .modal > .modal-dialog > .modal-content, the form being the content', () => {
      const ctx = {
        currentNode: makeNode({ _id: 'nav-l', _nodeName: 'nav' }),
        renderContext: makeRenderContext({ _previewMode: true }),
        mainNode: makeNode({ _id: 'page', _path: '/sites/test/home' }),
      };
      _setContext(ctx);
      const { container } = renderFn(_getComponent('bootstrap5nt:navbar', 'default'), {}, ctx);
      const form = container.querySelector('.modal > .modal-dialog > form.modal-content');
      expect(form).toHaveAttribute('name', 'loginForm');
      expect(form?.querySelector('.modal-header')).toBeInTheDocument();
      expect(form?.querySelector('.modal-footer button[type="submit"]')).toBeInTheDocument();
      // autofocus has no effect in a Bootstrap modal: the field is focused by script when shown
      expect(form?.querySelector('input[name="username"]')).toHaveAttribute('data-b5-autofocus', 'true');
      expect(form?.querySelector('[autofocus]')).not.toBeInTheDocument();
    });
  });

  describe('button', () => {
    function render(props: any) {
      const ctx = makeCtx({ _id: 'btn-d' });
      _setContext(ctx);
      return renderFn(_getComponent('bootstrap5nt:button', 'default'), props, ctx).container;
    }

    test('outline + link style → btn-link (btn-outline-link does not exist)', () => {
      const link = render({ buttonType: 'externalLink', externalLink: 'https://example.com', style: 'link', outline: true }).querySelector('a');
      expect(link?.className).toContain('btn-link');
      expect(link?.className).not.toContain('btn-outline-link');
    });

    test('modal without title → named by its button, no dangling aria-labelledby', () => {
      const modal = render({ buttonType: 'modal', 'jcr:title': 'Open' }).querySelector('.modal');
      expect(modal).not.toHaveAttribute('aria-labelledby');
      expect(modal).toHaveAttribute('aria-label', 'Open');
    });

    test('modal with the custom style → its close button falls back to btn-secondary', () => {
      const close = render({ buttonType: 'modal', style: 'custom', cssClass: 'my-btn' }).querySelector('.modal-footer button');
      expect(close?.className).toBe('btn btn-secondary');
    });
  });

  test('text colour "muted" → text-body-secondary (text-muted is deprecated since 5.3)', () => {
    expect(textColorClass('muted')).toBe('text-body-secondary');
    expect(textColorClass('light')).toBe('text-light');
    expect(textColorClass('')).toBe('');
  });
});
