#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-web' )
    echo "Starting Web..."
    yarn workspace @standardnotes/workspace-server start
    ;;

  'start-worker' )
    echo "Starting Worker..."
    yarn workspace @standardnotes/workspace-server worker
    ;;

   * )
    echo "Unknown command"
    ;;
esac

exec "$@"
