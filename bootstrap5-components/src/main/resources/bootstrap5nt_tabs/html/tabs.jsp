<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="utility" uri="http://www.jahia.org/tags/utilityLib" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="uiComponents" uri="http://www.jahia.org/tags/uiComponentsLib" %>
<%@ taglib prefix="search" uri="http://www.jahia.org/tags/search" %>
<%@ taglib prefix="b5" uri="http://www.jahia.org/b5" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<%--@elvariable id="moduleMap" type="java.util.Map"--%>

<template:addResources type="css" resources="bootstrap.min.css"/>
<template:addResources type="javascript" resources="bootstrap.bundle.min.js" targetTag="${renderContext.editMode?'head':'body'}"/>
<c:set var="subLists" value="${jcr:getChildrenOfType(currentNode, 'jnt:contentList')}"/>
<c:set var="typeValue" value="${currentNode.properties.type.string}"/>
<c:set var="type" value="nav-${typeValue}${typeValue eq 'underline' ? '':'s'}"/>
<c:set var="align" value=" ${currentNode.properties.align.string}"/>
<c:set var="fade" value="${currentNode.properties.fade.boolean}"/>
<c:set var="useListNameAsAnchor" value="${currentNode.properties.useListNameAsAnchor.boolean}"/>
<c:set var="alphabet" value="abcdefghijklmnopqrstuvwxyz"/>
<c:forEach items="${subLists}" var="droppableContent" varStatus="status">
    <c:choose>
        <c:when test="${useListNameAsAnchor}">
            <%-- Use the sanitized list name as the anchor; fall back to node identifier when useListNameAsAnchor is false --%>
            <c:set var="anchorName" value="${fn:trim(droppableContent.name)}"/>
            <%-- HTML id must start with a letter; prefix with "tab-" if the first character is not a-z --%>
            <c:set var="firstChar" value = "${fn:substring(fn:toLowerCase(anchorName), 0, 1)}" />
            <c:if test="${! fn:contains(alphabet, firstChar)}">
                <c:set var="anchorName" value="tab-${anchorName}"/>
            </c:if>
            <%-- Strip characters not safe in HTML id / URL fragments (anything outside A-Za-z0-9_) --%>
            <c:set var="anchorName" value="${b5:replaceAll(anchorName, '[^A-Za-z0-9_]', '-')}"/>
        </c:when>
        <c:otherwise>
            <c:set var="anchorName" value="tab-${droppableContent.identifier}"/>
        </c:otherwise>
    </c:choose>
    <c:set var="navItems">
        ${navItems}
        <li class="nav-item" role="presentation">
            <button class="nav-link ${status.first?' active':''}" aria-selected="${status.first?' true':'false'}" data-bs-toggle="tab" data-bs-target="#${anchorName}" role="tab" aria-controls="${anchorName}">${droppableContent.displayableName}</button>
        </li>
    </c:set>
    <c:set var="tabPanes">
        ${tabPanes}
        <div class="tab-pane  ${status.first?' active':''} ${fade ? ' fade' : ''} ${fade && status.first ? ' show' : ''}" id="${anchorName}" role="tabpanel">
            <template:module node="${droppableContent}" editable="true"/>
        </div>
    </c:set>
</c:forEach>



<ul class="nav ${type} ${align ne ' justify-content-start' ? align : ''}" id="tabs-${currentNode.identifier}" role="tablist">
    ${navItems}
</ul>
<div class="tab-content">
    ${tabPanes}
</div>
<c:if test="${renderContext.editMode}">
    <template:module path="*" nodeTypes="jnt:contentList"/>
</c:if>
<template:addResources targetTag="${renderContext.editMode?'head':'body'}" type="inline">
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            <%-- On page load, activate the tab whose id matches the URL hash to support deep-linking --%>
            const trigger = document.querySelector(`ul.nav button[data-bs-target="\${window.location.hash}"]`);
            if (trigger != undefined) {
                const tab = new bootstrap.Tab(trigger);
                tab.show();
            }
        })
        <%-- On tab change, push the new tab's anchor to the URL hash so the active tab survives navigation/sharing --%>
        document.querySelectorAll('ul.nav button[data-bs-toggle="tab"]').forEach(function(el){
            el.addEventListener('shown.bs.tab', function (event) {
                window.location.hash=event.target.dataset.bsTarget;
            })
        })
    </script>
</template:addResources>
