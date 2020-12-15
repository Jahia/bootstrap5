<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<template:addResources type="css" resources="bootstrap.min.css"/>

<c:set var="caption" value="${currentNode.properties['jcr:title'].string}"/>
<figure class="figure">
    <template:include view="image">
        <template:param name="class" value="figure-img img-fluid"/>
    </template:include>
    <c:if test="${! empty caption}">
        <c:if test="${jcr:isNodeType(currentNode, 'bootstrap5mix:figureAdvancedSettings')}">
            <c:set var="captionAlignment" value="${' '}${currentNode.properties.captionAlignment.string}"/>
        </c:if>
        <figcaption class="figure-caption${captionAlignment}">${caption}</figcaption>
    </c:if>
</figure>
