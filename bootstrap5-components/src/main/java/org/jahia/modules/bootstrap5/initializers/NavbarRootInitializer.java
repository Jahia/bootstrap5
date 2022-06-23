package org.jahia.modules.bootstrap5.initializers;

/**
 * Created by pol on 21.02.17.
 */
import org.jahia.services.content.JCRPropertyWrapper;
import org.jahia.services.content.nodetypes.ExtendedPropertyDefinition;
import org.jahia.services.content.nodetypes.ValueImpl;
import org.jahia.services.content.nodetypes.initializers.ChoiceListValue;
import org.jahia.services.content.nodetypes.initializers.ModuleChoiceListInitializer;
import org.jahia.services.content.nodetypes.renderer.AbstractChoiceListRenderer;
import org.jahia.services.content.nodetypes.renderer.ModuleChoiceListRenderer;
import org.jahia.services.render.RenderContext;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.PropertyType;
import javax.jcr.RepositoryException;
import javax.jcr.Value;
import java.util.*;

@Component(name = "navbarRootInitializer5", service = ModuleChoiceListInitializer.class, immediate = true)
public class NavbarRootInitializer extends AbstractChoiceListRenderer implements ModuleChoiceListInitializer, ModuleChoiceListRenderer {

    private static final Logger logger = LoggerFactory.getLogger(NavbarRootInitializer.class);

    private String key = "navbarRootInitializer5";

    /**
     * {@inheritDoc}
     */
    public List<ChoiceListValue> getChoiceListValues(ExtendedPropertyDefinition epd, String param, List<ChoiceListValue> values,
                                                     Locale locale, Map<String, Object> context) {

        //Create the list of ChoiceListValue to return
        List<ChoiceListValue> myChoiceList = new ArrayList<ChoiceListValue>();

        if (context == null) {
            return myChoiceList;
        }

        HashMap<String, Object> myPropertiesMap = null;

        //homePage
        myPropertiesMap = new HashMap<String, Object>();
        myChoiceList.add(new ChoiceListValue("homePage",myPropertiesMap,new ValueImpl("homePage", PropertyType.STRING, false)));

        //currentPage
        myPropertiesMap = new HashMap<String, Object>();
        myChoiceList.add(new ChoiceListValue("currentPage",myPropertiesMap,new ValueImpl("currentPage", PropertyType.STRING, false)));

        //parentPage
        myPropertiesMap = new HashMap<String, Object>();
        myChoiceList.add(new ChoiceListValue("parentPage",myPropertiesMap,new ValueImpl("parentPage", PropertyType.STRING, false)));

        //customRootPage
        myPropertiesMap = new HashMap<String, Object>();
        myPropertiesMap.put("addMixin","bootstrap5mix:customRootPage");
        myChoiceList.add(new ChoiceListValue("customRootPage",myPropertiesMap,new ValueImpl("customRootPage", PropertyType.STRING, false)));

        //Return the list
        return myChoiceList;
    }

    /**
     * {@inheritDoc}
     */
    public void setKey(String key) {
        this.key = key;
    }

    /**
     * {@inheritDoc}
     */
    public String getKey() {
        return key;
    }

    /**
     * {@inheritDoc}
     */
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

    /**
     * {@inheritDoc}
     */
    public String getStringRendering(Locale locale, ExtendedPropertyDefinition propDef, Object propertyValue) throws RepositoryException {
        return "[" + propertyValue.toString() + "]";
    }
}

