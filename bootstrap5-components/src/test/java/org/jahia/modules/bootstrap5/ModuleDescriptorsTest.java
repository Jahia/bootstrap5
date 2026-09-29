package org.jahia.modules.bootstrap5;

import org.jahia.modules.bootstrap5.initializers.ButtonTypeInitializer;
import org.jahia.modules.bootstrap5.initializers.GridTypeInitializer;
import org.jahia.modules.bootstrap5.initializers.NavbarRootInitializer;
import org.jahia.services.content.nodetypes.initializers.ChoiceListValue;
import org.jahia.services.content.nodetypes.initializers.ModuleChoiceListInitializer;
import org.junit.jupiter.api.Test;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.IOException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

/**
 * Checks that the module descriptors (CND, TLD) stay consistent with the Java code they reference.
 * These links are only resolved by Jahia at runtime, so a rename on either side would otherwise
 * go unnoticed until the module is deployed.
 */
class ModuleDescriptorsTest {

    private static final Path RESOURCES = Paths.get("src", "main", "resources", "META-INF");

    private static final List<ModuleChoiceListInitializer> INITIALIZERS = Arrays.asList(
            new GridTypeInitializer(), new ButtonTypeInitializer(), new NavbarRootInitializer());

    private static String read(String file) throws IOException {
        return new String(Files.readAllBytes(RESOURCES.resolve(file)), StandardCharsets.UTF_8);
    }

    private static Set<String> definedTypes(String cnd) {
        Set<String> types = new HashSet<>();
        Matcher m = Pattern.compile("(?m)^\\[([a-zA-Z0-9]+:[a-zA-Z0-9_]+)\\]").matcher(cnd);
        while (m.find()) {
            types.add(m.group(1));
        }
        return types;
    }

    @Test
    void everyCndChoicelistInitializerExists() throws IOException {
        Set<String> keys = new HashSet<>();
        for (ModuleChoiceListInitializer initializer : INITIALIZERS) {
            keys.add(initializer.getKey());
        }
        Matcher m = Pattern.compile("choicelist\\[([a-zA-Z0-9]+Initializer[a-zA-Z0-9]*)").matcher(read("definitions.cnd"));
        Set<String> referenced = new TreeSet<>();
        while (m.find()) {
            referenced.add(m.group(1));
        }
        assertFalse(referenced.isEmpty(), "no initializer referenced from definitions.cnd");
        assertEquals(keys, referenced, "initializers referenced by definitions.cnd vs initializers in the module");
    }

    @Test
    void everyMixinAddedByAnInitializerIsDefined() throws IOException {
        Set<String> defined = definedTypes(read("definitions.cnd"));
        for (ModuleChoiceListInitializer initializer : INITIALIZERS) {
            for (ChoiceListValue value : initializer.getChoiceListValues(null, null, null, Locale.ENGLISH,
                    Collections.singletonMap("contextNode", "any"))) {
                Object mixin = value.getProperties().get("addMixin");
                if (mixin != null) {
                    assertTrue(defined.contains(mixin),
                            initializer.getKey() + " adds " + mixin + ", which definitions.cnd does not define");
                }
            }
        }
    }

    @Test
    void everyTldFunctionMapsToAPublicStaticMethod() throws Exception {
        Element root = DocumentBuilderFactory.newInstance().newDocumentBuilder()
                .parse(RESOURCES.resolve("bootstrap5-components.tld").toFile()).getDocumentElement();
        NodeList functions = root.getElementsByTagName("function");
        assertTrue(functions.getLength() > 0, "no function declared in the TLD");
        Pattern signature = Pattern.compile("^\\s*(\\S+)\\s+(\\w+)\\s*\\(([^)]*)\\)\\s*$");
        for (int i = 0; i < functions.getLength(); i++) {
            Element function = (Element) functions.item(i);
            String name = text(function, "name");
            Class<?> type = Class.forName(text(function, "function-class"));
            Matcher m = signature.matcher(text(function, "function-signature"));
            if (!m.matches()) {
                fail("unreadable signature for TLD function " + name);
            }
            String[] params = m.group(3).trim().isEmpty() ? new String[0] : m.group(3).split(",");
            Class<?>[] paramTypes = new Class<?>[params.length];
            for (int p = 0; p < params.length; p++) {
                paramTypes[p] = toClass(params[p].trim());
            }
            Method method = type.getMethod(m.group(2), paramTypes);
            assertTrue(Modifier.isStatic(method.getModifiers()), name + " must be static");
            assertEquals(toClass(m.group(1)), method.getReturnType(), name + " return type");
        }
    }

    @Test
    void everyTldTagClassExists() throws Exception {
        Element root = DocumentBuilderFactory.newInstance().newDocumentBuilder()
                .parse(RESOURCES.resolve("bootstrap5-components.tld").toFile()).getDocumentElement();
        NodeList tags = root.getElementsByTagName("tag");
        for (int i = 0; i < tags.getLength(); i++) {
            Class.forName(text((Element) tags.item(i), "tag-class"));
        }
    }

    private static String text(Element parent, String tag) {
        return parent.getElementsByTagName(tag).item(0).getTextContent().trim();
    }

    private static Class<?> toClass(String name) throws ClassNotFoundException {
        switch (name) {
            case "boolean": return boolean.class;
            case "int": return int.class;
            case "long": return long.class;
            case "void": return void.class;
            default: return Class.forName(name);
        }
    }
}
