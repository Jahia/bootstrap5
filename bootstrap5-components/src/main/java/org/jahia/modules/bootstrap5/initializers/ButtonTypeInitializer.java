package org.jahia.modules.bootstrap5.initializers;

import org.osgi.service.component.annotations.Component;

import java.util.Arrays;
import java.util.List;

@Component(
        name = "buttonTypeInitializer5",
        service = org.jahia.services.content.nodetypes.initializers.ModuleChoiceListInitializer.class,
        immediate = true
)
public class ButtonTypeInitializer extends AbstractSimpleChoiceInitializer {

    public ButtonTypeInitializer() {
        super("buttonTypeInitializer5");
    }

    @Override
    protected List<ChoiceSpec> getChoices() {
        return Arrays.asList(
                ChoiceSpec.of("externalLink", "bootstrap5mix:externalLink"),
                ChoiceSpec.of("internalLink", "bootstrap5mix:internalLink"),
                ChoiceSpec.of("modal",        "bootstrap5mix:modal"),
                ChoiceSpec.of("collapse",     "bootstrap5mix:collapse"),
                ChoiceSpec.of("popover",      "bootstrap5mix:popover"),
                ChoiceSpec.of("Offcanvas",    "bootstrap5mix:Offcanvas")
        );
    }
}
