<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>

<%-- Bootstrap CSS --%>
<template:addResources type="css" resources="bootstrap.min.css"/>

<c:if test="${renderContext.editMode}">
    <div class="alert alert-info" role="alert">
        This page is running <a href="http://getbootstrap.com/" class="alert-link">Bootstrap v5.2.0-beta1</a>
    </div>
</c:if>
