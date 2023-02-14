<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="maxLevel" value="${currentNode.properties.maxlevel.string}"/>
<c:if test="${empty maxLevel}">
    <c:set var="maxLevel" value="2"/>
</c:if>
<c:choose>
    <c:when test="${maxLevel>1}">
        <template:addResources type="css" resources="bootstrap.min.css,multilevel-nav.css"/>
        <template:addResources type="javascript" resources="jquery.min.js,bootstrap.bundle.min.js,multilevel-nav.js" targetTag="${renderContext.editMode?'head':'body'}"/>
    </c:when>
    <c:otherwise>
        <template:addResources type="css" resources="bootstrap.min.css"/>
        <template:addResources type="javascript" resources="bootstrap.bundle.min.js" targetTag="${renderContext.editMode?'head':'body'}"/>
    </c:otherwise>
</c:choose>
