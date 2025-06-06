window.jahia.i18n.loadNamespaces('bootstrap5-components');

window.jahia.uiExtender.registry.add('callback', 'bootstrap5-components', {
    targets: ['jahiaApp-init:60'],
    callback: function () {
        /*
        window.jahia.uiExtender.registry.add('pickerConfiguration', 'pagesandfiles5', {
            cmp: {
                picker: window.jahia.uiExtender.registry.get('selectorType', 'ContentPicker'),
                treeConfigs: [{
                    rootPath: site => `/sites/${site}`,
                    openableTypes: ['jnt:page', 'jnt:navMenuText', 'jnt:virtualsite', 'jnt:contentFolder', 'nt:folder', 'jmix:siteContent', 'jmix:browsableInEditorialPicker'],
                    selectableTypes: ['jnt:page', 'jnt:navMenuText', 'jnt:virtualsite', 'jnt:contentFolder', 'nt:folder', 'jmix:siteContent', 'jmix:browsableInEditorialPicker'],
                    type: 'pagesandfiles5',
                }],
                searchSelectorType: 'bootstrap5mix:internalLink',
                listTypesTable: ['jmix:mainResource', 'jnt:page', 'jnt:file'],
                selectableTypesTable: ['jmix:mainResource', 'jnt:page', 'jnt:file']
            }
        });
        window.jahia.uiExtender.registry.add('adminRoute', 'bootstrap5-componentsExample', {
            targets: ['administration-sites:999', 'bootstrap5-componentsaccordion'],
            label: 'bootstrap5-components:label.settings.title',
            icon: window.jahia.moonstone.toIconComponent('<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6V5A2 2 0 0 0 17 3H15A2 2 0 0 0 13 5V6H11V5A2 2 0 0 0 9 3H7A2 2 0 0 0 5 5V6H3V20H21V6M19 18H5V8H19Z" /></svg>'),
            isSelectable: true,
            requireModuleInstalledOnSite: 'bootstrap5-components',
            iframeUrl: window.contextJsParameters.contextPath + '/cms/editframe/default/$lang/sites/$site-key.bootstrap5-components.html.ajax'
        });

        window.jahia.uiExtender.registry.add('action', 'bootstrap5-componentsExample', {
            buttonIcon: window.jahia.moonstone.toIconComponent('<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6V5A2 2 0 0 0 17 3H15A2 2 0 0 0 13 5V6H11V5A2 2 0 0 0 9 3H7A2 2 0 0 0 5 5V6H3V20H21V6M19 18H5V8H19Z" /></svg>'),
            buttonLabel: 'bootstrap5-components:label.action.title',
            targets: ['contentActions:999'],
            onClick: context => {
                window.open('https://github.com/Jahia/app-shell/blob/master/docs/declare-new-module.md', "_blank");
            }
        });

        window.jahia.uiExtender.registry.add('accordionItem', 'bootstrap5-componentsApps_Example', window.jahia.uiExtender.registry.get('accordionItem', 'renderDefaultApps'), {
            targets: ['jcontent:998'],
            label: 'bootstrap5-components:label.appsAccordion.title',
            icon: window.jahia.moonstone.toIconComponent('<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6V5A2 2 0 0 0 17 3H15A2 2 0 0 0 13 5V6H11V5A2 2 0 0 0 9 3H7A2 2 0 0 0 5 5V6H3V20H21V6M19 18H5V8H19Z" /></svg>'),
            appsTarget: 'bootstrap5-componentsaccordion',
            isEnabled: function(siteKey) {
                return siteKey !== 'systemsite'
            }
        });
        */
    }
});
