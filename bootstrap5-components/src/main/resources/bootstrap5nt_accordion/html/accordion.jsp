<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="utility" uri="http://www.jahia.org/tags/utilityLib" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="ui" uri="http://www.jahia.org/tags/uiComponentsLib" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="propertyDefinition" type="org.jahia.services.content.nodetypes.ExtendedPropertyDefinition"--%>
<%--@elvariable id="type" type="org.jahia.services.content.nodetypes.ExtendedNodeType"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<template:addResources type="css" resources="bootstrap.min.css"/>
<template:addResources type="javascript" resources="bootstrap.bundle.min.js"/>

<c:set var="title" value="${currentNode.displayableName}"/>
<c:set var="show" value="${currentNode.properties.show.boolean ? ' show' : ''}"/>

<div class="accordion-item">
    <h2 class="accordion-header" id="accordion-${currentNode.identifier}">
        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${currentNode.identifier}" aria-expanded="true" aria-controls="collapse-${currentNode.identifier}">
            ${title}
        </button>
    </h2>
    <div id="collapse-${currentNode.identifier}" class="accordion-collapse collapse ${show}" aria-labelledby="accordion-${currentNode.identifier}" data-bs-parent="#accordion-${currentNode.parent.identifier}">
        <div class="accordion-body">
            ${currentNode.properties.text.string}
                <c:forEach items="${jcr:getChildrenOfType(currentNode, 'jmix:droppableContent')}" var="droppableContent">
                    <c:if test="${droppableContent.name ne 'cardFooter'}">
                        <template:module node="${droppableContent}" editable="true"/>
                    </c:if>
                </c:forEach>
                <c:if test="${renderContext.editMode}">
                    <template:module path="*" nodeTypes="jmix:droppableContent"/>
                </c:if>
        </div>
    </div>
</div>
