# Troubleshooting

## Module fails to start — unresolved dependency

**Symptom:**
```
Bundle bootstrap5-components has unresolved dependency bootstrap5-core and won't be started
missing requirement: com.jahia.services.content; (nodetypes=bootstrap5mix:component)
```

**Cause:** `bootstrap5-core` is not deployed or not started.

**Fix:** Deploy and start `bootstrap5-core` first, then start `bootstrap5-components`.

---

## CND warning — node type already defined

**Symptom:**
```
WARN [JahiaCndReader] Node type 'bootstrap5nt:accordion' already defined with a different systemId
(existing: 'bootstrap5-components', provided: 'bootstrap5-components'), ignoring.
```

**Cause:** A legacy `bootstrap5-components` module is still deployed alongside `bootstrap5-components`. Both define the same node types.

**Fix:** Undeploy `bootstrap5-components`. `bootstrap5-components` is the authoritative owner of all `bootstrap5nt:*` and `bootstrap5mix:*` definitions.

---

## JS engine render error — `execute` message not supported

**Symptom:**
```
TypeError: execute on org.jahia.services.render.RenderContext failed due to: Message not supported
```

**Cause:** A `?.()` optional-call expression is used on a Java object reference in a TSX view. The JS engine (GraalVM on Jahia ≤ 8.2.2, OpenJDK-based engine on 8.2.3+) sends an `execute` message instead of `invoke`, which Java objects do not support.

**Fix:** Replace all `obj.method?.()` with explicit null guards:

```tsx
// Wrong
const lang = renderContext.getMainResourceLocale?.()?.getLanguage?.();

// Correct
const locale = renderContext.getMainResourceLocale();
const lang = locale ? String(locale.getLanguage()) : "en";
```

---

## Template set not visible when creating a site

**Symptom:** `bootstrap5-templates-starter` does not appear in the template set picker when creating a new site.

**Cause:** The module is not started, or its `module-type` is not `templatesSet`.

**Fix:**
1. Check the module is in `Active` state
2. Verify `package.json` contains `"module-type": "templatesSet"`
3. Restart the module and check logs for successful registration

---

## Content Editor fields missing or in wrong order

**Symptom:** Properties defined in the CND do not appear in the Content Editor, or appear in the wrong section.

**Cause:** The `META-INF/jahia-content-editor-forms/` JSON file for the affected type is missing or has an incorrect `name` field.

**Fix:** Verify the JSON file name matches the node type name (e.g. `bootstrap5nt_card.json` for `bootstrap5nt:card`) and that `StaticDefinitionsRegistry` logged `Successfully loaded static fieldSets for name bootstrap5nt:card`.

---

## Static resources (images, CSS, JS) return 404

**Symptom:** Thumbnail images in the Content Editor, or static JS/CSS files served by the module, return 404.

**Cause:** The resource directory is not included in the TGZ (not listed in `files` in `package.json`).

**Fix:** Add the directory name to the `files` array in `package.json` and rebuild the TGZ.

---

## Jahia shuts down after deploying a module

**Symptom:** Jahia Tomcat process stops after a provisioning operation.

**Cause:** Some provisioning scripts or module updates trigger a scheduled Jahia restart. This is normal for certain types of module changes (e.g. new CND definitions on a production instance).

**Fix:** Wait for the restart to complete. Monitor `catalina.out` for the startup completion message.

---

## Log locations

| Log file | Content |
|----------|---------|
| `tomcat/logs/catalina.out` | Full startup/shutdown log, module lifecycle, JS engine errors |
| `tomcat/logs/jahia.log` | Jahia application log |
| `tomcat/logs/jahia_access.log` | HTTP access log |

Relevant log patterns to grep:

```bash
# Module lifecycle
grep "bootstrap5" catalina.out | grep -E "INFO|ERROR|WARN"

# CND loading
grep "JahiaCndReader" catalina.out

# JS engine errors (GraalVM on ≤ 8.2.2, OpenJDK Nashorn on 8.2.3+)
grep "TypeError\|execute on\|javascript-modules" catalina.out

# Content Editor forms
grep "StaticDefinitionsRegistry" catalina.out
```
