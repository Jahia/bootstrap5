import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeCtx, renderFn } from '../helpers';

import '../../components/Version/default.server';

describe('bootstrap5nt:version (default view)', () => {
  function getVersionFn() {
    return _getComponent('bootstrap5nt:version', 'default');
  }

  test('live mode → renders div with "bootstrap5-components" text', () => {
    const ctx = makeCtx({}, { _editMode: false });
    _setContext(ctx);
    const fn = getVersionFn();
    const { container } = renderFn(fn, {}, ctx);
    const div = container.querySelector('[data-testid="bs5-version"]');
    expect(div).toBeInTheDocument();
    expect(div?.textContent).toContain('bootstrap5-components');
  });

  test('live mode → no [edit mode] span', () => {
    const ctx = makeCtx({}, { _editMode: false });
    _setContext(ctx);
    const fn = getVersionFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.textContent).not.toContain('[edit mode]');
  });

  test('edit mode → renders div with "[edit mode]" span', () => {
    const ctx = makeCtx({}, { _editMode: true });
    _setContext(ctx);
    const fn = getVersionFn();
    const { container } = renderFn(fn, {}, ctx);
    const div = container.querySelector('[data-testid="bs5-version"]');
    expect(div).toBeInTheDocument();
    const span = div?.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span?.textContent).toContain('[edit mode]');
  });

  test('edit mode → still shows "bootstrap5-components" text', () => {
    const ctx = makeCtx({}, { _editMode: true });
    _setContext(ctx);
    const fn = getVersionFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.textContent).toContain('bootstrap5-components');
  });
});
