#!/bin/bash

set -euo pipefail

sh supervisor/wait-for.sh localhost $SYNCING_SERVER_PORT
exec node docker/entrypoint-worker.js
