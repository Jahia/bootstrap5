<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<template:addResources type="css" resources="bootstrap.min.css" />

<c:set var="pageNodes" value="${jcr:getParentsOfType(currentNode, 'jnt:page')}"/>
<c:if test="${empty pageNodes}">
    <c:choose>
        <c:when test="${jcr:isNodeType(renderContext.mainResource.node, 'jnt:page')}">
            <c:set var="pageNodes"
                   value="${jcr:getMeAndParentsOfType(renderContext.mainResource.node,'jmix:navMenuItem')}"/>
        </c:when>
        <c:otherwise>
            <c:set var="pageNodes"
                   value="${jcr:getParentsOfType(renderContext.mainResource.node, 'jmix:navMenuItem')}"/>
        </c:otherwise>
    </c:choose>
</c:if>

<c:if test="${jcr:isNodeType(currentNode,'bootstrap5mix:advancedBreadcrumb' )}">
    <c:set var="cssClass" value=" ${currentNode.properties.cssClass.string}"/>
</c:if>
<c:choose>
    <c:when test="${fn:length(pageNodes) > 1}">
        <fmt:message key="bootstrap5nt_breadcrumb" var="breadcrumb"/>
        <ol class="breadcrumb ${cssClass}" label="${fn:escapeXml(breadcrumb)}">
            <c:forEach items="${functions:reverse(pageNodes)}" var="pageNode" varStatus="status">
                <c:choose>
                    <c:when test="${jcr:findDisplayableNode(pageNode, renderContext) ne pageNode}">
                        <li class="breadcrumb-item"><a href="#"><c:out value="${pageNode.displayableName}"/></a></li>
                    </c:when>
                    <c:when test="${renderContext.mainResource.node.path ne pageNode.path}">
                        <li class="breadcrumb-item"><a href="<c:url value='${url.base}${pageNode.path}.html'/>"><c:out
                                value="${pageNode.displayableName}"/></a></li>
                    </c:when>
                    <c:otherwise>
                        <li class="breadcrumb-item active" aria-current="page"><c:out value="${pageNode.displayableName}"/></li>
                    </c:otherwise>
                </c:choose>
            </c:forEach>
            <c:if test="${not jcr:isNodeType(renderContext.mainResource.node, 'jnt:page')}">
                <c:set var="pageNode" value="${renderContext.mainResource.node}"/>
                <li class="breadcrumb-item">
                    <a href="<c:url value='${url.base}${pageNode.path}.html'/>">
                        <c:out value="${functions:abbreviate(renderContext.mainResource.node.displayableName,15,30,'...')}"/>
                    </a>
                </li>
            </c:if>
        </ol>
    </c:when>
    <c:otherwise>
        <c:if test="${renderContext.editMode}">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Breadcrumb too small...</li>
            </ol>
        </c:if>
    </c:otherwise>
</c:choose>
