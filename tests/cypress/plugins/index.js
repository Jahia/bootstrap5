/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('cypress-terminal-report/src/installLogsPrinter')(on)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@jahia/cypress/dist/plugins/registerPlugins').registerPlugins(on, config)

    // Documentation screenshots (ci.screenshots.sh sets DOCS_SCALE): a window larger than the
    // viewport, so that the page is captured at its real size, without scrollbars, and with Chrome
    // at DOCS_SCALE times the resolution. Without DOCS_SCALE nothing changes for the other specs.
    on('before:browser:launch', (browser, launchOptions) => {
        const scale = Number(config.env.DOCS_SCALE)
        if (!scale) {
            return launchOptions
        }

        if (browser.name === 'electron') {
            launchOptions.preferences.width = 1600
            launchOptions.preferences.height = 1100
        } else if (browser.family === 'chromium') {
            launchOptions.args = launchOptions.args.filter(arg => !arg.startsWith('--window-size'))
            launchOptions.args.push('--window-size=1600,1100', '--hide-scrollbars', `--force-device-scale-factor=${scale}`)
        }

        return launchOptions
    })

    return config
}
