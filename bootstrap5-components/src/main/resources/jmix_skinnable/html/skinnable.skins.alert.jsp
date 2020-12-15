<%@ taglib uri="http://www.jahia.org/tags/jcr" prefix="jcr" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<template:addResources type="css" resources="bootstrap.min.css"/>

<c:set var="backgroundColor" value="${currentNode.properties.backgroundColor.string}"/>
<c:set var="addDismissButton" value="${currentNode.properties.addDismissButton.boolean}"/>
<c:if test="${addDismissButton}">
    <c:set var="extraClasses" value=" alert-dismissible fade show"/>
</c:if>
<div class="alert alert-${backgroundColor}${extraClasses}" role="alert">
    ${wrappedContent}
    <c:if test="${addDismissButton}">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </c:if>
</div>
