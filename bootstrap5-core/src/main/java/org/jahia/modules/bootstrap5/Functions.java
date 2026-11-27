package org.jahia.modules.bootstrap5;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class Functions {

    private Functions() {
        // utility class
    }

    public static String replaceAll(String string, String pattern, String replacement) {
        return string.replaceAll(pattern, replacement);
    }

    /**
     * Check if a BCP 47 / IETF language tag indicates RTL.
     * Rules:
     *  - RTL if the tag explicitly specifies an RTL script (Arab/Hebr/Thaa/Nkoo/Tfng/Syrc/Samr/Mand/Adlm/Rohg).
     *  - OR if the base language is commonly RTL (ar, fa, he, etc.).
     *  - UNLESS the tag explicitly specifies Latn or Cyrl (treated as LTR override).
     *
     * Kept the original signature for drop-in compatibility.
     */
    public static boolean isRtlLanguage(String languageString) {
        if (languageString == null || languageString.isEmpty()) {
            return false;
        }

        // Explicit LTR override wins
        if (LTR_OVERRIDE.matcher(languageString).find()) {
            return false;
        }

        // Explicit RTL script => RTL
        if (RTL_SCRIPT.matcher(languageString).find()) {
            return true;
        }

        // Otherwise check base language (before '-' or '_')
        String base = baseLanguage(languageString);
        return RTL_LANGS.contains(base.toLowerCase(Locale.ROOT));
    }

    /**
     * Return a link target that is safe to put in an {@code href}, or {@code "#"} when it is not.
     * Relative URLs, fragments, query strings and protocol-relative URLs are kept as-is.
     * Absolute URLs are kept only for the http, https, mailto and tel schemes, so values such as
     * {@code javascript:} or {@code data:} set by an editor cannot run script when the link is followed.
     * The result still has to be HTML-escaped by the caller.
     */
    public static String safeUrl(String url) {
        if (url == null) {
            return "#";
        }
        String trimmed = url.trim();
        if (trimmed.isEmpty()) {
            return "#";
        }
        // Browsers ignore ASCII control characters and whitespace inside a scheme ("java\tscript:"),
        // so they are removed before the scheme is read.
        String compact = CONTROL_AND_SPACE.matcher(trimmed).replaceAll("");
        Matcher scheme = URL_SCHEME.matcher(compact);
        if (!scheme.find()) {
            return trimmed;
        }
        return SAFE_SCHEMES.contains(scheme.group(1).toLowerCase(Locale.ROOT)) ? trimmed : "#";
    }

    // ---------------- internals (small & maintainable) ----------------

    private static final Set<String> SAFE_SCHEMES = new HashSet<>(Arrays.asList(
            "http", "https", "mailto", "tel"
    ));

    // A scheme is only present when the ':' comes before any '/', '?' or '#'
    private static final Pattern URL_SCHEME = Pattern.compile("^([a-zA-Z][a-zA-Z0-9+.-]*):");

    private static final Pattern CONTROL_AND_SPACE = Pattern.compile("[\\x00-\\x20\\x7F]+");

    // Base languages usually written RTL
    private static final Set<String> RTL_LANGS = new HashSet<>(Arrays.asList(
            "ar","dv","he","iw","fa","nqo","ps","sd","ug","ur","yi"
    ));

    // Explicit RTL scripts (case-insensitive), matched with '-' or '_' separators
    private static final Pattern RTL_SCRIPT = Pattern.compile(
            "(?:^|[-_])(Arab|Hebr|Thaa|Nkoo|Syrc|Samr|Mand|Adlm|Rohg|Tfng)(?:$|[-_])",
            Pattern.CASE_INSENSITIVE
    );

    // Explicit LTR override
    private static final Pattern LTR_OVERRIDE = Pattern.compile(
            "(?:^|[-_])(Latn|Cyrl)(?:$|[-_])",
            Pattern.CASE_INSENSITIVE
    );

    private static String baseLanguage(String tag) {
        int dash = tag.indexOf('-');
        int underscore = tag.indexOf('_');
        int sep;
        if (dash == -1 && underscore == -1) {
            sep = -1;
        } else if (dash == -1) {
            sep = underscore;
        } else if (underscore == -1) {
            sep = dash;
        } else {
            sep = Math.min(dash, underscore);
        }
        return (sep > 0) ? tag.substring(0, sep) : tag;
    }
}
