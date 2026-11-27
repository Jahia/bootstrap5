var contextParams = (typeof contextJsParameters === 'undefined') ? {} : contextJsParameters;

function getContentPickerUrl(type = '', params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return `${contextParams.contextPath}/engines/contentpicker.jsp?type=${type}&${queryParams}`;
}

CKEDITOR.editorConfig = (config) => {
    const { contextPath, lang, siteUuid } = contextParams;

    config.contextPath = contextPath || '';
    config.contentlanguage = lang || 'en';
    config.siteUuid = siteUuid || '';

    config.filebrowserWindowFeatures = 'location=no,menubar=no,toolbar=no,dependent=yes,minimizable=no,modal=yes,alwaysRaised=yes,resizable=yes,scrollbars=yes';
    config.filebrowserWindowName = 'JahiaFileBrowser';
    config.filebrowserBrowseUrl = getContentPickerUrl('', { site: config.siteUuid, lang: config.contentlanguage });
    config.filebrowserImageBrowseUrl = getContentPickerUrl('imagepicker', { site: config.siteUuid, lang: config.contentlanguage });
    config.filebrowserFlashBrowseUrl = getContentPickerUrl('application%2Fx-shockwave-flash%2Cvideo%2Fx-flv', { site: config.siteUuid, lang: config.contentlanguage });
    config.filebrowserLinkBrowseUrl = getContentPickerUrl('editoriallinkpicker', { site: config.siteUuid, lang: config.contentlanguage });

    config.image_previewText = '';

    config.stylesSet = [
        // Heading styles
        { name: 'Heading 1', element: 'h1' },
        { name: 'Heading 2', element: 'h2' },
        { name: 'Heading 3', element: 'h3' },
        { name: 'Heading 4', element: 'h4' },
        { name: 'Heading 5', element: 'h5' },
        { name: 'Heading 6', element: 'h6' },

        // Text styles
        { name: 'Lead', element: 'p', attributes: { class: 'lead' } },
        { name: 'Highlighted Text', element: 'mark' },
        { name: 'Deleted Text', element: 'del' },
        { name: 'Underlined Text', element: 'span', attributes: { class: 'text-decoration-underline' } },
        { name: 'Bold Text', element: 'strong' },
        { name: 'Italicized Text', element: 'em' },
        { name: 'Blockquotes', element: 'blockquote', attributes: { class: 'blockquote' } },
        { name: 'Code', element: 'code' },
        { name: 'Inline Code', element: 'code', attributes: { class: 'inline-code' } },
        { name: 'Inline Quote', element: 'q' },

        // Text color styles
        { name: 'Text Primary', element: 'span', attributes: { class: 'text-primary' } },
        { name: 'Text Secondary', element: 'span', attributes: { class: 'text-secondary' } },
        { name: 'Text Success', element: 'span', attributes: { class: 'text-success' } },
        { name: 'Text Info', element: 'span', attributes: { class: 'text-info' } },
        { name: 'Text Warning', element: 'span', attributes: { class: 'text-warning' } },
        { name: 'Text Danger', element: 'span', attributes: { class: 'text-danger' } },
        { name: 'Text Light', element: 'span', attributes: { class: 'text-light' } },
        { name: 'Text Dark', element: 'span', attributes: { class: 'text-dark' } },

        // Background color styles
        { name: 'Background Primary', element: 'span', attributes: { class: 'bg-primary' } },
        { name: 'Background Secondary', element: 'span', attributes: { class: 'bg-secondary' } },
        { name: 'Background Success', element: 'span', attributes: { class: 'bg-success' } },
        { name: 'Background Info', element: 'span', attributes: { class: 'bg-info' } },
        { name: 'Background Warning', element: 'span', attributes: { class: 'bg-warning' } },
        { name: 'Background Danger', element: 'span', attributes: { class: 'bg-danger' } },
        { name: 'Background Light', element: 'span', attributes: { class: 'bg-light' } },
        { name: 'Background Dark', element: 'span', attributes: { class: 'bg-dark' } },

        // Alert styles
        { name: 'Primary Alert', element: 'div', attributes: { class: 'alert alert-primary' } },
        { name: 'Secondary Alert', element: 'div', attributes: { class: 'alert alert-secondary' } },
        { name: 'Success Alert', element: 'div', attributes: { class: 'alert alert-success' } },
        { name: 'Info Alert', element: 'div', attributes: { class: 'alert alert-info' } },
        { name: 'Warning Alert', element: 'div', attributes: { class: 'alert alert-warning' } },
        { name: 'Danger Alert', element: 'div', attributes: { class: 'alert alert-danger' } },
        { name: 'Light Alert', element: 'div', attributes: { class: 'alert alert-light' } },
        { name: 'Dark Alert', element: 'div', attributes: { class: 'alert alert-dark' } },

        // Badge styles
        { name: 'Primary Badge', element: 'span', attributes: { class: 'badge text-bg-primary' } },
        { name: 'Secondary Badge', element: 'span', attributes: { class: 'badge text-bg-secondary' } },
        { name: 'Success Badge', element: 'span', attributes: { class: 'badge text-bg-success' } },
        { name: 'Info Badge', element: 'span', attributes: { class: 'badge text-bg-info' } },
        { name: 'Warning Badge', element: 'span', attributes: { class: 'badge text-bg-warning' } },
        { name: 'Danger Badge', element: 'span', attributes: { class: 'badge text-bg-danger' } },
        { name: 'Light Badge', element: 'span', attributes: { class: 'badge text-bg-light' } },
        { name: 'Dark Badge', element: 'span', attributes: { class: 'badge text-bg-dark' } },

        // Table styles (apply them to a table inserted with the table tools)
        { name: 'Table', element: 'table', attributes: { class: 'table' } },
        { name: 'Striped Table', element: 'table', attributes: { class: 'table table-striped' } },
        { name: 'Bordered Table', element: 'table', attributes: { class: 'table table-bordered' } },
        { name: 'Hover Table', element: 'table', attributes: { class: 'table table-hover' } },
        { name: 'Compact Table', element: 'table', attributes: { class: 'table table-sm' } }
    ];

    config.toolbar = 'Tinny';
    config.toolbar_Tinny = [
        { name: 'misc', items: ['Source', '-', 'Templates', 'PasteText', 'wsc', 'Scayt', 'ACheck', 'Styles'] },
        { name: 'basicstyles', items: ['Bold', 'Italic'] },
        { name: 'paragraph', items: ['NumberedList', 'BulletedList','Outdent', 'Indent'] },
        { name: 'alignment', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
        { name: 'inserts', items: ['Link', 'Unlink','Anchor', 'Image','Table','HorizontalRule'] },
        { name: 'tools', items: ['Maximize','RemoveFormat','Wash'] },
    ];

    config.extraPlugins = 'justify,pastefromgdocs,pastetools,clipboard,tidy,pastefromgdocs,scayt';
    config.allowedContent = true;
    config.autoParagraph = false;
    config.scayt_autoStartup = true;
    config.contentsCss = [`${contextPath}/modules/bootstrap5-core/css/bootstrap.min.css`];
    config.templates_files = [`${contextPath}/modules/bootstrap5-components/javascript/cktemplates.js`];

    CKEDITOR.on('instanceReady', (event) => {
        const editor = event.editor;
        const combo = editor.ui.get('combo_inlinestyles');

        if (combo) {
            combo.setLabel('Inline styles');
        }

        // Tables: Bootstrap only styles a table that carries the "table" class. Every table of an
        // editor using this configuration gets it, when the content is loaded (so the editor shows
        // the table as the page will) and when it is saved. The other table classes (striped,
        // bordered...) come from the Styles list and are kept.
        const fromThisModule = (value) => String(value || '').includes('/bootstrap5-components/');
        const usesThisConfig = fromThisModule(editor.config.customConfig)
            || [editor.config.templates_files || []].flat().some(fromThisModule);
        if (usesThisConfig && editor.dataProcessor && !editor.bootstrap5TableRules) {
            editor.bootstrap5TableRules = true;
            const addTableClass = (element) => {
                const classes = (element.attributes['class'] || '').split(/\s+/).filter(Boolean);
                if (!classes.includes('table')) {
                    classes.unshift('table');
                    element.attributes['class'] = classes.join(' ');
                }
            };
            editor.dataProcessor.htmlFilter.addRules({ elements: { table: addTableClass } });
            editor.dataProcessor.dataFilter.addRules({ elements: { table: addTableClass } });
        }
    });

    CKEDITOR.addCss('.cke_combopanel { width:300px !important; }');
};

function loadScript(url, callback) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;

    script.onload = function () {
        setTimeout(callback, 200); // Add some delay
    };

    script.onerror = function () {
        console.error(`❌ Error loading script  : ${url}`);
    };

    document.getElementsByTagName("head")[0].appendChild(script);
}

function loadDependencies(callback) {
    const basePath = contextParams.contextPath || '';
    loadScript(`${basePath}/modules/bootstrap5-components/javascript/beautify-html.min.js`, function () {
        loadScript(`${basePath}/modules/bootstrap5-components/javascript/purify.min.js`, function () {
            setTimeout(function () {
                if (typeof globalThis.html_beautify === 'function' && typeof globalThis.DOMPurify === 'function') {
                    callback();
                } else {
                    console.error("❌ Could not get lib");
                }
            }, 500);
        });
    });
}

CKEDITOR.plugins.add('tidy', {
    icons: 'tidy',
    init: function (editor) {
        editor.ui.addButton('Wash', {
            label: 'Wash HTML',
            command: 'cleanHTML',
            toolbar: 'cleanup',
            icon: `${contextParams.contextPath}/modules/bootstrap5-components/img/wash.png`
        });
        editor.addCommand('cleanHTML', {
            exec: function (editor) {
                const userConfirmed = globalThis.confirm("Do you want to clean up the current HTML content?");
                if (!userConfirmed) {
                    return;
                }
                const runCleanup = () => executeCleanup(editor);

                if (typeof globalThis.html_beautify !== 'function' || typeof globalThis.DOMPurify !== 'function') {
                    loadDependencies(runCleanup);
                } else {
                    runCleanup();
                }
            }
        });
    }
});

function executeCleanup(editor) {
    const dirtyHtml = editor.getData();
    const cleanHtml = tidyHTML(dirtyHtml);
    editor.setData(cleanHtml);
}

function tidyHTML(html) {
    const sanitize = (markup) => globalThis.DOMPurify.sanitize(markup, {
        ALLOWED_TAGS: ['a', 'b', 'i', 'strong', 'em', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'br', 'div', 'span', 'img', 'blockquote','table'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'width', 'height'],
        FORBID_ATTR: ['style','class','lang','dir','id','name'],
        USE_PROFILES: { html: true }
    });

    // First pass: strips the attributes, so that a <span style="..."> becomes a bare <span>
    let cleanHtml = sanitize(html);

    // remove <span> w/o attribut
    while (/(\s*)<span>([\s\S]*?)<\/span>(\s*)/.test(cleanHtml)) {
        cleanHtml = cleanHtml.replaceAll(/<span>([\s\S]*?)<\/span>/g, '$1');
    }

    // DOMPurify is the last transformation of the markup before the beautifier
    cleanHtml = sanitize(cleanHtml);

    cleanHtml = html_beautify(cleanHtml, {
        indent_size: 2,
        wrap_line_length: 80,
        preserve_newlines: true
    });
    return cleanHtml;
}
