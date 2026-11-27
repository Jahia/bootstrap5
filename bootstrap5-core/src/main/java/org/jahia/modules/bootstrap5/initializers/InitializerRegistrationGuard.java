package org.jahia.modules.bootstrap5.initializers;

import org.jahia.services.content.nodetypes.initializers.ChoiceListInitializer;
import org.jahia.services.content.nodetypes.initializers.ChoiceListInitializerService;
import org.jahia.services.content.nodetypes.initializers.ModuleChoiceListInitializer;
import org.jahia.services.content.nodetypes.renderer.ChoiceListRenderer;
import org.jahia.services.content.nodetypes.renderer.ChoiceListRendererService;
import org.jahia.services.content.nodetypes.renderer.ModuleChoiceListRenderer;
import org.osgi.framework.BundleContext;
import org.osgi.framework.BundleEvent;
import org.osgi.framework.BundleListener;
import org.osgi.framework.ServiceReference;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * Keeps the choice list initializers of this module registered in Jahia.
 *
 * <p>Jahia registers and unregisters module initializers by key. In 2.x the three initializers
 * (grid type, button type, navbar root) lived in bootstrap5-components; in 3.x they live here,
 * under the same keys, which the stored definitions refer to. When a site is upgraded, the 3.x
 * core is installed first and registers them, then the 2.x components bundle is stopped and
 * removes those very keys: the lists then lose the mixin each choice brings, every optional field
 * set shows at once in the content editor, and choosing a type no longer adds its mixin.
 *
 * <p>This component puts the initializers of this bundle back whenever another bundle stops,
 * starts or is uninstalled, if their key is no longer registered.
 */
@Component(immediate = true, service = InitializerRegistrationGuard.class)
public class InitializerRegistrationGuard implements BundleListener {

    private static final Logger logger = LoggerFactory.getLogger(InitializerRegistrationGuard.class);

    private static final int WATCHED_EVENTS =
            BundleEvent.STOPPED | BundleEvent.STARTED | BundleEvent.UNINSTALLED | BundleEvent.UPDATED;

    private BundleContext bundleContext;

    @Activate
    public void activate(BundleContext context) {
        this.bundleContext = context;
        context.addBundleListener(this);
    }

    @Deactivate
    public void deactivate(BundleContext context) {
        context.removeBundleListener(this);
        this.bundleContext = null;
    }

    @Override
    public void bundleChanged(BundleEvent event) {
        BundleContext context = this.bundleContext;
        if (context == null || (event.getType() & WATCHED_EVENTS) == 0
                || event.getBundle().getBundleId() == context.getBundle().getBundleId()) {
            return;
        }
        try {
            restore(context);
        } catch (RuntimeException e) {
            logger.warn("Bootstrap5: could not check the registration of the choice list initializers", e);
        }
    }

    /** Registers again the initializers and renderers of this bundle whose key is missing. */
    void restore(BundleContext context) {
        ServiceReference<?>[] references = context.getBundle().getRegisteredServices();
        if (references == null) {
            return;
        }
        Map<String, ChoiceListInitializer> initializers = ChoiceListInitializerService.getInstance().getInitializers();
        Map<String, ChoiceListRenderer> renderers = ChoiceListRendererService.getInstance().getRenderers();
        for (ServiceReference<?> reference : references) {
            Object service = context.getService(reference);
            try {
                if (service instanceof ModuleChoiceListInitializer) {
                    ModuleChoiceListInitializer initializer = (ModuleChoiceListInitializer) service;
                    if (initializers != null && !initializers.containsKey(initializer.getKey())) {
                        initializers.put(initializer.getKey(), initializer);
                        logger.info("Bootstrap5: choice list initializer '{}' registered again", initializer.getKey());
                    }
                }
                if (service instanceof ModuleChoiceListRenderer) {
                    ModuleChoiceListRenderer renderer = (ModuleChoiceListRenderer) service;
                    if (renderers != null && !renderers.containsKey(renderer.getKey())) {
                        renderers.put(renderer.getKey(), renderer);
                    }
                }
            } finally {
                if (service != null) {
                    context.ungetService(reference);
                }
            }
        }
    }
}
