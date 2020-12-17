<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<template:addResources type="css" resources="bootstrap.min.css"/>

<c:set var="createSection" value="${jcr:isNodeType(currentNode,'bootstrap5mix:createSection')}"/>
<c:set var="createContainer" value="${jcr:isNodeType(currentNode,'bootstrap5mix:createContainer')}"/>
<c:set var="createRow" value="${jcr:isNodeType(currentNode,'bootstrap5mix:createRow')}"/>
<c:choose>
    <c:when test="${jcr:isNodeType(currentNode, 'bootstrap5mix:predefinedGrid')}">
        <c:set var="gridType" value="predefinedGrid"/>
    </c:when>
    <c:when test="${jcr:isNodeType(currentNode, 'bootstrap5mix:customGrid')}">
        <c:set var="gridType" value="customGrid"/>
    </c:when>
    <c:otherwise>
        <c:set var="gridType" value="nogrid"/>
    </c:otherwise>
</c:choose>

<c:if test="${createSection}">
    <c:set var="sectionType" value="${currentNode.properties['sectionElement'].string}"/>
    <c:set var="sectionCssClass" value="${currentNode.properties['sectionCssClass'].string}"/>
    <c:set var="sectionId" value="${currentNode.properties['sectionId'].string}"/>
    <c:set var="sectionStyle" value="${currentNode.properties['sectionStyle'].string}"/>
    <c:set var="sectionRole" value="${currentNode.properties['sectionRole'].string}"/>
    <c:set var="sectionAria" value="${currentNode.properties['sectionAria'].string}"/>

    <${sectionType}<c:if test="${not empty sectionId}"> id="${sectionId}"</c:if><c:if
        test="${not empty sectionCssClass}"><c:out value=" "/>class="${fn:escapeXml(sectionCssClass)}"</c:if><c:if
        test="${not empty sectionRole}"><c:out value=" "/>role="${fn:escapeXml(sectionRole)}"</c:if><c:if
        test="${not empty sectionStyle}"><c:out value=" "/>style="${sectionStyle}"</c:if><c:if
        test="${not empty sectionAria}"><c:out value=" "/>aria-label="${fn:escapeXml(sectionAria)}"</c:if>>
</c:if>

<c:if test="${createContainer}">
    <c:set var="containerId" value="${currentNode.properties['containerId'].string}"/>
    <c:set var="containerCssClass" value="${currentNode.properties['containerCssClass'].string} "/>
    <c:set var="containerType" value="${currentNode.properties['containerType'].string}"/>
    <c:if test="${! empty containerCssClass}">
        <c:set var="containerCssClass" value="${fn:replace(containerCssClass, containerType, '')}"/>
    </c:if>

    <div<c:if test="${not empty containerId}"> id="${containerId}"</c:if> class="${containerType}<c:if
        test="${not empty containerCssClass}"><c:out value=" "/>${containerCssClass}</c:if>">
</c:if>

<c:if test="${createRow}">
    <c:set var="rowId" value="${currentNode.properties['rowId'].string}"/>
    <c:set var="rowCssClass" value="${currentNode.properties['rowCssClass'].string}"/>
    <c:if test="${! empty rowCssClass}">
        <c:set var="rowCssClass" value="${fn:replace(rowCssClass, 'row', '')}"/>
    </c:if>
    <c:set var="rowVerticalAlignment" value="${currentNode.properties['rowVerticalAlignment'].string}"/>
    <c:if test="${rowVerticalAlignment eq 'default'}">
        <c:remove var="rowVerticalAlignment"/>
    </c:if>
    <c:set var="rowHorizontalAlignment" value="${currentNode.properties['rowHorizontalAlignment'].string}"/>
    <c:if test="${rowHorizontalAlignment eq 'default'}">
        <c:remove var="rowHorizontalAlignment"/>
    </c:if>
    <c:set var="horizontalGutters" value="${currentNode.properties['horizontalGutters'].string}"/>
    <c:if test="${horizontalGutters eq 'default'}">
        <c:remove var="horizontalGutters"/>
    </c:if>
    <c:set var="verticalGutters" value="${currentNode.properties['verticalGutters'].string}"/>
    <c:if test="${verticalGutters eq 'default'}">
        <c:remove var="verticalGutters"/>
    </c:if>

    <div<c:if test="${not empty rowId}"> id="${rowId}"</c:if> class="row<c:if test='${not empty rowCssClass}'><c:out
        value=' '/>${rowCssClass}</c:if><c:if test='${not empty rowVerticalAlignment}'><c:out
        value=' '/>${rowVerticalAlignment}</c:if><c:if test='${not empty rowHorizontalAlignment}'><c:out
        value=' '/>${rowHorizontalAlignment}</c:if><c:if test='${not empty horizontalGutters}'><c:out
        value=' '/>${horizontalGutters}</c:if><c:if test='${not empty verticalGutters}'><c:out
        value=' '/>${verticalGutters}</c:if>">
</c:if>

<template:include view="hidden.${gridType}"/>

<c:if test="${createRow}">
    </div>
</c:if>

<c:if test="${createContainer}">
    </div>
</c:if>

<c:if test="${createSection}">
    </${sectionType}>
</c:if>
