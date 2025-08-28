<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>

<template:addResources type="css" resources="bootstrap.min.css"/>

<c:set var="caption" value="${currentNode.properties['jcr:title'].string}"/>

<%-- Set alignment class only if mixin present; otherwise empty string --%>
<c:set var="captionAlignment"
       value="${jcr:isNodeType(currentNode, 'bootstrap5mix:figureAdvancedSettings')
               ? currentNode.properties.captionAlignment.string : ''}"/>

<figure class="figure">
    <template:include view="image">
        <template:param name="class" value="figure-img img-fluid"/>
    </template:include>

    <c:if test="${not empty caption}">
        <figcaption class="figure-caption${empty captionAlignment ? '' : ' '}${captionAlignment}">
                ${fn:escapeXml(caption)}
        </figcaption>
    </c:if>
</figure>
