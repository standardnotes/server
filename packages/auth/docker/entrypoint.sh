#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-local' )
    echo "[Docker] Starting Web..."
    yarn workspace @standardnotes/auth-server start:local
    ;;

  'start-web' )
    echo "[Docker] Starting Web..."
    yarn workspace @standardnotes/auth-server start
    ;;

  'start-worker' )
    echo "[Docker] Starting Worker..."
    yarn workspace @standardnotes/auth-server worker
    ;;

  'cleanup' )
    echo "[Docker] Starting Cleanup..."
    yarn workspace @standardnotes/auth-server cleanup
    ;;

  'email-daily-backup' )
    echo "[Docker] Starting Email Daily Backup..."
    yarn workspace @standardnotes/auth-server daily-backup:email
    ;;

  'email-weekly-backup' )
    echo "[Docker] Starting Email Weekly Backup..."
    yarn workspace @standardnotes/auth-server weekly-backup:email
    ;;

  'email-backup' )
    echo "[Docker] Starting Email Backup For Single User..."
    EMAIL=$1 && shift 1
    yarn workspace @standardnotes/auth-server user-email-backup $EMAIL
    ;;

  'dropbox-daily-backup' )
    echo "[Docker] Starting Dropbox Daily Backup..."
    yarn workspace @standardnotes/auth-server daily-backup:dropbox
    ;;

  'google-drive-daily-backup' )
    echo "[Docker] Starting Google Drive Daily Backup..."
    yarn workspace @standardnotes/auth-server daily-backup:google_drive
    ;;

  'one-drive-daily-backup' )
    echo "[Docker] Starting One Drive Daily Backup..."
    yarn workspace @standardnotes/auth-server daily-backup:one_drive
    ;;

  'content-recalculation' )
    echo "[Docker] Starting Content Size Recalculation..."
    yarn workspace @standardnotes/auth-server content-recalculation
    ;;

   * )
    echo "[Docker] Unknown command"
    ;;
esac

exec "$@"
