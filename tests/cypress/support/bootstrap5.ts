const siteKey = 'bootstrap5test'

export const pageUrl = (pageName: string, lang = 'en') =>
    `/cms/render/live/${lang}/sites/${siteKey}/home/${pageName}.html`

export const createTestPage = (pageName: string) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/addNode.graphql',
        variables: {
            parentPathOrId: `/sites/${siteKey}/home`,
            name: pageName,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: pageName, language: 'en'},
                {name: 'j:templateName', value: 'starter'}
            ],
            children: [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}]
        }
    })
}

export const addComponent = (pageName: string, componentName: string, primaryNodeType: string, properties: object[] = [], mixins: string[] = []) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/addNode.graphql',
        variables: {
            parentPathOrId: `/sites/${siteKey}/home/${pageName}/pagecontent`,
            name: componentName,
            primaryNodeType,
            properties,
            mixins
        }
    })
}

export const publishPage = (pageName: string) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/publishNode.graphql',
        variables: {
            pathOrId: `/sites/${siteKey}/home/${pageName}`,
            languages: ['en'],
            publishSubNodes: true,
            includeSubTree: true
        }
    })
    // Give live workspace time to propagate
    cy.wait(2000)
}

export const uploadPlaceholderImage = (fileName = 'placeholder.png'): Cypress.Chainable<string> => {
    cy.fixture(`images/${fileName}`, 'binary').then((image: string) => {
        const blob = Cypress.Blob.binaryStringToBlob(image, 'image/png')
        const file = new File([blob], fileName, {type: blob.type})
        cy.apollo({
            mutationFile: 'graphql/jcr/mutation/uploadFile.graphql',
            variables: {
                parentPathOrId: `/sites/${siteKey}/files`,
                name: fileName,
                mimeType: 'image/png',
                file
            }
        })
    })
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {getNodeByPath} = require('@jahia/cypress')
    return getNodeByPath(`/sites/${siteKey}/files/${fileName}`)
        .its('data.jcr.nodeByPath.uuid') as Cypress.Chainable<string>
}

export const deleteTestPage = (pageName: string) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/deleteNode.graphql',
        variables: {
            pathOrId: `/sites/${siteKey}/home/${pageName}`,
            workspace: 'EDIT'
        }
    })
}

/** Adds a node anywhere in the edit workspace. */
export const addNode = (parentPathOrId: string, name: string, primaryNodeType: string, properties: object[] = [], mixins: string[] = [], children: object[] = []) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/addNode.graphql',
        variables: {parentPathOrId, name, primaryNodeType, properties, mixins, children}
    })
}

/** A content list named `area` under `parent`, holding one text per CSS class given. */
export const addAreaWithTexts = (parent: string, area: string, cssClasses: string[]) => {
    addNode(parent, area, 'jnt:contentList')
    cssClasses.forEach((cssClass, index) => {
        addNode(`${parent}/${area}`, `text-${index + 1}`, 'bootstrap5nt:text', [
            {name: 'text', value: `<p class="${cssClass}">${cssClass}</p>`, language: 'en'}
        ])
    })
}

export const deleteNode = (pathOrId: string) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/deleteNode.graphql',
        variables: {pathOrId, workspace: 'EDIT'}
    })
}

export const publishNode = (pathOrId: string, languages: string[] = ['en']) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/publishNode.graphql',
        variables: {pathOrId, languages, publishSubNodes: true, includeSubTree: true}
    })
}

/** Preview (edit workspace) and edit-mode URLs: both need a logged-in editor. */
export const previewUrl = (path: string, lang = 'en') => `/cms/render/default/${lang}${path}.html`
export const editFrameUrl = (path: string, lang = 'en') => `/cms/editframe/default/${lang}${path}.html`
