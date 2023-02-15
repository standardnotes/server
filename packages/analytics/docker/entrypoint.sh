#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-worker' )
    echo "[Docker] Starting Worker..."
    node docker/entrypoint-worker.js
    ;;

  'report' )
    echo "[Docker] Starting Usage Report Generation..."
    node docker/entrypoint-report.js
    ;;

   * )
    echo "[Docker] Unknown command"
    ;;
esac

exec "$@"
