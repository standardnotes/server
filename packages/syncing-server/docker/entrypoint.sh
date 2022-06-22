#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-local')
    echo "Starting Web in Local Mode..."
    yarn workspace @standardnotes/syncing-server start:local
    ;;

  'start-web' )
    echo "Starting Web..."
    yarn workspace @standardnotes/syncing-server start
    ;;

  'start-worker' )
    echo "Starting Worker..."
    yarn workspace @standardnotes/syncing-server worker
    ;;

   * )
    echo "Unknown command"
    ;;
esac

exec "$@"
