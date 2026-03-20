package org.jahia.modules.bootstrap5.initializers;

import org.osgi.service.component.annotations.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Jahia choice list initializer for the button action type selector ({@code bootstrap5nt:button#buttonType}).
 *
 * <p>Provides six action types, each of which dynamically adds a mixin to the button node so that
 * the content editor can display the relevant extra properties:
 * <ul>
 *   <li>{@code externalLink} — links to an arbitrary URL; adds {@code bootstrap5mix:externalLink}.</li>
 *   <li>{@code internalLink} — links to an internal page, content, or file; adds {@code bootstrap5mix:internalLink}.</li>
 *   <li>{@code modal} — opens a Bootstrap dialog; adds {@code bootstrap5mix:modal}.</li>
 *   <li>{@code collapse} — toggles a collapsible content area; adds {@code bootstrap5mix:collapse}.</li>
 *   <li>{@code popover} — shows a contextual popover; adds {@code bootstrap5mix:popover}.</li>
 *   <li>{@code Offcanvas} — slides in a side panel; adds {@code bootstrap5mix:Offcanvas}.</li>
 * </ul>
 *
 * <p>Registered as an OSGi service under the name {@code buttonTypeInitializer5}, which matches the
 * initializer key referenced in {@code definitions.cnd}:
 * {@code choicelist[buttonTypeInitializer5, resourceBundle]}.
 */
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
