<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="ui" uri="http://www.jahia.org/tags/uiComponentsLib" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<template:addResources type="css" resources="bootstrap.min.css"/>

<c:set var="title" value="${currentNode.properties['jcr:title'].string}"/>
<c:set var="caption" value="${currentNode.properties.caption.string}"/>
<c:set var="imageNode" value="${currentNode.properties.image.node}"/>
<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:advancedCarouselItem')}">
    <c:set var="titleColor" value="text-${currentNode.properties.titleColor.string}"/>
    <c:set var="captionColor" value="text-${currentNode.properties.captionColor.string}"/>
    <c:set var="carouselItemClass" value=" ${currentNode.properties.carouselItemClass.string}"/>
    <c:set var="interval" value=" ${currentNode.properties.interval.long}"/>
    <c:set var="titleClass" value=" class='${titleColor}'"/>
    <c:set var="captionClass" value=" class='${captionColor}'"/>
</c:if>
<c:set var="currentStatus" value="${currentResource.moduleParams.currentStatus}"/>

<c:choose>
    <c:when test="${renderContext.editMode}">
        <div class="media">
            <a class="media-left" href="#">
                <c:if test="${! empty imageNode}">
                    <c:url var="imageUrl" value="${imageNode.url}" context="/"/>
                    <img src="${imageUrl}" style="width: 64px"/>
                </c:if>
            </a>
            <div class="media-body">
                <c:if test="${not empty title}">
                    <h4 class="media-heading${' '}${titleColor}">${title}</h4>
                </c:if>
                <c:if test="${not empty caption}">
                    <p class="${captionColor}">${caption}</p>
                </c:if>
            </div>
        </div>
    </c:when>
    <c:otherwise>

        <div class="carousel-item${currentStatus}${carouselItemClass}" <c:if test="${! empty interval}"><c:out value=" "/> data-bs-interval="${interval}"</c:if>>
            <c:if test="${! empty imageNode}">
                <c:url var="imageUrl" value="${imageNode.url}" context="/"/>
                <img src="${imageUrl}" class="d-block w-100"/>
            </c:if>
            <c:if test="${! empty title || ! empty caption}">
                <div class="carousel-caption d-none d-md-block${carouselCaptionClass}">
                    <c:if test="${not empty title}">
                        <h3${titleClass}>${title}</h3>
                    </c:if>
                    <c:if test="${not empty caption}">
                        <p${captionClass}>${caption}</p>
                    </c:if>
                </div>
            </c:if>
        </div>
    </c:otherwise>
</c:choose>



