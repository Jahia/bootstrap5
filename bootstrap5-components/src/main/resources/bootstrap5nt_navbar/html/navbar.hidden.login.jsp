<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="ui" uri="http://www.jahia.org/tags/uiComponentsLib" %>

<%--@elvariable id="currentUser" type="org.jahia.services.usermanager.JahiaUser"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<%--@elvariable id="currentAliasUser" type="org.jahia.services.usermanager.JahiaUser"--%>
<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:customizeNavbar')}">
    <c:set var="loginMenuULClass" value="${currentNode.properties.loginMenuULClass.string}"/>
</c:if>
<c:if test="${empty loginMenuULClass}">
    <c:set var="loginMenuULClass" value="navbar-nav ms-auto"/>
</c:if>
<c:choose>
    <c:when test="${renderContext.loggedIn}">
        <ul class="${loginMenuULClass}">
            <li class="nav-item dropdown">
                <a class="nav-item nav-link dropdown-toggle me-md-2" href="#" id="list-${currentNode.identifier}"
                 data-bs-toggle="dropdown" aria-expanded="false" role="button">
                        ${currentUser.username}
                </a>
                <ul class="dropdown-menu" aria-labelledby="list-${currentNode.identifier}">
                    <c:if test="${!renderContext.settings.distantPublicationServerMode and renderContext.mainResource.node.properties['j:originWS'].string ne 'live' and not jcr:isNodeType(renderContext.mainResource.node.resolveSite, 'jmix:remotelyPublished')}">
                        <c:if test="${! renderContext.liveMode}">
                            <li>
                                <a href="<c:url value='${url.live}'/>" class="dropdown-item text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                    </svg>
                                    <fmt:message key="bootstrap5nt_navbar.label.live"/>
                                </a>
                            </li>
                        </c:if>
                        <c:if test="${! renderContext.previewMode && jcr:hasPermission(renderContext.mainResource.node, 'jContentAccess')}">
                            <li>
                                <a href="<c:url value='${url.preview}'/>" class="dropdown-item text-secondary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                    </svg>
                                    <fmt:message key="bootstrap5nt_navbar.label.preview"/>
                                </a>
                            </li>
                        </c:if>
                        <c:if test="${! renderContext.editMode && jcr:hasPermission(renderContext.mainResource.node, 'jContentAccess')}">
                            <li>
                                <a href="<c:url value='${url.edit}'/>" class="dropdown-item text-success">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                    </svg>
                                    <fmt:message key="bootstrap5nt_navbar.label.edit"/>
                                </a>
                            </li>
                        </c:if>
                        <c:if test="${! renderContext.editMode && !jcr:hasPermission(renderContext.mainResource.node, 'jContentAccess') && jcr:hasPermission(renderContext.mainResource.node, 'contributeModeAccess')}">
                            <li>
                                <a href="<c:url value='${url.contribute}'/>" class="dropdown-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                    </svg>
                                    <fmt:message key="bootstrap5nt_navbar.label.contribute"/>
                                </a>
                            </li>
                        </c:if>
                    </c:if>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <a class="dropdown-item" href="${url.logout}" class="logout">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-left" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z"/>
                                <path fill-rule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z"/>
                            </svg>
                            <fmt:message key="bootstrap5nt_navbar.label.logout"/>
                        </a>
                    </li>
                </ul>
            </li>
        </ul>
    </c:when>
    <c:otherwise>
        <ul class="${loginMenuULClass}">
            <li class="nav-item">
                <%--<a class="nav-link p-2 login" href="${url.login}" >--%>
                <a class="nav-link py-2 login" href="#" role="button" data-bs-toggle="modal" data-bs-target="#login-${currentNode.identifier}">
                    <fmt:message key="bootstrap5nt_navbar.label.login"/>
                </a>
            </li>
        </ul>
    </c:otherwise>
</c:choose>

<c:if test="${!renderContext.loggedIn || currentAliasUser.username eq 'guest'}">
    <div class="modal fade" id="login-${currentNode.identifier}" tabindex="-1" aria-labelledby="login-${currentNode.identifier}-label" aria-hidden="true">
        <ui:loginArea onsubmit="loginButton.disabled = true; return true;">
        <div class="modal-dialog modal-sm modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="login-${currentNode.identifier}-label"><fmt:message key="bootstrap5nt_navbar.label.pleaselogin"/></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ui:isLoginError var="loginResult">
                        <div class="alert alert-danger" role="alert">
                            <fmt:message key="${loginResult == 'account_locked' ? 'message.accountLocked' : 'message.invalidUsernamePassword'}"/>
                        </div>
                        <c:set var="error" value="true"/>
                    </ui:isLoginError>
                    <c:if test="${! empty param.loginError}">
                        <div class="alert alert-warning" role="alert">
                            <fmt:message key="${param.loginError == 'account_locked' ? 'message.accountLocked' : 'message.invalidUsernamePassword'}"/>
                        </div>
                        <c:set var="error" value="true"/>
                    </c:if>
                    <c:if test="${error}">
                        <template:addResources type="inline" targetTag="${renderContext.editMode?'head':'body'}">
                        <script>
                            var myModal = new bootstrap.Modal(document.getElementById('login-${currentNode.identifier}'), {
                                keyboard: false
                            })
                            myModal.show();
                        </script>
                        </template:addResources>
                    </c:if>

                        <div class="input-group mb-3">
                            <fmt:message key="label.username" var="usernameLabel"/>
                            <span class="input-group-text" id="username">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                                  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                </svg>
                            </span>
                            <input type="text" class="form-control" id="username" name="username" placeholder="${fn:escapeXml(usernameLabel)}" <c:if test="${! empty username}"><c:out value=" "/>value="${fn:escapeXml(username)}"</c:if> required autofocus aria-describedby="username">
                        </div>

                        <%--<div class="form-floating mb-3">
                            <fmt:message key="label.username" var="usernameLabel"/>
                            <c:set var="username" value="${param.username}"/>
                            <input type="text" class="form-control" id="username" name="username" placeholder="${fn:escapeXml(usernameLabel)}" <c:if test="${! empty username}"><c:out value=" "/>value="${fn:escapeXml(username)}"</c:if> required autofocus>
                            <label for="floatingInput">${usernameLabel}</label>
                        </div>
                        --%>
                        <div class="input-group mb-3">
                            <fmt:message key="label.password" var="passwordLabel"/>
                            <span class="input-group-text" id="password">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-key-fill" viewBox="0 0 16 16">
                                  <path d="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2zM2.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                                </svg>
                            </span>
                            <input type="password" class="form-control" id="password" name="password" placeholder="${fn:escapeXml(passwordLabel)}" required aria-describedby="password">
                        </div>

                        <%--
                        <div class="form-floating">
                            <fmt:message key="label.password" var="passwordLabel"/>
                            <input type="password" class="form-control" id="password" name="password" placeholder="${fn:escapeXml(passwordLabel)}" required>
                            <label for="password">${passwordLabel}</label>
                        </div>
                        --%>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="useCookie" name="useCookie">
                            <label class="form-check-label" for="useCookie">
                                <fmt:message key="loginForm.rememberMe.label"/>
                            </label>
                        </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" name="loginButton" class="btn btn-primary"><fmt:message key='bootstrap5nt_navbar.label.login'/></button>
                </div>

            </div>
        </div>
        </ui:loginArea>
    </div>
</c:if>
