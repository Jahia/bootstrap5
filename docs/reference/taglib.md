# Taglib Reference — `b5:`

The `bootstrap5-components` module provides a custom JSP taglib under the URI `http://www.jahia.org/b5`. Declare it in any JSP that uses it:

```jsp
<%@ taglib prefix="b5" uri="http://www.jahia.org/b5" %>
```

---

## Functions

Functions are used via EL expressions: `${b5:functionName(args)}`.

---

### `b5:replaceAll`

Performs a regex-based string replacement.

**Signature:**
```java
String replaceAll(String value, String pattern, String replacement)
```

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `value` | String | The input string |
| `pattern` | String | A Java regular expression |
| `replacement` | String | The replacement string |

**Returns:** The input string with all matches replaced.

**Example — sanitize a string for use as an HTML `id`:**
```jsp
<c:set var="safeId" value="${b5:replaceAll(currentNode.name, '[^a-zA-Z0-9-_]', '-')}"/>
<div id="${safeId}">...</div>
```

---

### `b5:isRtlLanguage`

Returns `true` if the given language code uses a right-to-left script.

**Signature:**
```java
boolean isRtlLanguage(String languageCode)
```

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `languageCode` | String | A BCP 47 / ISO 639-1 language code (e.g. `ar`, `he`, `fa`) |

**Returns:** `true` for RTL scripts (Arabic, Hebrew, Persian, Syriac, Thaana, etc.), `false` otherwise.

Detection uses Unicode script range analysis — not a hardcoded list — so it handles scripts correctly regardless of language code variants.

**Example:**
```jsp
<c:set var="isRtl" value="${b5:isRtlLanguage(renderContext.mainResourceLocale.language)}"/>
<html lang="${renderContext.mainResourceLocale.language}" ${isRtl ? 'dir="rtl"' : ''}>
<head>
    <c:choose>
        <c:when test="${isRtl}">
            <template:addResources type="css" resources="bootstrap.rtl.min.css"/>
        </c:when>
        <c:otherwise>
            <template:addResources type="css" resources="bootstrap.min.css"/>
        </c:otherwise>
    </c:choose>
</head>
```

---

## Tags

---

### `<b5:switchToLanguageLink>`

Renders an `<a>` element that links to the current page in a different language.

**Attributes:**

| Attribute | Required | Type | Description |
|---|---|---|---|
| `languageCode` | yes | String | Target language code (e.g. `en`, `de`, `fr`) |

**Output:** A single `<a class="dropdown-item">` element with the language's translated name and the correct URL for the current page in that language.

**Example:**
```jsp
<ul>
    <c:forEach var="languageCode" items="${languageCodes}">
        <c:if test="${languageCode != renderContext.mainResourceLocale.language}">
            <li><b5:switchToLanguageLink languageCode="${languageCode}"/></li>
        </c:if>
    </c:forEach>
</ul>
```

**Note:** The tag resolves the target URL by finding the translated version of the current node in JCR. If no translation exists for the target language, it falls back to the site home page.

---

[← Back to README](../../README.md) | [← Node type reference](node-types.md)
