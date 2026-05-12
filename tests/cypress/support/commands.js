import 'cypress-wait-until'
import 'cypress-mailpit'

const printCookieValues = cookie => {
    const cookieType = cookie.expiry ? 'Persistent' : 'Session'
    const expiryDate = cookie.expiry ? new Date(cookie.expiry * 1000).toISOString() : 'Session only'
    const daysUntilExpiry = cookie.expiry ? Math.round(((cookie.expiry * 1000) - Date.now()) / 1000 / 60 / 60 / 24) : null

    cy.log(`Cookie: ${cookie.name} [${cookieType}]`)
    cy.log(`Value: ${cookie.value} | Domain: ${cookie.domain} | Expires: ${expiryDate}${daysUntilExpiry ? ` (${daysUntilExpiry}d)` : ''}`)
}

Cypress.Commands.add('logAllCookies', () => {
    cy.getCookies().then(cookies => {
        if (cookies.length === 0) {
            cy.log('No cookies found')
            return
        }
        cy.log(`COOKIES: ${cookies.length} total`)
        cookies.forEach(cookie => {
            printCookieValues(cookie)
        })
    })
})

Cypress.Commands.add('logCookie', cookieName => {
    cy.getCookie(cookieName).then(cookie => {
        if (!cookie) {
            cy.log(`Cookie "${cookieName}" not found`)
            return
        }
        printCookieValues(cookie)
    })
})

Cypress.Commands.add('clearCookiesByType', (type = 'session') => {
    cy.getCookies().then(cookies => {
        const cookiesToClear = cookies.filter(cookie =>
            type.toLowerCase() === 'session' ? !cookie.expiry : cookie.expiry
        )
        cookiesToClear.forEach(cookie => {
            cy.clearCookie(cookie.name)
        })
    })
})

Cypress.Commands.add('simulateBrowserClose', () => {
    cy.clearAllSessionStorage()
    cy.clearCookiesByType('session')
})

Cypress.Commands.add('logSessionStorage', () => {
    cy.getAllSessionStorage().then(session => {
        cy.log(`sessionStorage: ${JSON.stringify(session)}`)
    })
})

Cypress.Commands.add('logLocalStorage', () => {
    cy.getAllLocalStorage().then(local => {
        cy.log(`localStorage: ${JSON.stringify(local)}`)
    })
})
