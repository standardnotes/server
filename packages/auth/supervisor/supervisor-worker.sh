#!/bin/bash

set -euo pipefail

sh supervisor/wait-for.sh localhost $AUTH_SERVER_PORT
node docker/entrypoint-worker.js
