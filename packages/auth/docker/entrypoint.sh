#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-web' )
    echo "[Docker] Starting Web..."
    node docker/entrypoint-server.js
    ;;

  'start-worker' )
    echo "[Docker] Starting Worker..."
    node docker/entrypoint-worker.js
    ;;

  'cleanup' )
    echo "[Docker] Starting Cleanup..."
    node docker/entrypoint-cleanup.js
    ;;

  'stats' )
    echo "[Docker] Starting Persisting Stats..."
    node docker/entrypoint-stats.js
    ;;

  'email-daily-backup' )
    echo "[Docker] Starting Email Daily Backup..."
    node docker/entrypoint-backup.js daily
    ;;

  'email-weekly-backup' )
    echo "[Docker] Starting Email Weekly Backup..."
    node docker/entrypoint-backup.js weekly
    ;;

  'email-backup' )
    echo "[Docker] Starting Email Backup For Single User..."
    EMAIL=$1 && shift 1
    node docker/entrypoint-user-email-backup.js $EMAIL
    ;;

   * )
    echo "[Docker] Unknown command"
    ;;
esac

exec "$@"
