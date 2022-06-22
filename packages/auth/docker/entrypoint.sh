#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-local' )
    echo "Starting Web..."
    yarn start:local
    ;;

  'start-web' )
    echo "Starting Web..."
    yarn start
    ;;

  'start-worker' )
    echo "Starting Worker..."
    yarn worker
    ;;

  'email-daily-backup' )
    echo "Starting Email Daily Backup..."
    yarn daily-backup:email
    ;;

  'email-weekly-backup' )
    echo "Starting Email Weekly Backup..."
    yarn weekly-backup:email
    ;;

  'dropbox-daily-backup' )
    echo "Starting Dropbox Daily Backup..."
    yarn daily-backup:dropbox
    ;;

  'google-drive-daily-backup' )
    echo "Starting Google Drive Daily Backup..."
    yarn daily-backup:google_drive
    ;;

  'one-drive-daily-backup' )
    echo "Starting One Drive Daily Backup..."
    yarn daily-backup:one_drive
    ;;

   * )
    echo "Unknown command"
    ;;
esac

exec "$@"
