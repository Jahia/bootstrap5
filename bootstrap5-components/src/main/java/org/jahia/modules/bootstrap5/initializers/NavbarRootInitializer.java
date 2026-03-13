package org.jahia.modules.bootstrap5.initializers;

import org.osgi.service.component.annotations.Component;

import java.util.Arrays;
import java.util.List;

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
