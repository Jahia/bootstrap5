<%@ taglib prefix="b5" uri="http://www.jahia.org/b5" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%-- bootstrapVersion is injected at build time by copy-bootstrap.js --%>
<%@ include file="_bootstrap-version.jspf" %>

<%-- One Bootstrap stylesheet per page: the right-to-left build for right-to-left languages --%>

<template:addResources type="css" resources="${b5:isRtlLanguage(renderContext.mainResourceLocale.language) ? 'bootstrap.rtl.min.css' : 'bootstrap.min.css'}"/>

<c:if test="${renderContext.editMode}">
    <div class="alert alert-info" role="alert">
        This page is running <a href="http://getbootstrap.com/" class="alert-link">Bootstrap v${bootstrapVersion}</a>
    </div>
</c:if>
