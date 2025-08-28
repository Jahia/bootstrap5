<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib"%>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>

<c:set var="createAbsoluteAreas" value="${jcr:isNodeType(currentNode, 'bootstrap5mix:createAbsoluteAreas')}"/>
<c:set var="moduleType" value="${createAbsoluteAreas ? 'absoluteArea' : 'area'}"/>
<c:set var="level" value="${createAbsoluteAreas ? currentNode.properties.level.string : '0'}"/>

<c:set var="hasListLimitMixin" value="${jcr:isNodeType(currentNode, 'bootstrap5mix:listLimit')}"/>
<c:set var="listLimit" value="${hasListLimitMixin and not empty currentNode.properties.listLimit.string
                                ? currentNode.properties.listLimit.string : '-1'}"/>

<c:if test="${createAbsoluteAreas and renderContext.editModeConfigName eq 'studiomode'}">
    <c:set var="displayAbsoluteArea">
        <div class="card text-white bg-danger mb-3">
            <div class="card-header">
                <fmt:message key="bootstrap5nt_grid.absolute.area.title"/>
            </div>
            <div class="card-body">
                <p class="card-text">
                    <fmt:message key="bootstrap5nt_grid.absolute.area.desc">
                        <fmt:param value="${level}"/>
                    </fmt:message>
                </p>
            </div>
        </div>
    </c:set>
</c:if>

<c:if test="${renderContext.editMode}">
    <c:set var="createContainer" value="${jcr:isNodeType(currentNode,'bootstrap5mix:createContainer')}"/>
    <c:set var="createRow"       value="${jcr:isNodeType(currentNode,'bootstrap5mix:createRow')}"/>

    <c:if test="${not createContainer and not createRow}">
        <c:if test="${not fn:startsWith(currentNode.path,'/modules') or renderContext.editModeConfigName eq 'studiomode'}">
            <span class="text-muted">#${currentNode.name}</span>
        </c:if>
    </c:if>
</c:if>

<c:set var="colName"
       value="${(fn:startsWith(currentNode.path,'/modules') or renderContext.editModeConfigName eq 'studiomode')
                 ? currentNode.name : 'main'}"/>

${displayAbsoluteArea}
<template:area path="${colName}" areaAsSubNode="true" moduleType="${moduleType}" level="${level}" listLimit="${listLimit}"/>
