import { _setContext, _getComponent } from '@jahia/javascript-modules-library';
import { makeNode, makeRenderContext, renderFn } from '../helpers';

import '../../components/PrivacySettingsModal/bootstrap5.server';

describe('wemnt:privacySettingsModal (bootstrap5 view)', () => {
  function getPrivacyFn() {
    return _getComponent('wemnt:privacySettingsModal', 'bootstrap5');
  }

  function makePrivacyCtx(props: {
    anonymizeProfile?: boolean;
    activatePrivateBrowsing?: boolean;
    buttonType?: string;
    cssClass?: string;
    htmlId?: string;
    captiveModal?: boolean;
    editMode?: boolean;
  } = {}) {
    const nodeProperties: Record<string, any> = {};
    if (props.anonymizeProfile !== undefined) nodeProperties['wem:anonymizeProfile'] = props.anonymizeProfile;
    if (props.activatePrivateBrowsing !== undefined) nodeProperties['wem:activatePrivateBrowsing'] = props.activatePrivateBrowsing;
    if (props.buttonType !== undefined) nodeProperties['wem:buttonType'] = props.buttonType;
    if (props.cssClass !== undefined) nodeProperties['wem:buttonCssClass'] = props.cssClass;
    if (props.htmlId !== undefined) nodeProperties['wem:buttonHtmlId'] = props.htmlId;
    if (props.captiveModal !== undefined) nodeProperties['wem:captiveModal'] = props.captiveModal;

    const currentNode = makeNode({
      _id: 'privacy-1',
      _properties: nodeProperties,
    });

    const ctx = {
      currentNode,
      renderContext: makeRenderContext({ _editMode: props.editMode ?? false }),
      mainNode: currentNode,
    };
    _setContext(ctx);
    return ctx;
  }

  test('neither anonymizeProfile nor activatePrivateBrowsing + edit mode → error alert', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: false, activatePrivateBrowsing: false, editMode: true });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('.alert-danger')).toBeInTheDocument();
  });

  test('neither + live mode → null (no output)', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: false, activatePrivateBrowsing: false, editMode: false });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    // Should render nothing
    expect(container.querySelector('.modal')).not.toBeInTheDocument();
    expect(container.querySelector('.alert-danger')).not.toBeInTheDocument();
  });

  test('anonymizeProfile=true → anonymize button visible', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: true, activatePrivateBrowsing: false });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    // The anonymize div/button should be rendered
    const buttons = container.querySelectorAll('button.btn.btn-default.button-privacy');
    // At least 2: download + anonymize
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  test('activatePrivateBrowsing=true → privateBrowsing button visible', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: false, activatePrivateBrowsing: true });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    // The privateBrowsing button has id=privateBrowsing_{id}
    expect(container.querySelector('#privateBrowsing_privacy-1')).toBeInTheDocument();
  });

  test('both enabled → both buttons visible', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: true, activatePrivateBrowsing: true });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('#privateBrowsing_privacy-1')).toBeInTheDocument();
    const privacyButtons = container.querySelectorAll('.button-privacy');
    // download + anonymize + privateBrowsing = at least 3
    expect(privacyButtons.length).toBeGreaterThanOrEqual(3);
  });

  test('buttonType="tagButton" → renders <button>', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: true, buttonType: 'tagButton' });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    // The trigger element should be a button (not an anchor)
    // The modal trigger button has data-bs-target
    const triggerButton = container.querySelector('button[data-bs-target]');
    expect(triggerButton).toBeInTheDocument();
  });

  test('buttonType="tagLink" → renders <a>', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: true, buttonType: 'tagLink' });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    // The trigger element should be an anchor
    const triggerLink = container.querySelector('a[role="button"]');
    expect(triggerLink).toBeInTheDocument();
  });

  test('cssClass on button/link', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: true, buttonType: 'tagButton', cssClass: 'my-trigger-class' });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    const triggerButton = container.querySelector('button[data-bs-target]');
    expect(triggerButton).toHaveClass('my-trigger-class');
  });

  test('htmlId → id attribute on trigger', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: true, buttonType: 'tagButton', htmlId: 'my-trigger-id' });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('#my-trigger-id')).toBeInTheDocument();
  });

  test('modalId uses currentNode.getIdentifier()', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: true });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('#privacyModal_privacy-1')).toBeInTheDocument();
  });

  test('modal always has data-backdrop="static"', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: true });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    const modal = container.querySelector('.modal');
    expect(modal).toHaveAttribute('data-backdrop', 'static');
  });

  test('tab structure: Consents + Settings tabs', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: true });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    const tabs = container.querySelectorAll('ul.nav-tabs li');
    expect(tabs.length).toBe(2);
  });

  test('consents tab pane rendered', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: true });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('#consents_privacy-1')).toBeInTheDocument();
  });

  test('settings tab pane rendered', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: true });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    expect(container.querySelector('#settings_privacy-1')).toBeInTheDocument();
  });

  test('AddResources for CSS and JS always rendered', () => {
    const ctx = makePrivacyCtx({ anonymizeProfile: true });
    const fn = getPrivacyFn();
    const { container } = renderFn(fn, {}, ctx);
    const resources = container.querySelectorAll('[data-testid="add-resources"]');
    expect(resources.length).toBeGreaterThanOrEqual(2);
  });
});
