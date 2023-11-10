#!/bin/bash

set -euo pipefail

sh supervisor/wait-for.sh localhost $AUTH_SERVER_PORT
exec node docker/entrypoint-worker.js
