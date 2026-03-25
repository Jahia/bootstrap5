/**
 * Migration script — activate JS rendering modules on Bootstrap 5 sites
 * ========================================================================
 * Executed automatically by Jahia's GroovyPatcher on module startup.
 * Runs once per Jahia instance (Jahia marks it as executed in the JCR).
 *
 * What it does:
 *   For every site whose template set is "bootstrap5-templates-starter",
 *   add "bootstrap5-js-rendering" and "bootstrap5-templates-starter-js"
 *   to j:installedModules — IF those modules are actually deployed in Karaf.
 *
 * Safety rules:
 *   - Only acts on sites using bootstrap5-templates-starter as template set
 *   - Only adds modules that are available (deployed) in the OSGi container
 *   - Idempotent: skips sites that already have the modules installed
 *   - Logs every action and every skip
 *   - Catches per-site exceptions so one bad site does not abort the migration
 *
 * To re-run manually: delete the marker node in the JCR at
 *   /patches/groovy/1.0.0-activate-js-rendering.groovy
 * then restart the module.
 */

import org.jahia.services.content.JCRTemplate
import org.jahia.services.sites.JahiaSitesService
import org.jahia.data.templates.JahiaTemplatesPackage
import org.jahia.services.templates.JahiaTemplateManagerService
import org.springframework.context.ApplicationContext

// ---- Resolve Spring services ------------------------------------------------

def appContext = (ApplicationContext) springBeanFactory   // available in GroovyPatcher context
def sitesService  = JahiaSitesService.getInstance()
def templateManagerService = appContext.getBean(JahiaTemplateManagerService.class)

// ---- Helper: check whether a module is deployed in Karaf --------------------

def isModuleDeployed = { String moduleId ->
    try {
        JahiaTemplatesPackage pkg = templateManagerService.getTemplatePackageById(moduleId)
        return pkg != null && pkg.getState()?.toString() == "Started"
    } catch (Exception e) {
        log.warn("[JS rendering migration] Could not check module '${moduleId}': ${e.message}")
        return false
    }
}

// ---- Constants --------------------------------------------------------------

def JS_MODULES = ["bootstrap5-js-rendering", "bootstrap5-templates-starter-js"]
def TEMPLATE_SET = "bootstrap5-templates-starter"

// ---- Check that the target modules are actually available -------------------

def availableModules = JS_MODULES.findAll { isModuleDeployed(it) }

if (availableModules.isEmpty()) {
    log.warn("[JS rendering migration] Neither bootstrap5-js-rendering nor " +
             "bootstrap5-templates-starter-js is deployed — skipping migration. " +
             "Deploy those modules and reinstall bootstrap5-templates-starter to re-run.")
    return
}

if (availableModules.size() < JS_MODULES.size()) {
    def missing = JS_MODULES - availableModules
    log.warn("[JS rendering migration] Some JS modules are not deployed: ${missing}. " +
             "Only ${availableModules} will be activated.")
}

// ---- Iterate sites ----------------------------------------------------------

int migrated = 0
int skipped  = 0

sitesService.getSites().each { site ->
    def siteKey = site.getSiteKey()

    try {
        // Only target sites whose template set is bootstrap5-templates-starter
        def pkg = site.getTemplatePackage()
        if (pkg?.getId() != TEMPLATE_SET) {
            return  // next site
        }

        JCRTemplate.getInstance().doExecuteWithSystemSession { session ->
            def siteNode = session.getNode("/sites/${siteKey}")

            // Read current j:installedModules
            def currentModules = siteNode.hasProperty("j:installedModules")
                ? siteNode.getProperty("j:installedModules").values.collect { it.string }
                : []

            def toAdd = availableModules.findAll { !currentModules.contains(it) }

            if (toAdd.isEmpty()) {
                log.info("[JS rendering migration] Site '${siteKey}' already has JS rendering modules — skipping.")
                skipped++
                return
            }

            currentModules.addAll(toAdd)
            siteNode.setProperty("j:installedModules", currentModules as String[])
            session.save()

            log.info("[JS rendering migration] Site '${siteKey}': added ${toAdd}.")
            migrated++
        }

    } catch (Exception e) {
        log.error("[JS rendering migration] Error processing site '${siteKey}': ${e.message}", e)
    }
}

log.info("[JS rendering migration] Done — ${migrated} site(s) migrated, ${skipped} site(s) already up to date.")
