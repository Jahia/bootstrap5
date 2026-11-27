// Accessibility checks with axe-core, run in the page under test.

/** WCAG 2.2 level A and AA rules. */
const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

export const a11yReportFile = 'results/accessibility-report.json'

interface AxeNode {target: string[]; html: string; failureSummary?: string}
interface AxeViolation {id: string; impact: string; help: string; helpUrl: string; nodes: AxeNode[]}

export interface A11yOptions {
    /** CSS selector of the part of the page to check (default: the whole document) */
    include?: string;
    /** CSS selectors left out of the check */
    exclude?: string[];
    /** Rule ids not checked, each with the reason given where the option is used */
    disabledRules?: string[];
}

const report: Record<string, unknown> = {}

/**
 * Runs axe-core on the current page and fails on any WCAG 2.2 A/AA violation.
 * Every run is added to results/accessibility-report.json under `label`.
 */
export const checkA11y = (label: string, options: A11yOptions = {}) => {
    cy.readFile('node_modules/axe-core/axe.min.js', {log: false}).then((source: string) => {
        cy.window({log: false}).then(win => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const page = win as any
            if (!page.axe) {
                page.eval(source)
            }

            const context: {include?: string[][]; exclude?: string[][]} = {}
            if (options.include) {
                context.include = [[options.include]]
            }

            if (options.exclude && options.exclude.length > 0) {
                context.exclude = options.exclude.map(selector => [selector])
            }

            const rules: Record<string, {enabled: boolean}> = {}
            ;(options.disabledRules || []).forEach(rule => {
                rules[rule] = {enabled: false}
            })

            return page.axe.run(Object.keys(context).length > 0 ? context : page.document, {
                runOnly: {type: 'tag', values: wcagTags},
                rules
            })
        }).then((results: {violations: AxeViolation[]; passes: unknown[]; incomplete: AxeViolation[]}) => {
            const violations = results.violations.map(violation => ({
                rule: violation.id,
                impact: violation.impact,
                help: violation.help,
                helpUrl: violation.helpUrl,
                nodes: violation.nodes.map(node => ({target: node.target.join(' '), html: node.html.slice(0, 300), why: node.failureSummary}))
            }))
            report[label] = {
                violations,
                passedRules: results.passes.length,
                needsReview: results.incomplete.map(item => ({
                    rule: item.id,
                    nodes: item.nodes.map(node => ({target: node.target.join(' '), html: node.html.slice(0, 200)}))
                }))
            }
            cy.writeFile(a11yReportFile, report, {log: false})
            violations.forEach(violation => {
                cy.log(`${violation.rule} (${violation.impact}): ${violation.help} — ${violation.nodes.map(node => node.target).join(' | ')}`)
            })
            expect(violations.map(violation => `${violation.rule}: ${violation.nodes.map(node => node.target).join(' | ')}`),
                `accessibility violations (${label})`).to.deep.equal([])
        })
    })
}
