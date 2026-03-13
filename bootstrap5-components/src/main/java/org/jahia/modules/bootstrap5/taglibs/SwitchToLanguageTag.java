package org.jahia.modules.bootstrap5.taglibs;

import java.io.IOException;
import java.util.Locale;

import javax.servlet.jsp.tagext.Tag;

import org.jahia.taglibs.AbstractJahiaTag;
import org.jahia.utils.LanguageCodeConverters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * JSP tag that renders a language switch link for the current node.
 */
public class SwitchToLanguageTag extends AbstractJahiaTag {

    private static final Logger logger = LoggerFactory.getLogger(SwitchToLanguageTag.class);

    @Override
    public int doStartTag() {
        try {
            final StringBuilder buff = new StringBuilder(300);

            final String currentLocale = getCurrentResource().getLocale().getLanguage();

            // Use inherited property from AbstractJahiaTag
            final String code = getLanguageCode();

            final Locale locale = LanguageCodeConverters.languageCodeToLocale(code);
            final String displayLanguage = locale.getDisplayLanguage(locale);
            final String link = generateCurrentNodeLangSwitchLink(code);

            buff.append("<a")
                    .append(currentLocale.equals(code) ? " class=\"dropdown-item current\"" : " class=\"dropdown-item\"")
                    .append(" title=\"").append(displayLanguage).append("\"")
                    .append(" href=\"").append(link).append("\"")
                    .append(" role=\"menuitem\"")
                    .append(" lang=\"").append(code).append("\">")
                    .append(displayLanguage)
                    .append("</a>");

            pageContext.getOut().print(buff.toString());
        } catch (IOException e) {
            logger.error("Error while getting language switch URL", e);
        }
        return Tag.SKIP_BODY;
    }
}
