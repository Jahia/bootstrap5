#!/bin/bash
source ./set-env.sh

# Multi-module Maven project — copy JARs into assets/ so they are sent
# alongside the provisioning manifest in the correct install order
for module in bootstrap5-core bootstrap5-components bootstrap5-templates-starter; do
  if [[ -d "../${module}/target" ]]; then
    find "../${module}/target" -maxdepth 1 -name "*-SNAPSHOT.jar" -exec cp {} ./assets/ \;
  fi
done

echo "Assets ready:"
ls -la assets/
