#!/bin/bash

set -euo pipefail

sh supervisor/wait-for.sh localhost $AUTH_SERVER_PORT
sh supervisor/wait-for.sh localhost $FILES_SERVER_PORT
sh supervisor/wait-for.sh localhost $REVISIONS_SERVER_PORT
sh supervisor/wait-for.sh localhost $SYNCING_SERVER_PORT
node docker/entrypoint-server.js
