<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="b4" uri="http://www.jahia.org/b4" %>
<%@ taglib prefix="ui" uri="http://www.jahia.org/tags/uiComponentsLib" %>

<%--@elvariable id="currentUser" type="org.jahia.services.usermanager.JahiaUser"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>

<c:set var="mainResourceNode" value="${renderContext.mainResource.node}"/>

<c:catch var="errorLanguages">
    <ui:initLangBarAttributes activeLanguagesOnly="${renderContext.liveMode}"/>
    <c:set var="languageCodes" value="${requestScope.languageCodes}"/>
    <c:if test="${fn:length(languageCodes)>1}">
        <div class="dropdown navbar-nav language-nav">
            <a href="#" class="dropdown-toggle nav-link" id="languageSwitchButton" data-toggle="dropdown" aria-haspopup="true"
               aria-expanded="false" aria-label="<fmt:message key='bootstrap5nt_navbarnavbar.label.change'/>" aria-owns="language-menu">
                    ${fn:toUpperCase(renderContext.mainResourceLocale.language)}
            </a>
            <div class="dropdown-menu" aria-labelledby="languageSwitchButton" role="menu" id="language-menu">
                <c:set var="invalidLanguages" value=""/>
                <c:catch var="e">
                    <c:if test="${! empty mainResourceNode.properties['j:invalidLanguages']}">
                        <c:forEach items="${mainResourceNode.properties['j:invalidLanguages']}" var="invalidLanguage">
                            <c:set var="invalidLanguages" value="${invalidLanguages} ${invalidLanguage.string}"/>
                        </c:forEach>
                    </c:if>
                </c:catch>
                <c:forEach var="languageCode" items="${languageCodes}">
                    <c:if test="${! empty languageCode && ! fn:contains(invalidLanguages, languageCode) && languageCode != renderContext.mainResourceLocale.language}">
                        <b4:switchToLanguageLink languageCode="${languageCode}"/>
                    </c:if>
                </c:forEach>
            </div>
        </div>
    </c:if>
</c:catch>
