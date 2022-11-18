#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-web' )
    echo "Starting Web..."
    yarn workspace @standardnotes/revisions-server start
    ;;

  'start-worker' )
    echo "Starting Worker..."
    yarn workspace @standardnotes/revisions-server worker
    ;;

   * )
    echo "Unknown command"
    ;;
esac

exec "$@"
