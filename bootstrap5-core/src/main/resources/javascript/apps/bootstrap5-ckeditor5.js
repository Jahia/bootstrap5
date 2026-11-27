/*
 * MIT License — Copyright (c) 2024 Philippe Vollenweider <pvollenweider@jahia.com>
 *
 * CKEditor 5 configuration of the Bootstrap 5 rich text fields.
 *
 * With CKEditor 4 the fields load javascript/ckconfig.js (bootstrap5-components), which brings the
 * Bootstrap styles: lead paragraph, text and background colours, alerts, badges, tables.
 * CKEditor 5 (richtext-ckeditor5 module) does not read that file: it looks the field's
 * "ckeditor.customConfig" option up in the "ckeditor5-config" registry of the Jahia UI, and falls
 * back to the site's default configuration when it finds nothing. This script registers, under
 * that very option value, the "advanced" configuration of the module plus the same styles, so
 * that one field definition serves both editors.
 *
 * Loaded in the Jahia UI (declared in javascript/apps/package.json). It does nothing when the
 * CKEditor 5 module is not installed.
 */
(function () {
    'use strict';

    var registry = window.jahia && window.jahia.uiExtender && window.jahia.uiExtender.registry;
    if (!registry) {
        return;
    }

    /** Value of ckeditor.customConfig in the definitions (bootstrap5mix:text). */
    var CONFIG_PATH = '/modules/bootstrap5-components/javascript/ckconfig.js';

    var COLORS = ['Primary', 'Secondary', 'Success', 'Info', 'Warning', 'Danger', 'Light', 'Dark'];

    function styleDefinitions() {
        var definitions = [
            {name: 'Lead', element: 'p', classes: ['lead']},
            {name: 'Highlighted Text', element: 'mark', classes: ['mark']},
            {name: 'Blockquote', element: 'blockquote', classes: ['blockquote']},
            {name: 'Underlined Text', element: 'span', classes: ['text-decoration-underline']},
            {name: 'Inline Code', element: 'code', classes: ['inline-code']}
        ];
        COLORS.forEach(function (color) {
            definitions.push({name: 'Text ' + color, element: 'span', classes: ['text-' + color.toLowerCase()]});
        });
        COLORS.forEach(function (color) {
            definitions.push({name: 'Background ' + color, element: 'span', classes: ['bg-' + color.toLowerCase()]});
        });
        COLORS.forEach(function (color) {
            definitions.push({name: color + ' Alert', element: 'p', classes: ['alert', 'alert-' + color.toLowerCase()]});
        });
        COLORS.forEach(function (color) {
            // text-bg-* picks a text colour that contrasts with the background
            definitions.push({name: color + ' Badge', element: 'span', classes: ['badge', 'text-bg-' + color.toLowerCase()]});
        });
        definitions.push(
            {name: 'Table', element: 'table', classes: ['table']},
            {name: 'Striped Table', element: 'table', classes: ['table', 'table-striped']},
            {name: 'Bordered Table', element: 'table', classes: ['table', 'table-bordered']},
            {name: 'Hover Table', element: 'table', classes: ['table', 'table-hover']},
            {name: 'Compact Table', element: 'table', classes: ['table', 'table-sm']}
        );
        return definitions;
    }

    /**
     * Editor plugin: every table gets the "table" class, without which Bootstrap does not style it.
     * The class is held by the attribute the General HTML Support feature keeps for <table>
     * elements, so the other table classes (set with the style list) are kept.
     */
    function BootstrapTableClass(editor) {
        editor.model.document.registerPostFixer(function (writer) {
            var changed = false;
            var range = writer.createRangeIn(editor.model.document.getRoot());
            var item;
            var items = range.getItems();
            while (!(item = items.next()).done) {
                var element = item.value;
                if (element.is('element', 'table')) {
                    var attributes = element.getAttribute('htmlTableAttributes') || {};
                    var classes = attributes.classes || [];
                    if (classes.indexOf('table') === -1) {
                        var updated = {};
                        Object.keys(attributes).forEach(function (key) {
                            updated[key] = attributes[key];
                        });
                        updated.classes = ['table'].concat(classes);
                        writer.setAttribute('htmlTableAttributes', updated, element);
                        changed = true;
                    }
                }
            }
            return changed;
        });
    }

    /** @returns {boolean} false when the configurations of the CKEditor 5 module are not there (yet) */
    function register() {
        var base = registry.get('ckeditor5-config', 'advanced');
        if (!base) {
            return false;
        }

        var config = {};
        Object.keys(base).forEach(function (key) {
            if (key !== 'key' && key !== 'type') {
                config[key] = base[key];
            }
        });
        config.style = {definitions: styleDefinitions()};
        config.extraPlugins = (base.extraPlugins || []).concat([BootstrapTableClass]);

        var contextPath = (window.contextJsParameters && window.contextJsParameters.contextPath) || '';
        // The option as written in the definitions, and as resolved for the current context path
        ['$context' + CONFIG_PATH, contextPath + CONFIG_PATH].forEach(function (key, index, keys) {
            if (keys.indexOf(key) === index) {
                registry.addOrReplace('ckeditor5-config', key, config);
            }
        });
        return true;
    }

    /**
     * The CKEditor 5 module registers its configurations asynchronously during the start of the
     * Jahia UI: wait for them, and give up quietly when the module is not installed.
     */
    function registerWhenReady(attemptsLeft) {
        if (register() || attemptsLeft <= 0) {
            return;
        }
        window.setTimeout(function () {
            registerWhenReady(attemptsLeft - 1);
        }, 250);
    }

    // After the CKEditor 5 module registered its own configurations (jahiaApp-init:99)
    registry.add('callback', 'bootstrap5-ckeditor5', {
        targets: ['jahiaApp-init:100'],
        callback: function () {
            registerWhenReady(120);
        }
    });
})();
