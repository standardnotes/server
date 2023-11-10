#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-web' )
    echo "Starting Web..."
    exec node docker/entrypoint-server.js
    ;;

   * )
    echo "Unknown command"
    ;;
esac

exec "$@"
