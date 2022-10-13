#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-web' )
    echo "Starting Web..."
    yarn workspace @standardnotes/websockets-server start
    ;;

  'start-worker' )
    echo "Starting Worker..."
    yarn workspace @standardnotes/websockets-server worker
    ;;

   * )
    echo "Unknown command"
    ;;
esac

exec "$@"
