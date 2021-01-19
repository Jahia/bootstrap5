CKEDITOR.stylesSet.add('text', [
    {name: 'Heading 1', element: 'h1'},
    {name: 'Heading 2', element: 'h2'},
    {name: 'Heading 3', element: 'h3'},
    {name: 'Heading 4', element: 'h4'},
    {name: 'Heading 5', element: 'h5'},
    {name: 'Heading 6', element: 'h6'},

    {name: 'Lead', element: 'p', attributes: {class: 'lead'}},
    {name: 'Highlight text', element: 'marl'},
    {name: 'Deleted text', element: 'del'},
    {name: 'No longer accurate', element: 's'},
    {name: 'Addition to the document', element: 'ins'},
    {name: 'Underlined', element: 'u'},
    {name: 'Fine print', element: 'small'},
    {name: 'Bold text', element: 'strong'},
    {name: 'Italicized text', element: 'em'},
    {name: 'Inline Code', element: 'code'},
    {name: 'Code blocks', element: 'pre'},
    {name: 'Blockquotes', element: 'blockquote', attributes: {class: 'blockquote'}},
    {name: 'Variables', element: 'var'},
    {name: 'User input', element: 'kbd'},
    {name: 'Sample output', element: 'samp'},

    {name: 'Text Primary', element: 'p', attributes: {class: 'text-primary'}},
    {name: 'Text Secondary', element: 'p', attributes: {class: 'text-secondary'}},
    {name: 'Text Success', element: 'p', attributes: {class: 'text-success'}},
    {name: 'Text Info', element: 'p', attributes: {class: 'text-info'}},
    {name: 'Text Warning', element: 'p', attributes: {class: 'text-warning'}},
    {name: 'Text Danger', element: 'p', attributes: {class: 'text-danger'}},
    {name: 'Text Light', element: 'p', attributes: {class: 'text-light'}},
    {name: 'Text Dark', element: 'p', attributes: {class: 'text-dark'}},

    {name: 'Background Primary', element: 'div', attributes: {class: 'p-3 mb-2 bg-primary text-white'}},
    {name: 'Background Secondary', element: 'div', attributes: {class: 'p-3 mb-2 bg-secondary text-white'}},
    {name: 'Background Success', element: 'div', attributes: {class: 'p-3 mb-2 bg-success text-white'}},
    {name: 'Background Info', element: 'div', attributes: {class: 'p-3 mb-2 bg-info text-white'}},
    {name: 'Background Warning', element: 'div', attributes: {class: 'p-3 mb-2 bg-warning text-white'}},
    {name: 'Background Danger', element: 'div', attributes: {class: 'p-3 mb-2 bg-danger text-whiter'}},
    {name: 'Background Light', element: 'div', attributes: {class: 'p-3 mb-2 bg-light text-white'}},
    {name: 'Background White', element: 'div', attributes: {class: 'p-3 mb-2 bg-white text-gray-dark'}},
    {name: 'Background Dark', element: 'div', attributes: {class: 'p-3 mb-2 bg-dark text-white'}},

    {name: 'Alert Primyay', element: 'div', attributes: {class: 'alert alert-primary', role: 'alert'}},
    {name: 'Alert Secondary', element: 'div', attributes: {class: 'alert alert-secondary', role: 'alert'}},
    {name: 'Alert Success', element: 'div', attributes: {class: 'alert alert-success', role: 'alert'}},
    {name: 'Alert Information', element: 'div', attributes: {class: 'alert alert-info', role: 'alert'}},
    {name: 'Alert Warning', element: 'div', attributes: {class: 'alert alert-warning', role: 'alert'}},
    {name: 'Alert Danger', element: 'div', attributes: {class: 'alert alert-danger', role: 'alert'}},
    {name: 'Alert Light', element: 'div', attributes: {class: 'alert alert-light', role: 'alert'}},
    {name: 'Alert Dark', element: 'div', attributes: {class: 'alert alert-dark', role: 'alert'}},

    {name: 'Badge Primary', element: 'span', attributes: {class: 'badge badge-primary'}},
    {name: 'Badge Secondary', element: 'span', attributes: {class: 'badge badge-secondary'}},
    {name: 'Badge Success', element: 'span', attributes: {class: 'badge badge-success'}},
    {name: 'Badge Info', element: 'span', attributes: {class: 'badge badge-info'}},
    {name: 'Badge Warning', element: 'span', attributes: {class: 'badge badge-warning'}},
    {name: 'Badge Danger', element: 'span', attributes: {class: 'badge badge-danger'}},
    {name: 'Badge Light', element: 'span', attributes: {class: 'badge badge-light'}},
    {name: 'Badge Dark', element: 'span', attributes: {class: 'badge badge-dark'}},

    {name: 'Pill Primary', element: 'span', attributes: {class: 'badge badge-pill badge-primary'}},
    {name: 'Pill Secondary', element: 'span', attributes: {class: 'badge badge-pill badge-secondary'}},
    {name: 'Pill Success', element: 'span', attributes: {class: 'badge badge-pill badge-success'}},
    {name: 'Pill Info', element: 'span', attributes: {class: 'badge badge-pill badge-info'}},
    {name: 'Pill Warning', element: 'span', attributes: {class: 'badge badge-pill badge-warning'}},
    {name: 'Pill Danger', element: 'span', attributes: {class: 'badge badge-pill badge-danger'}},
    {name: 'Pill Light', element: 'span', attributes: {class: 'badge badge-pill badge-light'}},
    {name: 'Pill Dark', element: 'span', attributes: {class: 'badge badge-pill badge-dark'}},

    {name: 'Pre', element: 'pre', attributes: {class: 'prettyprint linenums'}}
]);

CKEDITOR.editorConfig = function (config) {
    config.allowedContent = true;

    config.contextPath = (typeof contextJsParameters != 'undefined') ? contextJsParameters.contextPath : '';
    config.language = (typeof contextJsParameters != 'undefined') ? contextJsParameters.uilang : 'en';
    config.contentlanguage = (typeof contextJsParameters != 'undefined') ? contextJsParameters.lang : 'en';
    config.siteUuid = (typeof contextJsParameters != 'undefined') ? contextJsParameters.siteUuid : '';

    config.filebrowserWindowFeatures = 'location=no,menubar=no,toolbar=no,dependent=yes,minimizable=no,modal=yes,alwaysRaised=yes,resizable=yes,scrollbars=yes';
    config.filebrowserWindowName = 'JahiaFileBrowser';
    config.filebrowserBrowseUrl = config.contextPath + '/engines/contentpicker.jsp?site=' + config.siteUuid + '&lang=' + config.contentlanguage + '&uilang=' + config.language;
    config.filebrowserImageBrowseUrl = config.contextPath + '/engines/contentpicker.jsp?type=imagepicker&site=' + config.siteUuid + '&lang=' + config.contentlanguage + '&uilang=' + config.language;
    config.filebrowserFlashBrowseUrl = config.contextPath + '/engines/contentpicker.jsp?mime=application%2Fx-shockwave-flash%2Cvideo%2Fx-flv&site=' + config.siteUuid + '&lang=' + config.contentlanguage + '&uilang=' + config.language;
    config.filebrowserLinkBrowseUrl = config.contextPath + '/engines/contentpicker.jsp?type=editoriallinkpicker&site=' + config.siteUuid + '&lang=' + config.contentlanguage + '&uilang=' + config.language;
    config.image_previewText = '';

    config.toolbar = 'Tinny';
    config.stylesSet = 'text';
    config.contentsCss = [ ((typeof contextJsParameters != 'undefined') ? contextJsParameters.contextPath : '') + '/modules/bootstrap5-core/css/bootstrap.min.css' ];
    config.templates_files = [ ((typeof contextJsParameters != 'undefined') ? contextJsParameters.contextPath : '') + '/modules/bootstrap5-components/javascript/cktemplates.js' ];


    config.toolbar_Tinny = [
        ['Source', '-', 'Templates', 'PasteText', 'wsc','Scayt', 'ACheck', 'SpellChecker','Styles'],
        ['Bold','Italic'],
        ['NumberedList', 'BulletedList', 'Outdent','Indent', 'Blockquote'],
        ['JustifyLeft','JustifyCenter','JustifyRight'],
        ['Link', 'Unlink','Anchor','Image'],
        ['RemoveFormat','HorizontalRule','ShowBlocks']
    ];

    config.extraPlugins = 'acheck,wsc,scayt,macrosdropdown';
    config.templates_replaceContent = false;

    // [ Left, Center, Right, Justified ]
    config.justifyClasses = [ 'text-start', 'text-center', 'text-end', 'text-justify' ];
};

CKEDITOR.addCss(
    '.cke_combopanel { width:300px !important;}'
)

CKEDITOR.dtd.$removeEmpty['i'] = 0;
CKEDITOR.dtd.$removeEmpty['span'] = 0;
CKEDITOR.dtd.$removeEmpty['div'] = 0;
CKEDITOR.dtd.$removeEmpty['em'] = 0;

CKEDITOR.on('instanceReady', function() {
    $(".cke_combo_inlinelabel").text("Inline styles");
});
