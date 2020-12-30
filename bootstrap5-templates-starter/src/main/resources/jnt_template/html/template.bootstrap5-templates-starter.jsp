<%@ page language="java" contentType="text/html;charset=UTF-8" %><!doctype html>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="b5" uri="http://www.jahia.org/b5" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="language" value="${renderContext.mainResourceLocale.language}"/>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<html lang="${language}"<c:if test="${b5:isRtlLanguage(language)}"><c:out value=" "/>dir="rtl"</c:if>>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${renderContext.mainResource.node.displayableName}</title>
    <template:addResources type="css" resources="bootstrap.min.css"/>
    <c:if test="${renderContext.editMode}">
        <template:addResources type="css" resources="starter-edit.css"/>
    </c:if>
    <template:addResources type="javascript" resources="bootstrap.bundle.min.js"/>
</head>
<body>
<template:area path="pagecontent"/>
</body>
</html>

