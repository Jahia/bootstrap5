<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>

<template:addResources type="css" resources="bootstrap.min.css"/>
<template:addResources type="javascript" resources="bootstrap.bundle.min.js"/>
<c:set var="title" value="${currentNode.properties['jcr:title'].string}"/>
<c:set var="buttonType" value="${currentNode.properties.buttonType.string}"/>
<c:set var="linkUrl" value="#"/>

<c:set var="style" value="primary"/>

<c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:buttonAdvancedSettings')}">
    <c:set var="style" value="${currentNode.properties.style.string}"/>
    <c:set var="size" value="${currentNode.properties.size.string}"/>
    <c:set var="state" value="${currentNode.properties.state.string}"/>
    <c:set var="outline" value="${currentNode.properties.outline.boolean ? '-outline' : ''}"/>
    <c:set var="nowrap" value="${currentNode.properties.disableTextWrapping.boolean ? ' text-nowrap' : ''}"/>
    <c:set var="block" value="${currentNode.properties.block.boolean ? ' btn-block' : ''}"/>
    <c:set var="cssClass" value=" ${currentNode.properties.cssClass.string}"/>
    <c:choose>
        <c:when test="${state == 'active'}">
            <c:set var="aria">aria-pressed="true"</c:set>
        </c:when>
        <c:when test="${state == 'disabled'}">
            <c:set var="aria">aria-disabled="true"</c:set>
        </c:when>
        <c:otherwise>
            <c:remove var="state"/>
        </c:otherwise>
    </c:choose>
    <c:if test="${empty size || size == 'default'}">
        <c:remove var="size"/>
    </c:if>
    <c:if test="${! empty size}">
        <c:set var="size" value=" ${size}"/>
    </c:if>
    <c:if test="${! empty state}">
        <c:set var="state" value=" ${state}"/>
    </c:if>
</c:if>
<c:choose>
    <c:when test="${style eq 'custom'}">
        <c:set var="buttonClass" value="${cssClass}"/>
    </c:when>
    <c:otherwise>
        <c:set var="buttonClass" value="btn btn${outline}-${style} ${size} ${state} ${block} ${cssClass} ${nowrap}"/>
    </c:otherwise>
</c:choose>

<c:choose>
    <c:when test="${buttonType eq 'internalLink'}">
        <c:set var="internalLinkNode" value="${currentNode.properties.internalLink.node}"/>
        <c:choose>
            <c:when test="${! empty internalLinkNode}">
                <c:url var="linkUrl" value="${internalLinkNode.url}"/>
                <c:if test="${empty title}">
                    <c:set var="title" value="${internalLinkNode.displayableName}"/>
                </c:if>
            </c:when>
            <c:otherwise>
                <c:if test="${renderContext.editMode}">
                    <span class="badge badge-warning">
                        <fmt:message key="bootstrap5nt_button.noLink"/>
                    </span>
                </c:if>
            </c:otherwise>
        </c:choose>
        <a href="${linkUrl}" class="${buttonClass}" role="button" ${aria} id="button_${currentNode.identifier}">${title}</a>
    </c:when>
    <c:when test="${buttonType eq 'externalLink'}">
        <c:url var="linkUrl" value="${currentNode.properties.externalLink.string}"/>
        <c:if test="${empty title}">
            <fmt:message key="bootstrap5nt_button.readMore" var="title"/>
        </c:if>
        <c:if test="${(empty linkUrl or linkUrl eq 'http://') && renderContext.editMode}">
            <span class="badge badge-warning">
                <fmt:message key="bootstrap5nt_button.noUrl"/>
            </span>
        </c:if>
        <a href="${linkUrl}" class="${buttonClass}" role="button" ${aria} id="button_${currentNode.identifier}">${title}</a>
    </c:when>
    <c:when test="${buttonType eq 'modal'}">
        <c:set var="modalSize" value=" modal-${currentNode.properties.modalSize.string}"/>
        <c:set var="modalTitle" value="${currentNode.properties.modalTitle.string}"/>
        <c:set var="closeText" value="${currentNode.properties.closeText.string}"/>
        <c:set var="staticBackdrop" value="${currentNode.properties.staticBackdrop.boolean}"/>
        <c:set var="verticallyCentered" value="${currentNode.properties.verticallyCentered.boolean?' modal-dialog-centered':''}"/>
        <c:if test="${modalSize eq ' modal-default'}">
            <c:remove var="modalSize"/>
        </c:if>
        <c:if test="${empty title}">
            <fmt:message key="bootstrap5nt_button.readMore" var="title"/>
        </c:if>
        <c:if test="${empty closeText}">
            <fmt:message key="bootstrap5nt_button.close" var="closeText"/>
        </c:if>
        <button type="button" class="${buttonClass}" ${aria} data-bs-toggle="modal" data-bs-target="#modal-${currentNode.identifier}" id="button_${currentNode.identifier}">
            ${title}
        </button>

        <div class="modal fade" id="modal-${currentNode.identifier}" tabindex="-1" role="dialog" aria-labelledby="modalLabel_${currentNode.identifier}" aria-hidden="${renderContext.editMode ? 'false' : 'true'}"<c:if test="${staticBackdrop}"><c:out value=" "
        /> data-bs-backdrop="static" data-bs-keyboard="false"</c:if>>
            <div class="modal-dialog ${verticallyCentered} modal-dialog-scrollable ${modalSize}"<c:if test='${renderContext.editMode}'> style="margin:5px;"</c:if>>
                <div class="modal-content">
                    <c:if test="${not empty modalTitle}">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalLabel_${currentNode.identifier}">${modalTitle}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                    </c:if>
                    <div class="modal-body">
                        <c:forEach items="${jcr:getChildrenOfType(currentNode, 'jmix:droppableContent')}" var="droppableContent">
                            <template:module node="${droppableContent}" editable="true"/>
                        </c:forEach>
                        <c:if test="${renderContext.editMode}">
                            <template:module path="*" nodeTypes="jmix:droppableContent"/>
                        </c:if>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-${style}" data-bs-dismiss="modal">${closeText}</button>
                    </div>
                </div>
            </div>
        </div>
    </c:when>
    <c:when test="${buttonType eq 'collapse'}">
        <c:if test="${empty title}">
            <fmt:message key="bootstrap5nt_button.readMore" var="title"/>
        </c:if>
        <c:set var="show" value="${currentNode.properties.show.boolean ? ' show' : ''}"/>

        <a href="#collapse-${currentNode.identifier}" class="${buttonClass}${show}" ${aria} role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="collapse-${currentNode.identifier}" id="button_${currentNode.identifier}">${title}</a>

        <div class="collapse" id="collapse-${currentNode.identifier}">
            <c:forEach items="${jcr:getChildrenOfType(currentNode, 'jmix:droppableContent')}" var="droppableContent">
                <template:module node="${droppableContent}" editable="true"/>
            </c:forEach>
            <c:if test="${renderContext.editMode}">
                <template:module path="*" nodeTypes="jmix:droppableContent"/>
            </c:if>
        </div>
    </c:when>
    <c:when test="${buttonType eq 'popover'}">
        <c:if test="${empty title}">
            <fmt:message key="bootstrap5nt_button.readMore" var="title"/>
        </c:if>
        <c:set var="direction" value="${currentNode.properties.direction.string}"/>
        <c:set var="popoverTitle" value="${currentNode.properties.popoverTitle.string}"/>
        <c:set var="popoverContent" value="${currentNode.properties.popoverContent.string}"/>
        <c:set var="html" value="${currentNode.properties.html.boolean}"/>
        <c:if test="${! empty popoverTitle}">
            <c:set var="pTitle"> title="${fn:escapeXml(popoverTitle)}"</c:set>
        </c:if>
        <c:if test="${! empty popoverContent}">
            <c:set var="pContent"> data-bs-content="${fn:escapeXml(popoverContent)}"</c:set>
        </c:if>
        <button type="button" class="${buttonClass}" ${aria} data-bs-toggle="popover" ${pTitle} ${pContent} <c:if test="${html}"><c:out
                value=" "/> data-bs-html="true" </c:if> data-bs-container="body" data-bs-placement="${direction}" data-bs-trigger="focus" id="button_${currentNode.identifier}">${title}</button>
        <template:addResources type="inline">
            <script>
                $(function () {
                    $('[ data-bs-toggle="popover"]').popover()
                })
            </script>
        </template:addResources>
    </c:when>
    <c:otherwise>
        <c:if test="${renderContext.editMode}">

        </c:if>
        <%-- disabled --%>
    </c:otherwise>
</c:choose>


