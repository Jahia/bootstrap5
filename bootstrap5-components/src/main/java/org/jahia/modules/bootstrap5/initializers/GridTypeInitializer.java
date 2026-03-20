package org.jahia.modules.bootstrap5.initializers;

import org.osgi.service.component.annotations.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Jahia choice list initializer for the grid type selector ({@code bootstrap5mix:createRow#typeOfGrid}).
 *
 * <p>Provides three options:
 * <ul>
 *   <li>{@code nogrid} — an empty row with no predefined columns (content is placed directly in the row).</li>
 *   <li>{@code predefinedGrid} — one of the built-in column layouts (e.g., 4/8, 6/6, 3/6/3…).
 *       Selecting this option dynamically adds the {@code bootstrap5mix:predefinedGrid} mixin to the node.</li>
 *   <li>{@code customGrid} — a free-form layout where the editor enters Bootstrap column classes manually
 *       (comma-separated). Selecting this option dynamically adds the {@code bootstrap5mix:customGrid} mixin.</li>
 * </ul>
 *
 * <p>Registered as an OSGi service under the name {@code gridTypeInitializer5}, which matches the
 * initializer key referenced in {@code definitions.cnd}:
 * {@code choicelist[gridTypeInitializer5, resourceBundle]}.
 */
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
