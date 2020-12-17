<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="ui" uri="http://www.jahia.org/tags/uiComponentsLib" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<template:addResources type="css" resources="bootstrap.min.css"/>

<c:set var="items" value="${jcr:getChildrenOfType(currentNode, 'bootstrap5nt:accordion')}"/>
<c:set var="flushClass" value="${currentNode.properties.flush.boolean ? ' accordion-flush' : ''}"/>
<div class="accordion${flushClass}" id="accordion-${currentNode.identifier}">
    <div class="carousel-inner${renderContext.editMode?'edit':''}">
        <c:forEach items="${items}" var="item" varStatus="status">
            <template:module node="${item}" nodeTypes="bootstrap5nt:accordion"/>
        </c:forEach>
    </div>
</div>

<c:if test="${renderContext.editMode}">
    <template:module path="*" nodeTypes="bootstrap5nt:accordion"/>
</c:if>
