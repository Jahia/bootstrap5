<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<template:addResources type="css" resources="bootstrap.min.css"/>

<%-- default value for imageMargin is set to me-3 (or ms-3 if image is set on right). User is allow to update it --%>
<c:set var="imageMargin" value="me-3"/>

<c:set var="imageHorizonralAlignment" value="start"/>
<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:mediaObjectImageAlignment')}">
    <c:set var="imageVerticalAlignment" value="${currentNode.properties.imageVerticalAlignment.string}"/>
    <c:set var="imageHorizonralAlignment" value="${currentNode.properties.imageHorizonralAlignment.string}"/>
    <c:if test="${imageHorizonralAlignment eq 'end'}">
        <c:set var="imageMargin" value="ms-3"/>
    </c:if>
</c:if>
<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:margin')}">
    <c:set var="imageMargin"><template:include view="margin"/></c:set>
</c:if>
<c:set var="mediaImage">
    <template:include view="image">
        <template:param name="class" value="d-flex ${imageVerticalAlignment} ${imageMargin}"/>
        <template:param name="style" value="width: 64px;"/>
    </template:include>
</c:set>
<c:set var="mediaBody">
    <div class="media-body">
        <c:forEach items="${jcr:getChildrenOfType(currentNode, 'jmix:droppableContent')}" var="droppableContent">
            <template:module node="${droppableContent}" editable="true"/>
        </c:forEach>
        <c:if test="${renderContext.editMode}">
            <template:module path="*" nodeTypes="jmix:droppableContent"/>
        </c:if>
    </div>
</c:set>

<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:mediaObjectAdvancedSettings')}">
    <c:set var="mediaObjectClass" value="${currentNode.properties.mediaObjectClass.string}"/>
    <c:if test="${! empty mediaObjectClass}">
        <c:set var="class">${mediaObjectClass}</c:set>
    </c:if>
    <c:set var="mediaObjectStyle" value="${currentNode.properties.mediaObjectStyle.string}"/>
    <c:if test="${! empty mediaObjectStyle}">
        <c:set var="style">${mediaObjectStyle}</c:set>
    </c:if>
    <c:set var="mediaObjectID" value="${currentNode.properties.mediaObjectID.string}"/>
    <c:if test="${! empty mediaObjectID}">
        <c:set var="id" value="${mediaObjectID}"/>
    </c:if>
</c:if>

<div class="media"<c:if test="${! empty class}"><c:out value=" "/>class="${fn:escapeXml(class)}"</c:if>
     <c:if test="${! empty style}"><c:out value=" "/>style="${fn:escapeXml(style)}"</c:if>
     <c:if test="${! empty id}"><c:out value=" "/>id="${fn:escapeXml(id)}"</c:if>>
    <c:choose>
        <c:when test="${imageHorizonralAlignment eq 'end'}">
            ${mediaBody}
            ${mediaImage}
        </c:when>
        <c:otherwise>
            ${mediaImage}
            ${mediaBody}
        </c:otherwise>
    </c:choose>
</div>

