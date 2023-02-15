#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-web' )
    echo "[Docker] Starting Web..."
    node docker/entrypoint-server.js
    ;;

  'start-worker' )
    echo "[Docker] Starting Worker..."
    node docker/entrypoint-worker.js
    ;;

  'content-size-recalculate' )
    echo "[Docker] Starting Content Size Recalculation..."
    USER_UUID=$1 && shift 1
    node docker/entrypoint-content.js $USER_UUID
    ;;

   * )
    echo "[Docker] Unknown command"
    ;;
esac

exec "$@"
