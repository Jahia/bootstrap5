package org.jahia.modules.bootstrap5.initializers;

import org.osgi.service.component.annotations.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Jahia choice list initializer for the navbar starting point selector ({@code bootstrap5nt:navbar#root}).
 *
 * <p>Determines which page node is used as the root of the navigation tree. Four options are available:
 * <ul>
 *   <li>{@code homePage} — the navigation displays level-1 pages (direct children of the site home page).</li>
 *   <li>{@code currentPage} — the navigation displays children of the page currently being rendered.</li>
 *   <li>{@code parentPage} — the navigation displays siblings of the current page (children of its parent).</li>
 *   <li>{@code customRootPage} — a page picker lets the editor choose any page as root; dynamically adds
 *       {@code bootstrap5mix:customRootPage} so the picker property appears in the content editor.</li>
 * </ul>
 *
 * <p>Registered as an OSGi service under the name {@code navbarRootInitializer5}, which matches the
 * initializer key referenced in {@code definitions.cnd}:
 * {@code choicelist[navbarRootInitializer5, resourceBundle]}.
 */
@Component(
        name = "navbarRootInitializer5",
        service = org.jahia.services.content.nodetypes.initializers.ModuleChoiceListInitializer.class,
        immediate = true
)
public class NavbarRootInitializer extends AbstractSimpleChoiceInitializer {

    public NavbarRootInitializer() {
        super("navbarRootInitializer5");
    }

    @Override
    protected List<ChoiceSpec> getChoices() {
        return Arrays.asList(
                ChoiceSpec.of("homePage"),
                ChoiceSpec.of("currentPage"),
                ChoiceSpec.of("parentPage"),
                ChoiceSpec.of("customRootPage", "bootstrap5mix:customRootPage")
        );
    }
}
