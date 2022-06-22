#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-worker' )
    echo "Starting Worker..."
    yarn workspace @standardnotes/scheduler-server worker
    ;;

  'verify-jobs' )
    echo "Starting jobs verification..."
    yarn workspace @standardnotes/scheduler-server verify:jobs
    ;;

   * )
    echo "Unknown command"
    ;;
esac

exec "$@"
