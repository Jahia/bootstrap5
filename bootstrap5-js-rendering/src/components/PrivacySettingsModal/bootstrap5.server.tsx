/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 */

/**
 * wemnt:privacySettingsModal — GDPR privacy modal for Jahia Experience Manager (WEM).
 * Renders a trigger button/link and a Bootstrap modal with consent tabs and settings.
 * WEM-specific client-side APIs (manageWemPrivacy, wem.*) must be wired up separately
 * once available in the JS engine.
 */
import {
  AddResources,
  jahiaComponent,
  useServerContext,
} from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";

jahiaComponent(
  {
    nodeType: "wemnt:privacySettingsModal",
    componentType: "view",
    name: "bootstrap5",
    displayName: "Privacy Settings Modal (Bootstrap 5)",
  },
  () => {
    const { currentNode, renderContext } = useServerContext();
    const { t } = useTranslation();
    const isEditMode = renderContext.isEditMode();
    const id = currentNode.getIdentifier();

    const anonymizeProfile = currentNode.getProperty("wem:anonymizeProfile")?.getBoolean() ?? false;
    const activatePrivateBrowsing = currentNode.getProperty("wem:activatePrivateBrowsing")?.getBoolean() ?? false;

    // If neither option is enabled, show an error in edit mode only
    if (!anonymizeProfile && !activatePrivateBrowsing) {
      if (!isEditMode) return null;
      return (
        <div className="alert alert-danger">
          {t("wemnt_privacySettingsModal.error.noButtonToDisplay")}
        </div>
      );
    }

    const cssClass = currentNode.getProperty("wem:buttonCssClass")?.getString() ?? "";
    const htmlId = currentNode.getProperty("wem:buttonHtmlId")?.getString() ?? "";
    const buttonType = currentNode.getProperty("wem:buttonType")?.getString() ?? "tagLink";
    const captiveModal = currentNode.getProperty("wem:captiveModal")?.getBoolean() ?? false;

    const privacyModalButtonLabel =
      currentNode.getProperty("wem:privacyModalButtonLabel")?.getString() ||
      t("wemnt_privacySettingsModal.button.privacy");

    const privacyModalTitle =
      currentNode.getProperty("wem:privacyModalTitle")?.getString() ||
      t("wemnt_privacySettingsModal.title.privacy");

    const privacyModalInfo =
      currentNode.getProperty("wem:privacyModalInfo")?.getString() ||
      t("wemnt_privacySettingsModal.info");

    const startPrivateBrowsingButton =
      currentNode.getProperty("wem:startPrivateBrowsingButtonLabel")?.getString() ||
      t("wemnt_privacySettingsModal.wem_activatePrivateBrowsing.button.start");

    const stopPrivateBrowsingButton =
      currentNode.getProperty("wem:stopPrivateBrowsingButtonLabel")?.getString() ||
      t("wemnt_privacySettingsModal.wem_activatePrivateBrowsing.button.stop");

    const downloadMyProfileButtonLabel =
      currentNode.getProperty("wem:downloadMyProfileButtonLabel")?.getString() ||
      t("wemnt_privacySettingsModal.wem_downloadMyProfile.button");

    const anonymizeProfileButtonLabel =
      currentNode.getProperty("wem:anonymizeProfileButtonLabel")?.getString() ||
      t("wemnt_privacySettingsModal.wem_anonymizeProfile.button");

    const modalId = `privacyModal_${id}`;
    const openCall = `manageWemPrivacyInstances['${id}'].openModal(true)`;

    // TODO: inject manageWemPrivacy instance via AddResources inline script once
    // wem-manage-privacy.js and the consent types URL are available in the JS engine.

    return (
      <>
        <AddResources type="css" resources="bootstrap.min.css" />
        <AddResources
          type="javascript"
          resources="bootstrap.bundle.min.js"
          targetTag={isEditMode ? "head" : "body"}
        />

        {/* Trigger — button or link */}
        {buttonType === "tagButton" ? (
          <button
            type="button"
            className={cssClass}
            {...(htmlId ? { id: htmlId } : {})}
            data-bs-target={`#${modalId}`}
            onClick={() => { /* manageWemPrivacyInstances[id].openModal(true) — client-side */ }}
          >
            {privacyModalButtonLabel}
          </button>
        ) : (
          <a
            href={`#${modalId}`}
            role="button"
            className={cssClass}
            {...(htmlId ? { id: htmlId } : {})}
          >
            {privacyModalButtonLabel}
          </a>
        )}

        {/* Modal */}
        <div
          id={modalId}
          className="modal fade"
          role="dialog"
          data-backdrop="static"
          data-keyboard="false"
        >
          <div className="modal-dialog wem-privacy-manager" role="document">
            <div className="modal-content">
              {/* Header */}
              <div className="modal-header">
                <button
                  type="button"
                  className="close"
                  id={`closeDialogTopButton_${id}`}
                  hidden
                  aria-hidden="true"
                >
                  &times;
                </button>
                <h4 className="modal-title">{privacyModalTitle}</h4>
              </div>

              {/* Body */}
              <div className="modal-body">
                {/* Nav tabs */}
                <ul className="nav nav-tabs" role="tablist" id={`#privacyTabs_${id}`}>
                  <li role="presentation" className="active">
                    <a
                      href={`#consents_${id}`}
                      aria-controls="home"
                      role="tab"
                      data-toggle="tab"
                    >
                      {t("wemnt_privacySettingsModal.label.consents")}
                    </a>
                  </li>
                  <li role="presentation">
                    <a
                      href={`#settings_${id}`}
                      aria-controls="settings"
                      role="tab"
                      data-toggle="tab"
                    >
                      {t("wemnt_privacySettingsModal.label.settings")}
                    </a>
                  </li>
                </ul>

                {/* Tab panes */}
                <div className="tab-content">
                  {/* Consents tab */}
                  <div role="tabpanel" className="tab-pane active" id={`consents_${id}`}>
                    <div
                      id={`consentLoadNetworkError_${id}`}
                      className="alert alert-danger"
                    >
                      {t("wemnt_privacySettingsModal.error.consentLoadNetworkError")}
                    </div>
                    {/* Consent list populated by manageWemPrivacy JS */}
                    <div id={`consents_list_${id}`} />
                  </div>

                  {/* Settings tab */}
                  <div role="tabpanel" className="tab-pane" id={`settings_${id}`}>
                    {isEditMode && (
                      <div className="alert alert-info">
                        {t("wemnt_privacySettingsModal.info.buttonDisabled")}
                      </div>
                    )}
                    <p dangerouslySetInnerHTML={{ __html: privacyModalInfo }} />

                    {/* Download profile */}
                    <button
                      type="button"
                      className="btn btn-default button-privacy"
                      disabled={isEditMode}
                    >
                      {downloadMyProfileButtonLabel}
                    </button>

                    {/* Anonymize profile */}
                    {anonymizeProfile && (
                      <>
                        <button
                          type="button"
                          className="btn btn-default button-privacy"
                          disabled={isEditMode}
                        >
                          {anonymizeProfileButtonLabel}
                        </button>
                        <div
                          id={`anonymizeError_${id}`}
                          className="alert alert-danger"
                        >
                          {t("wemnt_privacySettingsModal.wem_anonymizeProfile.error")}
                        </div>
                      </>
                    )}

                    {/* Private browsing toggle */}
                    {activatePrivateBrowsing && (
                      <>
                        <button
                          id={`privateBrowsing_${id}`}
                          type="button"
                          className="btn button-privacy"
                          disabled={isEditMode}
                        >
                          {/* Label set dynamically by manageWemPrivacy.js */}
                          {isEditMode ? startPrivateBrowsingButton : null}
                        </button>
                        <div
                          id={`privateBrowsingError_${id}`}
                          className="alert alert-danger"
                        >
                          {t("wemnt_privacySettingsModal.wem_activatePrivateBrowsing.error")}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-default"
                  id={`closeDialogLowerButton_${id}`}
                  hidden
                  aria-hidden="true"
                >
                  {t("label.close")}
                </button>
                <p
                  className="text-danger"
                  hidden
                  id={`incompleteConsentsWarning_${id}`}
                >
                  {t("wemnt_privacySettingsModal.error.incompleteConsents")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  },
);
