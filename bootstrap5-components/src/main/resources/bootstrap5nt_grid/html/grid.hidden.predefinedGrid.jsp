<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib"%>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>

<%-- Prefix for area names in /modules or Studio --%>
<c:set var="colNamePrefix"
       value="${(fn:startsWith(currentNode.path,'/modules') or renderContext.editModeConfigName eq 'studiomode')
                ? currentNode.name.concat('-') : ''}"/>

<%-- Grid pattern (e.g. '4_8', '3_6_3', '12') --%>
<c:set var="grid" value="${currentNode.properties.grid.string}"/>
<c:set var="parts" value="${fn:split(grid,'_')}"/>
<c:set var="count" value="${fn:length(parts)}"/>

<%-- Absolute areas / moduleType / level --%>
<c:set var="createAbsoluteAreas" value="${jcr:isNodeType(currentNode, 'bootstrap5mix:createAbsoluteAreas')}"/>
<c:set var="moduleType" value="${createAbsoluteAreas ? 'absoluteArea' : 'area'}"/>
<c:set var="level" value="${createAbsoluteAreas ? currentNode.properties.level.string : '0'}"/>

<%-- listLimit (default -1) --%>
<c:set var="hasListLimit" value="${jcr:isNodeType(currentNode, 'bootstrap5mix:listLimit')}"/>
<c:set var="listLimit" value="${hasListLimit and not empty currentNode.properties.listLimit.string
                                ? currentNode.properties.listLimit.string : '-1'}"/>

<%-- Optional Studio helper card for absolute areas --%>
<c:if test="${createAbsoluteAreas and renderContext.editModeConfigName eq 'studiomode'}">
    <c:set var="displayAbsoluteArea">
        <div class="card text-white bg-danger mb-3">
            <div class="card-header">Absolute Area</div>
            <div class="card-body">
                <p class="card-text">Define area for level ${level}.</p>
            </div>
        </div>
    </c:set>
</c:if>

<%-- Compute area names order based on columns pattern --%>
<c:choose>
    <c:when test="${count == 1}">
        <c:set var="areasCsv" value="main"/>
    </c:when>
    <c:when test="${count == 2}">
        <%-- smaller first → side,main (e.g. 4_8); else main,side (e.g. 8_4) --%>
        <c:set var="areasCsv" value="${parts[0] lt parts[1] ? 'side,main' : 'main,side'}"/>
    </c:when>
    <c:when test="${count == 3}">
        <%-- center strictly larger → side,main,extra (e.g. 3_6_3), else main,side,extra (e.g. 4_4_4) --%>
        <c:set var="areasCsv"
               value="${(parts[1] gt parts[0] and parts[1] gt parts[2]) ? 'side,main,extra' : 'main,side,extra'}"/>
    </c:when>
    <c:otherwise>
        <c:set var="areasCsv" value="main,side,extra,extra2"/>
    </c:otherwise>
</c:choose>
<c:set var="areaNames" value="${fn:split(areasCsv, ',')}"/>

<%-- If grid is not recognized, show warning in edit mode --%>
<c:if test="${count lt 1 or count gt 4}">
    <c:if test="${renderContext.editMode}">
        <div class="col">
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                <strong><fmt:message key="bootstrap5nt_grid.warning"/></strong>
                <fmt:message key="bootstrap5nt_grid.couldNotDisplayGrid">
                    <fmt:param value="${grid}"/>
                </fmt:message>
            </div>
        </div>
    </c:if>
</c:if>

<%-- Render columns dynamically --%>
<c:if test="${count >= 1 and count <= 4}">
    <c:forEach var="i" begin="0" end="${count - 1}" varStatus="st">
        <c:set var="span" value="${parts[i]}"/>
        <c:set var="colClass" value="${span eq '12' ? 'col' : 'col-md-'.concat(span)}"/>
        <c:set var="areaPath" value="${colNamePrefix}${areaNames[i]}"/>

        <div class="${colClass}">
                ${displayAbsoluteArea}
            <template:area path="${areaPath}"
                           areaAsSubNode="true"
                           moduleType="${moduleType}"
                           level="${level}"
                           listLimit="${listLimit}"/>
        </div>
    </c:forEach>
</c:if>
