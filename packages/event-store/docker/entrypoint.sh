#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-worker' )
    echo "Starting Worker..."
    node docker/entrypoint-worker.js
    ;;

   * )
    echo "Unknown command"
    ;;
esac

exec "$@"
