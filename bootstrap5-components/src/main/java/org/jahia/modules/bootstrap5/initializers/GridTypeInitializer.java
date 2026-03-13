package org.jahia.modules.bootstrap5.initializers;

import org.osgi.service.component.annotations.Component;

import java.util.Arrays;
import java.util.List;

@Component(
        name = "gridTypeInitializer5",
        service = org.jahia.services.content.nodetypes.initializers.ModuleChoiceListInitializer.class,
        immediate = true
)
public class GridTypeInitializer extends AbstractSimpleChoiceInitializer {

    public GridTypeInitializer() {
        super("gridTypeInitializer5");
    }

    @Override
    protected List<ChoiceSpec> getChoices() {
        return Arrays.asList(
                ChoiceSpec.of("nogrid"),
                ChoiceSpec.of("predefinedGrid", "bootstrap5mix:predefinedGrid"),
                ChoiceSpec.of("customGrid",     "bootstrap5mix:customGrid")
        );
    }
}
