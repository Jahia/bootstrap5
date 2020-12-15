package org.jahia.modules.bootstrap5.taglibs;
import java.io.IOException;
import java.util.Locale;
import org.jahia.taglibs.AbstractJahiaTag;
import org.jahia.utils.LanguageCodeConverters;
import org.slf4j.Logger;
public class SwitchToLanguageTag extends AbstractJahiaTag {

    private static final transient Logger logger = org.slf4j.LoggerFactory.getLogger(SwitchToLanguageTag.class);

    private String languageCode;

    public String getLanguageCode() {
        return languageCode;
    }

    public void setLanguageCode(String languageCode) {
        this.languageCode = languageCode;
    }

    public int doStartTag() {
        try {
            final StringBuilder buff = new StringBuilder(300);

            final String currentLocale = getCurrentResource().getLocale().getLanguage();
            final Locale locale = LanguageCodeConverters.languageCodeToLocale(languageCode);
            final String displayLanguage = locale.getDisplayLanguage(locale);
            final String link = generateCurrentNodeLangSwitchLink(languageCode);
            buff.append("<a");
            if (currentLocale.equals(languageCode)) {
                buff.append(" class=\"dropdown-item current\"");
            } else {
                buff.append(" class=\"dropdown-item\"");
            }
            buff.append(" title=\"").append(displayLanguage).append("\" href=\"").append(link).append("\" role=\"menuitem\" lang=\"").append(languageCode).append("\">").append(languageCode.toUpperCase());
            buff.append("</a>");
            pageContext.getOut().print(buff.toString());
        } catch (IOException e) {
            logger.error("Error while getting language switch URL", e);
        }
        return SKIP_BODY;
    }
}
