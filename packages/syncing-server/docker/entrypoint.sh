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

  'content-size-recalculate' )
    echo "Starting Content Size Recalculation..."
    USER_UUID=$1 && shift 1
    yarn workspace @standardnotes/syncing-server content-size $USER_UUID
    ;;

  'revisions-ownership-fix' )
    echo "Starting Revisions Ownership Fixing..."
    yarn workspace @standardnotes/syncing-server revisions-ownership
    ;;

   * )
    echo "Unknown command"
    ;;
esac

exec "$@"
