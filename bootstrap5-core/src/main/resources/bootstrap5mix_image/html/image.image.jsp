<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="b5" uri="http://www.jahia.org/b5" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%-- @elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper" --%>

<%-- Reusable view: included via <template:include view="image"> from figure.jsp, card.jsp, etc. --%>
<%-- One Bootstrap stylesheet per page: the right-to-left build for right-to-left languages --%>
<template:addResources type="css" resources="${b5:isRtlLanguage(renderContext.mainResourceLocale.language) ? 'bootstrap.rtl.min.css' : 'bootstrap.min.css'}"/>

<c:set var="imageNode" value="${currentNode.properties.image.node}"/>

<c:if test="${not empty imageNode}">
    <%--
        This view allows to pass as parameters a class, a style and an id.
        These parameters can be overridden using the image advanced settings.
        For class and style attributes, we keep the value from parameters first.
        For ID we keep the value from advanced settings if it exists.
    --%>
    <%-- Seed class/style/id from caller's template:param values --%>
    <c:set var="cssClass" value="${currentResource.moduleParams['class']}"/>
    <c:set var="styleStr" value="${currentResource.moduleParams.style}"/>
    <c:set var="elemId"   value="${currentResource.moduleParams.id}"/>
    <c:set var="alt"      value="${imageNode.displayableName}"/>
    <%-- set responsive by default --%>
    <c:set var="responsive" value="true"/>

    <c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:imageAdvancedSettings')}">
        <%-- Append advanced-settings imageClass after caller's class --%>
        <c:set var="imageClass" value="${currentNode.properties.imageClass.string}"/>
        <c:if test="${not empty imageClass}">
            <c:set var="cssClass" value="${fn:trim(cssClass)} ${imageClass}"/>
        </c:if>

        <%-- Merge styles with semicolon separator; ensure no double semicolon --%>
        <c:set var="imageStyle" value="${currentNode.properties.imageStyle.string}"/>
        <c:if test="${not empty imageStyle}">
            <c:choose>
                <c:when test="${empty styleStr}">
                    <c:set var="styleStr" value="${imageStyle}"/>
                </c:when>
                <c:otherwise>
                    <c:set var="styleStr"
                           value="${styleStr}${fn:endsWith(styleStr,';') ? '' : ';'}${imageStyle}"/>
                </c:otherwise>
            </c:choose>
        </c:if>

        <%-- Advanced-settings imageID wins over caller's id param --%>
        <c:set var="imageID" value="${currentNode.properties.imageID.string}"/>
        <c:if test="${not empty imageID}">
            <c:set var="elemId" value="${imageID}"/>
        </c:if>

        <c:set var="responsive" value="${currentNode.properties.responsive.boolean}"/>
        <c:if test="${currentNode.properties.thumbnails.boolean}">
            <c:set var="cssClass" value="${fn:trim(cssClass)} img-thumbnail"/>
        </c:if>

        <%-- Rounded corners. A shape and a size do not combine as two classes ("rounded-top rounded-3"
             rounds the four corners): Bootstrap has one class per case, rounded-3 or rounded-top-3.
             A circle or a pill has no size; "rounded-0" means no rounding. --%>
        <c:set var="borderRadius" value="${currentNode.properties.borderRadius.string}"/>
        <c:set var="borderRadiusSize" value="${currentNode.properties.borderRadiusSize.string}"/>
        <c:set var="radiusLevel" value="${fn:startsWith(borderRadiusSize, 'rounded-') ? fn:substringAfter(borderRadiusSize, 'rounded-') : ''}"/>
        <%-- A size on its own rounds the four corners at that size --%>
        <c:if test="${empty borderRadius and not empty radiusLevel}">
            <c:set var="cssClass" value="${fn:trim(cssClass)} rounded-${radiusLevel}"/>
        </c:if>
        <c:if test="${borderRadius ne 'rounded-0' and not empty borderRadius}">
            <c:choose>
                <c:when test="${empty radiusLevel or borderRadius eq 'rounded-circle' or borderRadius eq 'rounded-pill'}">
                    <c:set var="cssClass" value="${fn:trim(cssClass)} ${borderRadius}"/>
                </c:when>
                <c:otherwise>
                    <c:set var="cssClass" value="${fn:trim(cssClass)} ${borderRadius}-${radiusLevel}"/>
                </c:otherwise>
            </c:choose>
        </c:if>
        <%-- "start"/"end" use float; "center" uses block + auto-margins instead --%>
        <c:set var="align" value="${currentNode.properties.align.string}"/>
        <c:choose>
            <c:when test="${align eq 'start'}">
                <c:set var="cssClass" value="${fn:trim(cssClass)} float-start"/>
            </c:when>
            <c:when test="${align eq 'end'}">
                <c:set var="cssClass" value="${fn:trim(cssClass)} float-end"/>
            </c:when>
            <c:when test="${align eq 'center'}">
                <c:set var="cssClass" value="${fn:trim(cssClass)} mx-auto d-block"/>
            </c:when>
        </c:choose>

        <c:set var="altStr" value="${currentNode.properties.alt.string}"/>
        <c:if test="${not empty altStr}">
            <c:set var="alt" value="${altStr}"/>
        </c:if>
    </c:if>

    <c:choose>
        <c:when test="${not responsive}">
            <%-- Responsive disabled: strip img-fluid if it was passed by the caller --%>
            <c:set var="cssClass" value="${fn:replace(cssClass, 'img-fluid', '')}"/>
        </c:when>
        <c:otherwise>
            <%-- Ensure img-fluid is present exactly once regardless of caller input --%>
            <c:if test="${not fn:contains(cssClass, 'img-fluid')}">
                <c:set var="cssClass" value="${fn:trim(cssClass)} img-fluid"/>
            </c:if>
        </c:otherwise>
    </c:choose>

    <c:url var="imageUrl" value="${imageNode.url}" context="/"/>

    <img src="${fn:escapeXml(imageUrl)}" alt="${fn:escapeXml(alt)}"
            <c:if test="${not empty cssClass}"> class="${fn:escapeXml(fn:trim(cssClass))}"</c:if>
            <c:if test="${not empty styleStr}"> style="${fn:escapeXml(styleStr)}"</c:if>
            <c:if test="${not empty elemId}">   id="${fn:escapeXml(elemId)}"</c:if>
    />
</c:if>
