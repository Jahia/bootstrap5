#!/bin/bash
# Migration test: a site built with bootstrap5 2.x must still display once 3.x replaced 2.x.
#
#   1. installs the 2.x modules on a running Jahia and seeds a site with them (the content is stored
#      where 2.x stores it), recording how 2.x renders every page;
#   2. installs the 3.x modules of this checkout over them, on the same repository;
#   3. checks that 3.x shows the same content, in the same places.
#
# Usage, against a freshly started Jahia (JAHIA_URL, http://localhost:8080 by default):
#   BOOTSTRAP5_2X_ARTIFACTS=/path/to/the/2.4.7/jars bash ci.migration.sh
# The 3.x modules come from this checkout's build (mvn clean install), or from BOOTSTRAP5_3X_ARTIFACTS.
source ./set-env.sh
set -e

if [[ -z "${BOOTSTRAP5_2X_ARTIFACTS}" ]]; then
    echo "Set BOOTSTRAP5_2X_ARTIFACTS to a folder holding the 2.x jars (bootstrap5-core, bootstrap5-components, bootstrap5-templates-starter)."
    exit 1
fi

PROVISION="$(dirname "$(node -p "require.resolve('@jahia/cypress/package.json')")")/env.provision.sh"
SPECS='specPattern=cypress/migration/**/*.cy.ts'
export CYPRESS_BASE_URL="${CYPRESS_BASE_URL:-$JAHIA_URL}"

echo "== 1/3 Install 2.x and seed the site =="
BOOTSTRAP5_ARTIFACTS="${BOOTSTRAP5_2X_ARTIFACTS}" bash ci.build.sh
bash "${PROVISION}"
NO_COLOR=1 yarn e2e:ci --config "${SPECS}" --spec cypress/migration/01-seed-2x.cy.ts

echo "== 2/3 Install 3.x over 2.x =="
BOOTSTRAP5_ARTIFACTS="${BOOTSTRAP5_3X_ARTIFACTS}" bash ci.build.sh
bash "${PROVISION}"

echo "== 3/3 Check the 2.x site rendered by 3.x =="
NO_COLOR=1 yarn e2e:ci --config "${SPECS}" --spec cypress/migration/02-verify-3x.cy.ts
