var contextParams = (typeof contextJsParameters !== 'undefined') ? contextJsParameters : {};

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
        { name: 'Highlighted Text', element: 'span', attributes: { class: 'text-primary' } },
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
        { name: 'Success Alert', element: 'div', attributes: { class: 'alert alert-success' } },
        { name: 'Info Alert', element: 'div', attributes: { class: 'alert alert-info' } },
        { name: 'Warning Alert', element: 'div', attributes: { class: 'alert alert-warning' } },
        { name: 'Danger Alert', element: 'div', attributes: { class: 'alert alert-danger' } },

        // Badge styles
        { name: 'Primary Badge', element: 'span', attributes: { class: 'badge bg-primary' } },
        { name: 'Secondary Badge', element: 'span', attributes: { class: 'badge bg-secondary' } },
        { name: 'Success Badge', element: 'span', attributes: { class: 'badge bg-success' } },
        { name: 'Info Badge', element: 'span', attributes: { class: 'badge bg-info' } },
        { name: 'Warning Badge', element: 'span', attributes: { class: 'badge bg-warning' } },
        { name: 'Danger Badge', element: 'span', attributes: { class: 'badge bg-danger' } },
        { name: 'Light Badge', element: 'span', attributes: { class: 'badge bg-light text-dark' } },
        { name: 'Dark Badge', element: 'span', attributes: { class: 'badge bg-dark' } }
    ];

    config.toolbar = 'Tinny';
    config.toolbar_Tinny = [
        { name: 'misc', items: ['Source', '-', 'Templates', 'PasteText', 'wsc', 'Scayt', 'ACheck', 'SpellChecker', 'Styles'] },
        { name: 'basicstyles', items: ['Bold', 'Italic','RemoveFormat'] },
        { name: 'paragraph', items: ['NumberedList', 'BulletedList','Outdent', 'Indent'] },
        { name: 'inserts', items: ['Link', 'Unlink','Anchor', 'Image','HorizontalRule'] },
        { name: 'tools', items: ['Maximize'] },
    ];

    config.extraPlugins = 'justify';
    config.allowedContent = true;
    config.autoParagraph = false;
    config.contentsCss = [`${contextPath}/modules/bootstrap5-core/css/bootstrap.min.css`];
    config.templates_files = [`${contextPath}/modules/bootstrap5-components/javascript/cktemplates.js`];

    CKEDITOR.on('instanceReady', (event) => {
        const editor = event.editor;
        editor.ui.get('combo_inlinestyles').setLabel('Inline styles');
    });

    CKEDITOR.addCss('.cke_combopanel { width:300px !important; }');
};

