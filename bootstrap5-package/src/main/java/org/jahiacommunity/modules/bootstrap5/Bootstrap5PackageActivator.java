package org.jahiacommunity.modules.bootstrap5;

import org.jahia.services.SpringContextSingleton;
import org.jahia.services.modulemanager.ModuleManager;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.Version;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.Collections;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * OSGi BundleActivator that installs all Bootstrap 5 modules when this package bundle starts.
 *
 * .jar modules: installed via ModuleManager (handles Jahia JCR registration).
 *
 * .tgz modules: written to the bundle's persistent data directory and installed via
 * bundleContext.installBundle("js:file://...") which uses the javascript-modules-engine's
 * JavascriptProtocolStreamHandler URL handler to convert the tgz to a JAR on the fly. The engine is the
 * one shipped with Jahia (1.2.0 or later): it is checked, not installed.
 *
 * Redeploy handling:
 * - stop() uninstalls the tgz bundles we installed so that the next start() can do a clean
 *   re-install without hitting "Bundle symbolic name and version are not unique".
 * - If a tgz bundle is already present in OSGi (installed via the UI or another mechanism),
 *   the installer updates it in place via bundle.update(stream) instead of installing anew.
 */
public class Bootstrap5PackageActivator implements BundleActivator {

    private static final Logger logger = LoggerFactory.getLogger(Bootstrap5PackageActivator.class);

    /** Bundle IDs of tgz bundles WE installed — uninstalled on stop() for clean redeploy. */
    private final List<Long> tgzBundleIds = new CopyOnWriteArrayList<>();

    private BundleContext bundleContext;

    @Override
    public void start(BundleContext context) throws Exception {
        this.bundleContext = context;
        Thread installer = new Thread(this::installModules, "bootstrap5-package-installer");
        installer.setDaemon(true);
        installer.start();
    }

    @Override
    public void stop(BundleContext context) throws Exception {
        // Uninstall the tgz bundles we installed so that when this package is redeployed
        // the next start() can do a fresh installBundle() without symbolic-name conflicts.
        for (long id : tgzBundleIds) {
            Bundle b = context.getBundle(id);
            if (b != null && b.getState() != Bundle.UNINSTALLED) {
                try {
                    b.uninstall();
                    logger.info("Bootstrap5 package: uninstalled tgz bundle id={}", id);
                } catch (Exception e) {
                    logger.warn("Bootstrap5 package: could not uninstall bundle id={}", id, e);
                }
            }
        }
        tgzBundleIds.clear();
    }

    private void installModules() {
        if (!waitForSpringContext()) {
            return;
        }

        ModuleManager moduleManager = (ModuleManager) SpringContextSingleton.getBean("ModuleManager");
        if (moduleManager == null) {
            logger.error("Bootstrap5 package: ModuleManager bean not found in Spring context");
            return;
        }

        String version;
        String minimumEngineVersion;
        try (InputStream is = getClass().getResourceAsStream("/bootstrap5-package.properties")) {
            Properties props = new Properties();
            props.load(is);
            version = props.getProperty("bootstrap5.version");
            minimumEngineVersion = props.getProperty("javascript.modules.engine.min.version");
        } catch (Exception e) {
            logger.error("Bootstrap5 package: could not read version properties", e);
            return;
        }

        // The JavaScript modules run on the engine shipped with Jahia: check it, never install it.
        if (!installJarModules(moduleManager, version) || !checkJavascriptEngine(minimumEngineVersion)) {
            return;
        }

        String[] tgzModules = {
            "/jahia-packages/bootstrap5-components-" + version + ".tgz",
            "/jahia-packages/bootstrap5-templates-starter-" + version + ".tgz"
        };
        for (String path : tgzModules) {
            if (!installTgzModule(path, version)) {
                return;
            }
        }
    }

    /**
     * Waits for Jahia's Spring context to be fully initialized, for one minute at most.
     *
     * @return false when the thread was interrupted while waiting
     */
    private boolean waitForSpringContext() {
        int attempts = 0;
        while (!SpringContextSingleton.getInstance().isInitialized() && attempts < 60) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
            attempts++;
        }
        return true;
    }

    /**
     * Installs the .jar modules through the ModuleManager, which handles the JCR state and the
     * Jahia module registry.
     *
     * @return false when a module is missing or could not be installed
     */
    private boolean installJarModules(ModuleManager moduleManager, String version) {
        String[] jarModules = {
            "/jahia-packages/skins-8.2.0.jar",
            "/jahia-packages/bootstrap5-core-" + version + ".jar"
        };
        for (String path : jarModules) {
            URL url = getClass().getResource(path);
            if (url == null) {
                logger.error("Bootstrap5 package: embedded module not found: {}", path);
                return false;
            }
            Resource resource = new UrlResource(url);
            try {
                logger.info("Bootstrap5 package: installing {}...", resource.getFilename());
                moduleManager.install(Collections.singletonList(resource), null, true, true);
                logger.info("Bootstrap5 package: installed {}", resource.getFilename());
            } catch (Exception e) {
                logger.error("Bootstrap5 package: failed to install {}", resource.getFilename(), e);
                return false;
            }
        }
        return true;
    }

    /**
     * Installs or updates a .tgz module through a "js:file://" URL:
     * JavascriptProtocolStreamHandler converts the tgz to an OSGi bundle JAR on the fly.
     * The tgz is written to bundleContext.getDataFile() so the location is stable within this
     * package instance. An existing bundle is looked up by symbolic name, to handle the case
     * where it was previously installed by the UI or another mechanism.
     *
     * @return false when the module could not be installed or updated
     */
    private boolean installTgzModule(String path, String version) {
        String filename = path.substring(path.lastIndexOf('/') + 1);
        // Derive symbolic name by stripping "-VERSION.tgz"
        String symbolicName = filename.replace("-" + version + ".tgz", "");
        try {
            // Write tgz to data dir (content may have changed on redeploy)
            File dataFile = bundleContext.getDataFile(filename);
            try (InputStream in = getClass().getResourceAsStream(path);
                 FileOutputStream out = new FileOutputStream(dataFile)) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = in.read(buf)) != -1) {
                    out.write(buf, 0, n);
                }
            }

            String jsUrl = "js:" + dataFile.toURI().toString();

            // Check if a bundle with this symbolic name is already running
            // (could be from a previous install by us, by the UI, or by Fileinstall)
            Bundle existing = findBySymbolicName(symbolicName);

            Bundle bundle;
            if (existing != null) {
                logger.info("Bootstrap5 package: updating {} (id={})...", symbolicName, existing.getBundleId());
                // Update with fresh content via the js: URL handler
                try (InputStream stream = new URL(jsUrl).openStream()) {
                    existing.update(stream);
                }
                if (existing.getState() != Bundle.ACTIVE) {
                    existing.start();
                }
                bundle = existing;
                logger.info("Bootstrap5 package: updated {}", symbolicName);
            } else {
                logger.info("Bootstrap5 package: installing {}...", filename);
                bundle = bundleContext.installBundle(jsUrl);
                bundle.start();
                logger.info("Bootstrap5 package: installed {}", filename);
            }
            tgzBundleIds.add(bundle.getBundleId());
            return true;
        } catch (Exception e) {
            logger.error("Bootstrap5 package: failed to install/update {}", filename, e);
            return false;
        }
    }

    private static final String ENGINE_SYMBOLIC_NAME = "javascript-modules-engine";

    /**
     * Checks that the javascript-modules-engine shipped with Jahia is present and recent enough. The
     * engine is a platform component shared by every JavaScript module: it is never installed here.
     * Only an ACTIVE bundle counts: a stopped engine is RESOLVED too, and provides nothing. The engine
     * may still be starting when this thread runs, so it is awaited for one minute at most.
     *
     * @return false (after logging an error) when no active engine of the minimum version is found
     */
    private boolean checkJavascriptEngine(String minimumVersion) {
        Version highest = highestActiveEngine();
        for (int attempt = 0; attempt < 60 && (highest == null || !isAtLeast(highest, minimumVersion)); attempt++) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
            highest = highestActiveEngine();
        }
        if (highest != null && isAtLeast(highest, minimumVersion)) {
            logger.info("Bootstrap5 package: {} {} found", ENGINE_SYMBOLIC_NAME, highest);
            return true;
        }
        logger.error("Bootstrap5 package: {} {} or later is required (found: {}). "
                + "bootstrap5-components and bootstrap5-templates-starter are NOT installed.",
                ENGINE_SYMBOLIC_NAME, minimumVersion, highest != null ? highest : "none");
        return false;
    }

    /** The highest version of javascript-modules-engine that is ACTIVE, or null when none is. */
    private Version highestActiveEngine() {
        Version highest = null;
        for (Bundle b : bundleContext.getBundles()) {
            if (b.getState() == Bundle.ACTIVE && ENGINE_SYMBOLIC_NAME.equals(b.getSymbolicName())
                    && (highest == null || b.getVersion().compareTo(highest) > 0)) {
                highest = b.getVersion();
            }
        }
        return highest;
    }

    /** Compares major.minor.micro only: 1.2.0-SNAPSHOT counts as 1.2.0. */
    static boolean isAtLeast(Version running, String required) {
        try {
            String[] parts = required.split("[.\\-]");
            Version minimum = new Version(
                    Integer.parseInt(parts[0]),
                    parts.length > 1 ? Integer.parseInt(parts[1]) : 0,
                    parts.length > 2 ? Integer.parseInt(parts[2]) : 0);
            return new Version(running.getMajor(), running.getMinor(), running.getMicro())
                    .compareTo(minimum) >= 0;
        } catch (RuntimeException e) {
            return false;
        }
    }

    private Bundle findBySymbolicName(String symbolicName) {
        for (Bundle b : bundleContext.getBundles()) {
            if (symbolicName.equals(b.getSymbolicName()) && b.getState() != Bundle.UNINSTALLED) {
                return b;
            }
        }
        return null;
    }
}
