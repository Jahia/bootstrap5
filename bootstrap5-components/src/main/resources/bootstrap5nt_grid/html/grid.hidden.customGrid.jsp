<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>

<c:set var="columns" value="${currentNode.properties.gridClasses.string}"/>

<c:set var="colNamePrefix"
       value="${(fn:startsWith(currentNode.path,'/modules') or renderContext.editModeConfigName eq 'studiomode')
                ? currentNode.name.concat('-') : ''}"/>

<c:set var="createAbsoluteAreas" value="${jcr:isNodeType(currentNode, 'bootstrap5mix:createAbsoluteAreas')}"/>
<c:set var="moduleType" value="${createAbsoluteAreas ? 'absoluteArea' : 'area'}"/>
<c:set var="level" value="${createAbsoluteAreas ? currentNode.properties.level.string : '0'}"/>

<c:set var="listLimit"
       value="${(jcr:isNodeType(currentNode, 'bootstrap5mix:listLimit') and not empty currentNode.properties.listLimit.string)
                ? currentNode.properties.listLimit.string : '-1'}"/>

<c:if test="${createAbsoluteAreas and renderContext.editModeConfigName eq 'studiomode'}">
    <c:set var="displayAbsoluteArea">
        <div class="card text-white bg-danger mb-3">
            <div class="card-header">
                <fmt:message key="bootstrap5nt_grid.absolute.area.title"/>
            </div>
            <div class="card-body">
                <p class="card-text">
                    <fmt:message key="bootstrap5nt_grid.absolute.area.desc">
                        <fmt:param value="${level}"/>
                    </fmt:message>
                </p>
            </div>
        </div>
    </c:set>
</c:if>

<c:choose>
    <c:when test="${not empty columns}">
        <c:forTokens items="${columns}" delims="," varStatus="status" var="col">
            <div class="${fn:trim(col)}">${displayAbsoluteArea}
                <template:area path="${colNamePrefix}col${status.index}"
                               areaAsSubNode="true"
                               moduleType="${moduleType}"
                               level="${level}"
                               listLimit="${listLimit}"/>
            </div>
        </c:forTokens>
    </c:when>
    <c:otherwise>
        <div class="col-md-12">
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                <strong><fmt:message key="bootstrap5nt_grid.warning"/></strong>
                <span>
                    <fmt:message key="bootstrap5nt_grid.couldNotDisplayGrid">
                        <fmt:param value="${columns}"/>
                    </fmt:message>
                </span>
            </div>
        </div>
    </c:otherwise>
</c:choose>
