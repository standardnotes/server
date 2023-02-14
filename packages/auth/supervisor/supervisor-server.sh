#!/bin/bash

set -euo pipefail

sh supervisor/wait-for.sh localhost $SYNCING_SERVER_PORT
node supervisor/entrypoint-server.js
