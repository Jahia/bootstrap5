#!/bin/bash
# Documentation screenshots: regenerates the images of /images from a running Jahia.
#
#   1. cypress/docs/01-seed creates the demo sites (bootstrap5docs, bootstrap5docsrtl);
#   2. 02-rendered and 03-editor capture the components and the content editor forms, annotated
#      where zones need naming (cypress/support/docs.ts);
#   3. 99-teardown deletes the sites;
#   4. the images are copied to /images under the names the documentation links to.
# Nothing is copied when a capture fails: a wrong image is worse than an old one.
#
# Usage, against a running Jahia with the modules of this checkout (JAHIA_URL, see set-env.sh):
#   JAHIA_URL=http://localhost:8580 bash ci.screenshots.sh
# Options:
#   DOCS_BROWSER  browser Cypress drives (default chrome; "electron" needs no installed browser)
#   DOCS_SCALE    device pixel ratio of the captures (default 2; Electron always captures at 1)
#   DOCS_SPEC     only run this spec of cypress/docs (the sites must exist: run 01-seed first)
#   DOCS_KEEP_SITE=true  keep the demo sites at the end
#   DOCS_IMAGES   copy the images to this folder instead of /images (to review them first)
cd "$(dirname "$0")" || exit 1
source ./set-env.sh
set -e

export CYPRESS_BASE_URL="${CYPRESS_BASE_URL:-$JAHIA_URL}"
export CYPRESS_DOCS_SCALE="${DOCS_SCALE:-2}"
export CYPRESS_DOCS_KEEP_SITE="${DOCS_KEEP_SITE:-false}"
BROWSER="${DOCS_BROWSER:-chrome}"
IMAGES="${DOCS_IMAGES:-$(cd .. && pwd)/images}"
OUTPUT=results/screenshots

# Captures of a previous run must not be mistaken for those of this one
if [[ -d "${OUTPUT}" ]]; then
    find "${OUTPUT}" -path '*/docs/*.png' -delete
fi

# One Cypress run per spec, in order: with Chrome, a run of several specs stops at the second one
# ("* is not a valid URL" when Cypress opens the next spec)
if [[ -n "${DOCS_SPEC}" ]]; then
    SPECS=("cypress/docs/${DOCS_SPEC}")
else
    SPECS=(cypress/docs/*.cy.ts)
fi

FAILED=0
for spec in "${SPECS[@]}"; do
    if [[ "${FAILED}" -ne 0 && "${spec}" != *teardown* ]]; then
        continue
    fi

    echo "== ${spec} =="
    # The teardown runs even after a failure, so that the demo sites do not stay behind
    NO_COLOR=1 yarn e2e:ci --browser "${BROWSER}" --config 'specPattern=cypress/docs/**/*.cy.ts,video=false,trashAssetsBeforeRuns=false' --spec "${spec}" || FAILED=1
done

if [[ "${FAILED}" -ne 0 ]]; then
    echo "== A capture failed: /images is left untouched =="
    exit 1
fi

mkdir -p "${IMAGES}"
COUNT=0
while IFS= read -r image; do
    cp "${image}" "${IMAGES}/$(basename "${image}")"
    COUNT=$((COUNT + 1))
done < <(find "${OUTPUT}" -path '*/docs/*.png' | sort)
echo "== ${COUNT} images copied to ${IMAGES} =="
