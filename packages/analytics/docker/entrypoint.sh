#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-worker' )
    echo "Starting Worker..."
    yarn workspace @standardnotes/analytics worker
    ;;

  'report' )
    echo "Starting Usage Report Generation..."
    yarn workspace @standardnotes/analytics report
    ;;

   * )
    echo "Unknown command"
    ;;
esac

exec "$@"
