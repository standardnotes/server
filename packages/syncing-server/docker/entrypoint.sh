#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-local')
    echo "[Docker] Starting Web in Local Mode..."
    yarn workspace @standardnotes/syncing-server start:local
    ;;

  'start-web' )
    echo "[Docker] Starting Web..."
    yarn workspace @standardnotes/syncing-server start
    ;;

  'start-worker' )
    echo "[Docker] Starting Worker..."
    yarn workspace @standardnotes/syncing-server worker
    ;;

  'content-size-recalculate' )
    echo "[Docker] Starting Content Size Recalculation..."
    USER_UUID=$1 && shift 1
    yarn workspace @standardnotes/syncing-server content-size $USER_UUID
    ;;

  'revisions-ownership-fix' )
    echo "[Docker] Starting Revisions Ownership Fixing..."
    yarn workspace @standardnotes/syncing-server revisions-ownership
    ;;

   * )
    echo "[Docker] Unknown command"
    ;;
esac

exec "$@"
