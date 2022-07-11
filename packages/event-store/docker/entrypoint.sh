#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-worker' )
    echo "Starting Worker..."
    yarn workspace @standardnotes/event-store worker
    ;;

   * )
    echo "Unknown command"
    ;;
esac

exec "$@"
