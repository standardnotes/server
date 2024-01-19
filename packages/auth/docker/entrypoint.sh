#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-web' )
    exec node docker/entrypoint-server.js
    ;;

  'start-worker' )
    exec node docker/entrypoint-worker.js
    ;;

  'cleanup' )
    exec node docker/entrypoint-cleanup.js
    ;;

  'stats' )
    exec node docker/entrypoint-stats.js
    ;;

  'email-daily-backup' )
    exec node docker/entrypoint-backup.js daily
    ;;

  'email-weekly-backup' )
    exec node docker/entrypoint-backup.js weekly
    ;;

  'email-backup' )
    EMAIL=$1 && shift 1
    exec node docker/entrypoint-user-email-backup.js $EMAIL
    ;;

  'fix-quota' )
    EMAIL=$1 && shift 1
    exec node docker/entrypoint-fix-quota.js $EMAIL
    ;;

  'fix-roles' )
    exec node docker/entrypoint-fix-roles.js
    ;;

  'fix-subscriptions' )
    exec node docker/entrypoint-fix-subscriptions.js
    ;;

  'delete-accounts' )
    FILE_NAME=$1 && shift 1
    MODE=$1 && shift 1
    exec node docker/entrypoint-delete-accounts.js $FILE_NAME $MODE
    ;;

   * )
    echo "[Docker] Unknown command"
    ;;
esac

exec "$@"
