#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-worker' )
    echo "[Docker] Starting Worker..."
    yarn workspace @standardnotes/analytics worker
    ;;

  'report' )
    echo "[Docker] Starting Usage Report Generation..."
    yarn workspace @standardnotes/analytics report
    ;;

   * )
    echo "[Docker] Unknown command"
    ;;
esac

exec "$@"
