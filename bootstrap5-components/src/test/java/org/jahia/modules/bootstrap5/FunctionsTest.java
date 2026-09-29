package org.jahia.modules.bootstrap5;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FunctionsTest {

    @Nested
    class SafeUrl {

        @ParameterizedTest
        @ValueSource(strings = {
                "https://www.jahia.com",
                "http://www.jahia.com/path?q=1#top",
                "HTTPS://WWW.JAHIA.COM",
                "mailto:someone@example.com",
                "tel:+41220000000",
                "/sites/mysite/home.html",
                "page.html",
                "../other.html",
                "#section",
                "?page=2",
                "//cdn.example.com/lib.js",
                "http://"
        })
        void keepsRelativeAndAllowedSchemes(String url) {
            assertEquals(url, Functions.safeUrl(url));
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "javascript:alert(1)",
                "JavaScript:alert(1)",
                "JAVASCRIPT:alert(1)",
                "  javascript:alert(1)",
                "java\tscript:alert(1)",
                "java\nscript:alert(1)",
                "java\rscript:alert(1)",
                "\u0001javascript:alert(1)",
                "javascript\u0000:alert(1)",
                "vbscript:msgbox(1)",
                "data:text/html,<script>alert(1)</script>",
                "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
                "file:///etc/passwd",
                "ftp://example.com/file"
        })
        void replacesActiveOrUnexpectedSchemesWithHash(String url) {
            assertEquals("#", Functions.safeUrl(url));
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"   ", "\t\n"})
        void returnsHashForMissingValues(String url) {
            assertEquals("#", Functions.safeUrl(url));
        }

        @Test
        void trimsSurroundingWhitespace() {
            assertEquals("https://www.jahia.com", Functions.safeUrl("  https://www.jahia.com \n"));
        }

        @Test
        void treatsHtmlEncodedColonAsRelative() {
            // Not a scheme for the URL parser: once HTML-escaped in the href, it resolves as a relative path
            assertEquals("javascript&#58;alert(1)", Functions.safeUrl("javascript&#58;alert(1)"));
        }

        @Test
        void colonAfterPathIsNotAScheme() {
            assertEquals("/path/to:page", Functions.safeUrl("/path/to:page"));
            assertEquals("?next=javascript:alert(1)", Functions.safeUrl("?next=javascript:alert(1)"));
        }
    }

    @Nested
    class IsRtlLanguage {

        @ParameterizedTest
        @ValueSource(strings = {"ar", "he", "iw", "fa", "ur", "yi", "ar-EG", "fa_IR", "he-IL", "az-Arab", "pa-Arab-PK"})
        void rtlLanguagesAndScripts(String tag) {
            assertTrue(Functions.isRtlLanguage(tag));
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"en", "fr", "de-CH", "zh_TW", "az", "ku-Latn", "ar-Latn", "uz-Cyrl"})
        void ltrLanguagesAndOverrides(String tag) {
            assertFalse(Functions.isRtlLanguage(tag));
        }

        @Test
        void isCaseInsensitive() {
            assertTrue(Functions.isRtlLanguage("AR"));
            assertTrue(Functions.isRtlLanguage("ks-arab"));
        }
    }

    @Test
    void replaceAllUsesRegex() {
        assertEquals("tab-one-two", Functions.replaceAll("tab one/two", "[^A-Za-z0-9_]", "-"));
    }
}
