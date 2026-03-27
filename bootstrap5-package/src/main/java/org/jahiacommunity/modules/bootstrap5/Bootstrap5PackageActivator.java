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
import java.util.Properties;

/**
 * OSGi BundleActivator that installs all Bootstrap 5 modules when this package bundle starts.
 * - .jar modules: installed via ModuleManager (handles Jahia JCR registration)
 * - .tgz modules: written to a temp file and installed via bundleContext.installBundle("js:file://...")
 *   which uses the javascript-modules-engine's JavascriptProtocolStreamHandler URL handler to
 *   convert the tgz to a JAR stream on the fly.
 */
public class Bootstrap5PackageActivator implements BundleActivator {

    private static final Logger logger = LoggerFactory.getLogger(Bootstrap5PackageActivator.class);

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
        // nothing
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

        // .tgz modules installed via "js:file://" URL — the javascript-modules-engine's
        // JavascriptProtocolStreamHandler converts the tgz to an OSGi bundle jar on the fly.
        String[] tgzModules = {
            "/jahia-packages/bootstrap5-components-" + version + ".tgz",
            "/jahia-packages/bootstrap5-templates-starter-" + version + ".tgz"
        };
        for (String path : tgzModules) {
            String filename = path.substring(path.lastIndexOf('/') + 1);
            try {
                // Write embedded tgz to a temp file so we can form a file:// URL
                File tempFile = File.createTempFile("bs5-", ".tgz");
                tempFile.deleteOnExit();
                try (InputStream in = getClass().getResourceAsStream(path);
                     FileOutputStream out = new FileOutputStream(tempFile)) {
                    byte[] buf = new byte[8192];
                    int n;
                    while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
                }
                String jsUrl = "js:" + tempFile.toURI().toString();
                logger.info("Bootstrap5 package: installing {} via {}...", filename, jsUrl);
                Bundle bundle = bundleContext.installBundle(jsUrl);
                bundle.start();
                logger.info("Bootstrap5 package: installed and started {}", filename);
            } catch (Exception e) {
                logger.error("Bootstrap5 package: failed to install {}", filename, e);
                return;
            }
        }
    }
}
