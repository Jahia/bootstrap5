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
<template:addResources type="javascript" resources="jquery.min.js,bootstrap.min.js"/>

<c:set var="items" value="${jcr:getChildrenOfType(currentNode, 'bootstrap5nt:carouselItem')}"/>

<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:carouselAdvancedSettings')}">
    <c:set var="interval" value="${currentNode.properties.interval.long}"/>
    <c:set var="keyboard" value="${currentNode.properties.keyboard.boolean}"/>
    <c:set var="pause" value="${currentNode.properties.pause.boolean}"/>
    <c:set var="ride" value="${currentNode.properties.ride.boolean}"/>
    <c:set var="wrap" value="${currentNode.properties.wrap.boolean}"/>
    <c:set var="fade" value="${currentNode.properties.fade.boolean}"/>
    <c:set var="useIndicators" value="${currentNode.properties.useIndicators.boolean}"/>
    <c:set var="useLeftAndRightControls" value="${currentNode.properties.useLeftAndRightControls.boolean}"/>
    <c:set var="carouselClass" value=" ${currentNode.properties.carouselClass.string}"/>
</c:if>
<c:if test="${empty useIndicators}">
    <c:set var="useIndicators" value="true"/>
</c:if>
<c:if test="${empty useLeftAndRightControls}">
    <c:set var="useLeftAndRightControls" value="true"/>
</c:if>
<c:if test="${empty ride}">
    <c:set var="ride" value="true"/>
</c:if>
<c:if test="${empty keyboard}">
    <c:set var="keyboard" value="true"/>
</c:if>
<c:if test="${empty ride}">
    <c:set var="wrap" value="true"/>
</c:if>
<c:if test="${empty fade}">
    <c:set var="fade" value="false"/>
</c:if>
<c:if test="${carouselClass eq ' '}">
    <c:remove var="carouselClass"/>
</c:if>
<c:if test="${fade}">
    <c:set var="carouselClass" value="${carouselClass} carousel-fade"/>
</c:if>

<c:set var="options">
    <c:if test="${! empty interval && interval != 5000}">
        data-interval="${interval}"
    </c:if>
    <c:if test="${! keyboard}">
        data-keyboard="false"
    </c:if>
    <c:if test="${pause}">
        data-pause="hover"
    </c:if>
    <c:if test="${ride}">
        data-ride="carousel"
    </c:if>
    <c:if test="${! wrap}">
        data-wrap="false"
    </c:if>
</c:set>

<div id="carousel_${currentNode.identifier}" class="carousel${renderContext.editMode?'edit':' '} slide${carouselClass}" ${options} >
    <%-- Indicators --%>
    <c:if test="${useIndicators && ! renderContext.editMode}">
        <ol class="carousel-indicators">
            <c:forEach items="${items}" var="item" varStatus="status">
                <li data-target="#carousel_${currentNode.identifier}" data-slide-to="${status.index}" <c:if test='${status.first}'>class="active"</c:if>></li>
            </c:forEach>
        </ol>
    </c:if>

    <%-- Wrapper for slides --%>
    <div class="carousel-inner${renderContext.editMode?'edit':''}">
        <c:forEach items="${items}" var="item" varStatus="status">

            <template:module node="${item}" nodeTypes="bootstrap5nt:carouselItem">
                <template:param name="currentStatus" value="${status.first?' active':''}"/>
            </template:module>

        </c:forEach>
    </div>

    <%-- Controls --%>
    <c:if test="${useLeftAndRightControls && ! renderContext.editMode}">
        <a class="carousel-control-prev" href="#carousel_${currentNode.identifier}" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="sr-only"><fmt:message key="bootstrap5nt_carousel.previous"/></span>
        </a>
        <a class="carousel-control-next" href="#carousel_${currentNode.identifier}" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="sr-only"><fmt:message key="bootstrap5nt_carousel.next"/></span>
        </a>
    </c:if>
</div>

<c:if test="${renderContext.editMode}">
    <template:module path="*" nodeTypes="bootstrap5nt:carouselItem"/>
</c:if>
