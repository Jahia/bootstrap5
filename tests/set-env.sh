#!/bin/bash
# Loads the test environment (.env, or .env.example when there is no .env) and exports its variables.
# The files are looked up next to this script, so it can be sourced from any folder. A bare
# "export" prints every variable of the shell, secrets included: nothing is exported when the
# file declares no variable.

SET_ENV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
if [[ -f "${SET_ENV_DIR}/.env" ]]; then
  SET_ENV_FILE="${SET_ENV_DIR}/.env"
else
  SET_ENV_FILE="${SET_ENV_DIR}/.env.example"
fi

if [[ -f "${SET_ENV_FILE}" ]]; then
  source "${SET_ENV_FILE}"
  # One name at a time (works in bash and zsh, and a file without variables exports nothing)
  for SET_ENV_NAME in $(sed -n 's/^[[:space:]]*\([A-Za-z_][A-Za-z0-9_]*\)=.*/\1/p' "${SET_ENV_FILE}"); do
    export "${SET_ENV_NAME}"
  done
else
  echo "set-env.sh: neither .env nor .env.example found in ${SET_ENV_DIR}" >&2
fi
unset SET_ENV_DIR SET_ENV_FILE SET_ENV_NAME
