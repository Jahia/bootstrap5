#!/bin/bash
# Documentation screenshots: regenerates the images of /images from a running Jahia.
#
#   1. cypress/docs/01-seed creates the demo sites (bootstrap5docs, bootstrap5docsrtl);
#   2. 02-rendered, 03-editor and 04-edit-mode capture the components, the content editor forms and
#      the page builder (edit mode), annotated where zones need naming (cypress/support/docs.ts);
#   3. 99-teardown deletes the sites;
#   4. the images are copied to /images under the names the documentation links to; the sequences
#      of captures of 04-edit-mode (results/screenshots/*/frames/<name>/NN[-d<ms>].png, <ms> being
#      how long a frame stays) are assembled into <name>.gif with ffmpeg (FFMPEG, default `ffmpeg`).
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
    find "${OUTPUT}" \( -path '*/docs/*.png' -o -path '*/frames/*.png' \) -delete
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

# Animations: one GIF per folder of frames. Frames are named NN.png (1.6 s) or NN-d<ms>.png
FFMPEG="${FFMPEG:-ffmpeg}"
GIFS=0
while IFS= read -r folder; do
    name="$(basename "${folder}")"
    if ! command -v "${FFMPEG}" > /dev/null; then
        echo "== ${FFMPEG} not found: ${name}.gif not built =="
        continue
    fi
    list="${folder}/frames.txt"
    : > "${list}"
    last=""
    while IFS= read -r frame; do
        base="$(basename "${frame}" .png)"
        ms=1600
        [[ "${base}" =~ -d([0-9]+)$ ]] && ms="${BASH_REMATCH[1]}"
        printf "file '%s'\nduration %s\n" "$(cd "${folder}" && pwd)/$(basename "${frame}")" "$((ms / 1000)).$(printf '%03d' $((ms % 1000)))" >> "${list}"
        last="${frame}"
    done < <(find "${folder}" -name '*.png' | sort)
    # The last file is repeated: the concat demuxer ignores the duration of the final one
    printf "file '%s'\n" "$(cd "${folder}" && pwd)/$(basename "${last}")" >> "${list}"
    "${FFMPEG}" -v error -y -f concat -safe 0 -i "${list}" \
        -vf "fps=10,scale=w=min(iw\,960):h=-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" \
        -loop 0 "${IMAGES}/${name}.gif"
    size=$(wc -c < "${IMAGES}/${name}.gif")
    echo "== ${name}.gif: ${size} bytes =="
    if [[ "${size}" -gt 1000000 ]]; then
        echo "!! ${name}.gif is over 1 MB"
    fi
    GIFS=$((GIFS + 1))
done < <(find "${OUTPUT}" -type d -path '*/frames/*' | sort)
echo "== ${GIFS} animations built in ${IMAGES} =="
