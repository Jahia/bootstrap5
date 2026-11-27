package org.jahia.modules.bootstrap5.initializers;

import org.jahia.services.content.nodetypes.initializers.ChoiceListValue;
import org.junit.jupiter.api.Test;

import javax.jcr.RepositoryException;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChoiceInitializersTest {

    private static final Map<String, Object> CONTEXT = Collections.singletonMap("contextNode", "any");

    /** Choice name -> mixin added by Content Editor ("" when none), in display order. */
    private static Map<String, String> choices(AbstractSimpleChoiceInitializer initializer) throws RepositoryException {
        Map<String, String> result = new LinkedHashMap<>();
        for (ChoiceListValue value : initializer.getChoiceListValues(null, null, null, Locale.ENGLISH, CONTEXT)) {
            assertEquals(value.getDisplayName(), value.getValue().getString());
            Object mixin = value.getProperties().get(AbstractSimpleChoiceInitializer.ADD_MIXIN);
            result.put(value.getDisplayName(), mixin == null ? "" : (String) mixin);
        }
        return result;
    }

    @Test
    void gridTypeChoices() throws RepositoryException {
        Map<String, String> expected = new LinkedHashMap<>();
        expected.put("nogrid", "");
        expected.put("predefinedGrid", "bootstrap5mix:predefinedGrid");
        expected.put("customGrid", "bootstrap5mix:customGrid");
        assertEquals(expected, choices(new GridTypeInitializer()));
    }

    @Test
    void buttonTypeChoices() throws RepositoryException {
        Map<String, String> expected = new LinkedHashMap<>();
        expected.put("externalLink", "bootstrap5mix:externalLink");
        expected.put("internalLink", "bootstrap5mix:internalLink");
        expected.put("modal", "bootstrap5mix:modal");
        expected.put("collapse", "bootstrap5mix:collapse");
        expected.put("popover", "bootstrap5mix:popover");
        expected.put("Offcanvas", "bootstrap5mix:Offcanvas");
        assertEquals(expected, choices(new ButtonTypeInitializer()));
    }

    @Test
    void navbarRootChoices() throws RepositoryException {
        Map<String, String> expected = new LinkedHashMap<>();
        expected.put("homePage", "");
        expected.put("currentPage", "");
        expected.put("parentPage", "");
        expected.put("customRootPage", "bootstrap5mix:customRootPage");
        assertEquals(expected, choices(new NavbarRootInitializer()));
    }

    @Test
    void keysMatchTheNamesUsedInDefinitionsCnd() {
        assertEquals("gridTypeInitializer5", new GridTypeInitializer().getKey());
        assertEquals("buttonTypeInitializer5", new ButtonTypeInitializer().getKey());
        assertEquals("navbarRootInitializer5", new NavbarRootInitializer().getKey());
    }

    @Test
    void returnsNoChoicesWithoutContext() {
        List<ChoiceListValue> values = new GridTypeInitializer().getChoiceListValues(null, null, null, Locale.ENGLISH, null);
        assertTrue(values.isEmpty());
    }

    @Test
    void rendersValuesInBrackets() {
        assertEquals("[customGrid]", new GridTypeInitializer().getStringRendering(Locale.ENGLISH, null, "customGrid"));
    }
}
