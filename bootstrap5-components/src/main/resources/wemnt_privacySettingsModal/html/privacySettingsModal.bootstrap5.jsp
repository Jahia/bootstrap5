<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jstl/fmt_rt" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>


<c:choose>
    <c:when test="${currentNode.properties['wem:anonymizeProfile'].boolean or currentNode.properties['wem:activatePrivateBrowsing'].boolean}">
        <template:addResources type="css" resources="bootstrap.min.css"/>
        <template:addResources type="javascript" resources="jquery.min.js,jexperience-components/wem-manage-privacy.js"/>
        <template:addResources type="javascript" resources="bootstrap.bundle.min.js" targetTag="${renderContext.editMode?'head':'body'}"/>

        <c:set var="cssClass" value="${currentNode.properties['wem:buttonCssClass'].string}"/>
        <c:set var="htmlId" value="${currentNode.properties['wem:buttonHtmlId'].string}"/>

        <fmt:message var="startPrivateBrowsingButton" key="wemnt_privacySettingsModal.wem_activatePrivateBrowsing.button.start"/>
        <c:if test="${not empty currentNode.properties['wem:startPrivateBrowsingButtonLabel']}">
            <c:set var="startPrivateBrowsingButton" value="${currentNode.properties['wem:startPrivateBrowsingButtonLabel'].string}"/>
        </c:if>
        <fmt:message var="stopPrivateBrowsingButton" key="wemnt_privacySettingsModal.wem_activatePrivateBrowsing.button.stop"/>
        <c:if test="${not empty currentNode.properties['wem:stopPrivateBrowsingButtonLabel']}">
            <c:set var="stopPrivateBrowsingButton" value="${currentNode.properties['wem:stopPrivateBrowsingButtonLabel'].string}"/>
        </c:if>

        <fmt:message var="switchOnText" key="wem.label.yes"/>
        <fmt:message var="switchOffText" key="wem.label.no"/>
        <template:addResources>
            <script>
                $(document).ready(function () {
                    window.manageWemPrivacyInstances = window.manageWemPrivacyInstances || {};
                    window.manageWemPrivacyInstances['${currentNode.identifier}'] = manageWemPrivacy.createInstance('${currentNode.identifier}',
                        {
                            <c:if test="${currentNode.properties['wem:activatePrivateBrowsing'].boolean and not renderContext.editMode}">
                            activatePrivateBrowsing: true,
                            </c:if>
                            <c:if test="${currentNode.properties['wem:anonymizeProfile'].boolean}">
                            anonymizeProfile: true,
                            </c:if>
                            stopPrivateBrowsingButton : '${functions:escapeJavaScript(stopPrivateBrowsingButton)}',
                            startPrivateBrowsingButton : '${functions:escapeJavaScript(startPrivateBrowsingButton)}',
                            switchOffText : '${fn:toUpperCase(switchOffText)}',
                            switchOnText : '${fn:toUpperCase(switchOnText)}',
                            <c:if test="${currentNode.properties['wem:captiveModal'].boolean}">
                            captiveModal: true,
                            </c:if>
                            consentTypesUrl : '${url.context}${url.baseLive}${renderContext.site.path}.getConsentTypes.do'
                        });
                });
            </script>
        </template:addResources>

        <fmt:message var="privacyModalButtonLabel" key="wemnt_privacySettingsModal.button.privacy"/>
        <c:if test="${not empty currentNode.properties['wem:privacyModalButtonLabel']}">
            <c:set var="privacyModalButtonLabel" value="${currentNode.properties['wem:privacyModalButtonLabel'].string}"/>
        </c:if>

        <c:choose>
            <c:when test="${currentNode.properties['wem:buttonType'].string eq 'tagButton'}">
                <button type="button" class="${cssClass}" <c:if test="${not empty htmlId}"> id="${htmlId}"</c:if>
                        bs-data-target="#privacyModal_${currentNode.identifier}"
                        onclick="manageWemPrivacyInstances['${currentNode.identifier}'].openModal(true)">
                        ${privacyModalButtonLabel}
                </button>
            </c:when>
            <c:otherwise>
                <a href="#privacyModal_${currentNode.identifier}" <c:if test="${not empty htmlId}"> id="${htmlId}"</c:if>
                   role="button" class="${cssClass}"
                   onclick="manageWemPrivacyInstances['${currentNode.identifier}'].openModal(true)">
                        ${privacyModalButtonLabel}
                </a>
            </c:otherwise>
        </c:choose>


        <div id="privacyModal_${currentNode.identifier}" class="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
            <div class="modal-dialog wem-privacy-manager" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" id="closeDialogTopButton_${currentNode.identifier}" hidden="true" onclick="manageWemPrivacyInstances['${currentNode.identifier}'].closeModal()" aria-hidden="true">&times;</button>

                        <fmt:message var="privacyModalTitle" key="wemnt_privacySettingsModal.title.privacy"/>
                        <c:if test="${not empty currentNode.properties['wem:privacyModalTitle']}">
                            <c:set var="privacyModalTitle" value="${currentNode.properties['wem:privacyModalTitle'].string}"/>
                        </c:if>
                        <h4 class="modal-title">${privacyModalTitle}</h4>
                    </div>

                    <div class="modal-body">
                        <!-- Nav tabs -->
                        <ul class="nav nav-tabs" role="tablist" id="#privacyTabs_${currentNode.identifier}">
                            <li role="presentation" class="active">
                                <a href="#consents_${currentNode.identifier}" aria-controls="home" role="tab" data-toggle="tab">
                                    <fmt:message key="wemnt_privacySettingsModal.label.consents"/>
                                </a>
                            </li>
                            <li role="presentation">
                                <a href="#settings_${currentNode.identifier}" aria-controls="settings" role="tab" data-toggle="tab">
                                    <fmt:message key="wemnt_privacySettingsModal.label.settings"/>
                                </a>
                            </li>
                        </ul>

                        <!-- Tab panes -->
                        <div class="tab-content">
                            <div role="tabpanel" class="tab-pane active" id="consents_${currentNode.identifier}">
                                <div id="consentLoadNetworkError_${currentNode.identifier}" class="alert alert-danger">
                                    <fmt:message key="wemnt_privacySettingsModal.error.consentLoadNetworkError"/>
                                </div>
                                <div id="consents_list_${currentNode.identifier}">
                                </div>
                            </div>
                            <div role="tabpanel" class="tab-pane" id="settings_${currentNode.identifier}">
                                <c:if test="${renderContext.editMode}">
                                    <div class="alert alert-info">
                                        <fmt:message key="wemnt_privacySettingsModal.info.buttonDisabled"/>
                                    </div>
                                </c:if>

                                <p>
                                    <fmt:message var="privacyModalInfo" key="wemnt_privacySettingsModal.info"/>
                                    <c:if test="${not empty currentNode.properties['wem:privacyModalInfo']}">
                                        <c:set var="privacyModalInfo" value="${currentNode.properties['wem:privacyModalInfo'].string}"/>
                                    </c:if>
                                        ${privacyModalInfo}
                                </p>

                                <fmt:message var="downloadMyProfileButtonLabel" key="wemnt_privacySettingsModal.wem_downloadMyProfile.button"/>
                                <c:if test="${not empty currentNode.properties['wem:downloadMyProfileButtonLabel']}">
                                    <c:set var="downloadMyProfileButtonLabel" value="${currentNode.properties['wem:downloadMyProfileButtonLabel'].string}"/>
                                </c:if>
                                <button type="button" class="btn btn-default button-privacy"
                                        onclick="wem.downloadMyProfile()"
                                        <c:if test="${renderContext.editMode}">disabled</c:if>>
                                        ${downloadMyProfileButtonLabel}
                                </button>

                                <c:if test="${currentNode.properties['wem:anonymizeProfile'].boolean and not renderContext.loggedIn}">
                                    <fmt:message var="anonymizeProfileButtonLabel" key="wemnt_privacySettingsModal.wem_anonymizeProfile.button"/>
                                    <c:if test="${not empty currentNode.properties['wem:anonymizeProfileButtonLabel']}">
                                        <c:set var="anonymizeProfileButtonLabel" value="${currentNode.properties['wem:anonymizeProfileButtonLabel'].string}"/>
                                    </c:if>
                                    <button type="button" class="btn btn-default button-privacy"
                                            onclick="wem.anonymizeProfile(manageWemPrivacyInstances['${currentNode.identifier}'].onSuccess, function(xhr) {$('#anonymizeError').show(); console.error(xhr.responseText)})"
                                            <c:if test="${renderContext.editMode}">disabled</c:if>>
                                            ${anonymizeProfileButtonLabel}
                                    </button>
                                    <div id="anonymizeError_${currentNode.identifier}" class="alert alert-danger">
                                        <fmt:message key="wemnt_privacySettingsModal.wem_anonymizeProfile.error"/>
                                    </div>
                                </c:if>

                                <c:if test="${currentNode.properties['wem:activatePrivateBrowsing'].boolean}">
                                    <button id="privateBrowsing_${currentNode.identifier}"
                                            type="button" class="btn button-privacy"
                                            onclick="wem.togglePrivateBrowsing(manageWemPrivacyInstances['${currentNode.identifier}'].onSuccess, function(xhr) {$('#privateBrowsingError').show(); console.error(xhr.responseText)})"
                                            <c:if test="${renderContext.editMode}">disabled</c:if>>
                                        <c:if test="${renderContext.editMode}">
                                            ${startPrivateBrowsingButton}
                                        </c:if>
                                    </button>
                                    <div id="privateBrowsingError_${currentNode.identifier}" class="alert alert-danger">
                                        <fmt:message key="wemnt_privacySettingsModal.wem_activatePrivateBrowsing.error"/>
                                    </div>
                                </c:if>
                            </div>
                        </div>

                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" id="closeDialogLowerButton_${currentNode.identifier}" hidden="true" onclick="manageWemPrivacyInstances['${currentNode.identifier}'].closeModal()" aria-hidden="true">
                            <fmt:message key="label.close"/>
                        </button>
                        <p class="text-danger" hidden="true" id="incompleteConsentsWarning_${currentNode.identifier}"><fmt:message key="wemnt_privacySettingsModal.error.incompleteConsents"/></p>
                    </div>
                </div>
            </div>
        </div>
    </c:when>
    <c:otherwise>
        <c:if test="${renderContext.editMode}">
            <div class="alert alert-danger">
                <fmt:message key="wemnt_privacySettingsModal.error.noButtonToDisplay"/>
            </div>
        </c:if>
    </c:otherwise>
</c:choose>
