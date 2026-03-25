package org.jahia.modules.bootstrap5.initializers;

import org.jahia.services.content.JCRPropertyWrapper;
import org.jahia.services.content.nodetypes.ExtendedPropertyDefinition;
import org.jahia.services.content.nodetypes.ValueImpl;
import org.jahia.services.content.nodetypes.initializers.ChoiceListValue;
import org.jahia.services.content.nodetypes.initializers.ModuleChoiceListInitializer;
import org.jahia.services.content.nodetypes.renderer.AbstractChoiceListRenderer;
import org.jahia.services.content.nodetypes.renderer.ModuleChoiceListRenderer;
import org.jahia.services.render.RenderContext;

import javax.jcr.PropertyType;
import javax.jcr.RepositoryException;
import javax.jcr.Value;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Common base for Jahia choice list initializers to avoid duplication.
 * Java 8 compatible (no records, no List.of/Map.of).
 */
public abstract class AbstractSimpleChoiceInitializer
        extends AbstractChoiceListRenderer
        implements ModuleChoiceListInitializer, ModuleChoiceListRenderer {

    protected static final String ADD_MIXIN = "addMixin";

    private String key;

    protected AbstractSimpleChoiceInitializer(String key) {
        this.key = key;
    }

    @Override
    public final List<ChoiceListValue> getChoiceListValues(ExtendedPropertyDefinition epd, String param,
                                                           List<ChoiceListValue> values,
                                                           Locale locale, Map<String, Object> context) {
        List<ChoiceListValue> list = new ArrayList<>();
        if (context == null) {
            return list;
        }
        List<ChoiceSpec> specs = getChoices();
        if (specs != null) {
            for (ChoiceSpec spec : specs) {
                list.add(toChoice(spec));
            }
        }
        return list;
    }

    /** Return the list of choices for this initializer. */
    protected abstract List<ChoiceSpec> getChoices();

    @Override
    public final void setKey(String key) {
        this.key = key;
    }

    @Override
    public final String getKey() {
        return key;
    }

    @Override
    public String getStringRendering(RenderContext context, JCRPropertyWrapper propertyWrapper) throws RepositoryException {
        final StringBuilder sb = new StringBuilder();
        if (propertyWrapper.isMultiple()) {
            sb.append('{');
            final Value[] values = propertyWrapper.getValues();
            for (Value value : values) {
                sb.append('[').append(value.getString()).append(']');
            }
            sb.append('}');
        } else {
            sb.append('[').append(propertyWrapper.getValue().getString()).append(']');
        }
        return sb.toString();
    }

    @Override
    public String getStringRendering(Locale locale, ExtendedPropertyDefinition propDef, Object propertyValue) {
        return "[" + propertyValue + "]";
    }

    protected static ChoiceListValue toChoice(ChoiceSpec spec) {
        final Map<String, Object> props =
                (spec.mixin == null || spec.mixin.isEmpty())
                        ? Collections.<String, Object>emptyMap()
                        : Collections.<String, Object>singletonMap(ADD_MIXIN, spec.mixin);
        return new ChoiceListValue(
                spec.name,
                props,
                new ValueImpl(spec.name, PropertyType.STRING, false)
        );
    }

    /** Immutable spec describing a choice: display/value name and optional mixin. */
    protected static final class ChoiceSpec {
        private final String name;
        private final String mixin;

        private ChoiceSpec(String name, String mixin) {
            this.name = name;
            this.mixin = mixin;
        }

        public static ChoiceSpec of(String name) {
            return new ChoiceSpec(name, null);
        }

        public static ChoiceSpec of(String name, String mixin) {
            return new ChoiceSpec(name, mixin);
        }
    }
}
