<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- @elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper" --%>
<template:addResources type="css" resources="bootstrap.min.css"/>

<%-- Mixins presence --%>
<c:set var="createSection"   value="${jcr:isNodeType(currentNode,'bootstrap5mix:createSection')}"/>
<c:set var="createContainer" value="${jcr:isNodeType(currentNode,'bootstrap5mix:createContainer')}"/>
<c:set var="createRow"       value="${jcr:isNodeType(currentNode,'bootstrap5mix:createRow')}"/>

<%-- Grid type in one expression --%>
<c:set var="gridType"
       value="${jcr:isNodeType(currentNode,'bootstrap5mix:predefinedGrid') ? 'predefinedGrid'
                : (jcr:isNodeType(currentNode,'bootstrap5mix:customGrid') ? 'customGrid' : 'nogrid')}"/>

<%-- SECTION attributes --%>
<c:if test="${createSection}">
    <c:set var="sectionType"  value="${currentNode.properties.sectionElement.string}"/>
    <c:set var="sectionId"    value="${currentNode.properties.sectionId.string}"/>
    <c:set var="sectionClass" value="${currentNode.properties.sectionCssClass.string}"/>
    <c:set var="sectionStyle" value="${currentNode.properties.sectionStyle.string}"/>
    <c:set var="sectionRole"  value="${currentNode.properties.sectionRole.string}"/>
    <c:set var="sectionAria"  value="${currentNode.properties.sectionAria.string}"/>

    <${sectionType}
    <c:if test="${not empty sectionId}"> id="${fn:escapeXml(sectionId)}"</c:if>
    <c:if test="${not empty sectionClass}"> class="${fn:escapeXml(fn:trim(sectionClass))}"</c:if>
    <c:if test="${not empty sectionRole}"> role="${fn:escapeXml(sectionRole)}"</c:if>
    <c:if test="${not empty sectionStyle}"> style="${sectionStyle}"</c:if>
    <c:if test="${not empty sectionAria}"> aria-label="${fn:escapeXml(sectionAria)}"</c:if>
    >
</c:if>

<%-- CONTAINER attributes & class building --%>
<c:if test="${createContainer}">
    <c:set var="containerId"    value="${currentNode.properties.containerId.string}"/>
    <c:set var="containerType"  value="${currentNode.properties.containerType.string}"/>
    <c:set var="containerExtra" value="${currentNode.properties.containerCssClass.string}"/>

    <%-- remove duplicated containerType from extra classes, then trim --%>
    <c:if test="${not empty containerExtra}">
        <c:set var="containerExtra" value="${fn:trim(fn:replace(containerExtra, containerType, ''))}"/>
    </c:if>

    <c:set var="containerClass"
           value="${empty containerExtra ? containerType : containerType.concat(' ').concat(containerExtra)}"/>

    <div
    <c:if test="${not empty containerId}"> id="${fn:escapeXml(containerId)}"</c:if>
    class="${fn:escapeXml(containerClass)}"
    >
</c:if>

<%-- ROW attributes & class building --%>
<c:if test="${createRow}">
    <c:set var="rowId"    value="${currentNode.properties.rowId.string}"/>
    <c:set var="rowClass" value="${currentNode.properties.rowCssClass.string}"/>
    <c:set var="vAlign"   value="${currentNode.properties.rowVerticalAlignment.string}"/>
    <c:set var="hAlign"   value="${currentNode.properties.rowHorizontalAlignment.string}"/>
    <c:set var="gX"       value="${currentNode.properties.horizontalGutters.string}"/>
    <c:set var="gY"       value="${currentNode.properties.verticalGutters.string}"/>

    <%-- normalize "default" to empty --%>
    <c:if test="${vAlign eq 'default'}"><c:set var="vAlign" value=""/></c:if>
    <c:if test="${hAlign eq 'default'}"><c:set var="hAlign" value=""/></c:if>
    <c:if test="${gX eq 'default'}"><c:set var="gX" value=""/></c:if>
    <c:if test="${gY eq 'default'}"><c:set var="gY" value=""/></c:if>

    <%-- compose row class --%>
    <c:set var="rowFullClass" value="row"/>
    <c:if test="${not empty rowClass}"><c:set var="rowFullClass" value="${rowFullClass} ${rowClass}"/></c:if>
    <c:if test="${not empty vAlign}"><c:set var="rowFullClass" value="${rowFullClass} ${vAlign}"/></c:if>
    <c:if test="${not empty hAlign}"><c:set var="rowFullClass" value="${rowFullClass} ${hAlign}"/></c:if>
    <c:if test="${not empty gX}"><c:set var="rowFullClass" value="${rowFullClass} ${gX}"/></c:if>
    <c:if test="${not empty gY}"><c:set var="rowFullClass" value="${rowFullClass} ${gY}"/></c:if>
    <c:set var="rowFullClass" value="${fn:trim(rowFullClass)}"/>

    <div
    <c:if test="${not empty rowId}"> id="${fn:escapeXml(rowId)}"</c:if>
    class="${fn:escapeXml(rowFullClass)}"
    >
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
