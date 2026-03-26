import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeCtx, renderFn } from '../helpers';

import '../../components/Alert/default.server';

describe('jmix:skinnable skins.alert view', () => {
  function getAlertFn() {
    return _getComponent('jmix:skinnable', 'skins.alert');
  }

  function makeAlertCtx() {
    const ctx = makeCtx();
    _setContext(ctx);
    return ctx;
  }

  test('backgroundColor="primary" → class "alert alert-primary"', () => {
    const ctx = makeAlertCtx();
    const fn = getAlertFn();
    const { container } = renderFn(fn, { backgroundColor: 'primary' }, ctx);
    const div = container.querySelector('.alert');
    expect(div).toBeInTheDocument();
    expect(div).toHaveClass('alert-primary');
  });

  test('backgroundColor="danger" → class "alert alert-danger"', () => {
    const ctx = makeAlertCtx();
    const fn = getAlertFn();
    const { container } = renderFn(fn, { backgroundColor: 'danger' }, ctx);
    const div = container.querySelector('.alert');
    expect(div).toHaveClass('alert-danger');
  });

  test('default backgroundColor is "primary"', () => {
    const ctx = makeAlertCtx();
    const fn = getAlertFn();
    const { container } = renderFn(fn, {}, ctx);
    const div = container.querySelector('.alert');
    expect(div).toHaveClass('alert-primary');
  });

  test('addDismissButton=false → no close button, no dismissible class', () => {
    const ctx = makeAlertCtx();
    const fn = getAlertFn();
    const { container } = renderFn(fn, { backgroundColor: 'primary', addDismissButton: false }, ctx);
    const div = container.querySelector('.alert');
    expect(div).not.toHaveClass('alert-dismissible');
    expect(div).not.toHaveClass('fade');
    expect(div).not.toHaveClass('show');
    expect(container.querySelector('.btn-close')).not.toBeInTheDocument();
  });

  test('addDismissButton=true → alert-dismissible fade show + close button', () => {
    const ctx = makeAlertCtx();
    const fn = getAlertFn();
    const { container } = renderFn(fn, { backgroundColor: 'info', addDismissButton: true }, ctx);
    const div = container.querySelector('.alert');
    expect(div).toHaveClass('alert-dismissible');
    expect(div).toHaveClass('fade');
    expect(div).toHaveClass('show');
    const closeBtn = container.querySelector('.btn-close');
    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).toHaveAttribute('data-bs-dismiss', 'alert');
  });

  test('role="alert" always present', () => {
    const ctx = makeAlertCtx();
    const fn = getAlertFn();
    const { container } = renderFn(fn, { backgroundColor: 'success' }, ctx);
    const div = container.querySelector('.alert');
    expect(div).toHaveAttribute('role', 'alert');
  });

  test('renders RenderChildren inside alert', () => {
    const ctx = makeAlertCtx();
    const fn = getAlertFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('[data-testid="render-children"]')).toBeInTheDocument();
  });
});
