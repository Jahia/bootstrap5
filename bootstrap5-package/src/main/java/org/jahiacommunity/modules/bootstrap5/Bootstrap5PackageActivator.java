package org.jahiacommunity.modules.bootstrap5;

import org.jahia.services.SpringContextSingleton;
import org.jahia.services.modulemanager.ModuleManager;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
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
 * JavascriptProtocolStreamHandler URL handler to convert the tgz to a JAR on the fly.
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
        // Wait for Jahia's Spring context to be fully initialized
        int attempts = 0;
        while (!SpringContextSingleton.getInstance().isInitialized() && attempts < 60) {
            try { Thread.sleep(1000); } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
            attempts++;
        }

        ModuleManager moduleManager = (ModuleManager) SpringContextSingleton.getBean("ModuleManager");
        if (moduleManager == null) {
            logger.error("Bootstrap5 package: ModuleManager bean not found in Spring context");
            return;
        }

        String version;
        try (InputStream is = getClass().getResourceAsStream("/bootstrap5-package.properties")) {
            Properties props = new Properties();
            props.load(is);
            version = props.getProperty("bootstrap5.version");
        } catch (Exception e) {
            logger.error("Bootstrap5 package: could not read version properties", e);
            return;
        }

        // .jar modules installed via ModuleManager (handles JCR state / Jahia module registry)
        String[] jarModules = {
            "/jahia-packages/skins-8.2.0.jar",
            "/jahia-packages/bootstrap5-core-" + version + ".jar"
        };
        for (String path : jarModules) {
            URL url = getClass().getResource(path);
            if (url == null) {
                logger.error("Bootstrap5 package: embedded module not found: {}", path);
                return;
            }
            Resource resource = new UrlResource(url);
            try {
                logger.info("Bootstrap5 package: installing {}...", resource.getFilename());
                moduleManager.install(Collections.singletonList(resource), null, true, true);
                logger.info("Bootstrap5 package: installed {}", resource.getFilename());
            } catch (Exception e) {
                logger.error("Bootstrap5 package: failed to install {}", resource.getFilename(), e);
                return;
            }
        }

        // .tgz modules: installed via "js:file://" URL.
        // JavascriptProtocolStreamHandler converts the tgz to an OSGi bundle JAR on the fly.
        // We write to bundleContext.getDataFile() so the location is stable within this
        // package instance. We look up existing bundles by symbolic name to handle the case
        // where the bundle was previously installed by the UI or another mechanism.
        String[] tgzModules = {
            "/jahia-packages/bootstrap5-components-" + version + ".tgz",
            "/jahia-packages/bootstrap5-templates-starter-" + version + ".tgz"
        };
        for (String path : tgzModules) {
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
                    while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
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

            } catch (Exception e) {
                logger.error("Bootstrap5 package: failed to install/update {}", filename, e);
                return;
            }
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
