#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-local' )
    echo "Starting Web..."
    yarn workspace @standardnotes/auth-server start:local
    ;;

  'start-web' )
    echo "Starting Web..."
    yarn workspace @standardnotes/auth-server start
    ;;

  'start-worker' )
    echo "Starting Worker..."
    yarn workspace @standardnotes/auth-server worker
    ;;

  'email-daily-backup' )
    echo "Starting Email Daily Backup..."
    yarn workspace @standardnotes/auth-server daily-backup:email
    ;;

  'email-weekly-backup' )
    echo "Starting Email Weekly Backup..."
    yarn workspace @standardnotes/auth-server weekly-backup:email
    ;;

  'email-backup' )
    echo "Starting Email Backup For Single User..."
    yarn workspace @standardnotes/auth-server user-email-backup
    ;;

  'dropbox-daily-backup' )
    echo "Starting Dropbox Daily Backup..."
    yarn workspace @standardnotes/auth-server daily-backup:dropbox
    ;;

  'google-drive-daily-backup' )
    echo "Starting Google Drive Daily Backup..."
    yarn workspace @standardnotes/auth-server daily-backup:google_drive
    ;;

  'one-drive-daily-backup' )
    echo "Starting One Drive Daily Backup..."
    yarn workspace @standardnotes/auth-server daily-backup:one_drive
    ;;

  'email-campaign' )
    echo "Starting Email Campaign Sending..."
    MESSAGE_IDENTIFIER=$1 && shift 1
    yarn workspace @standardnotes/auth-server email-campaign $MESSAGE_IDENTIFIER
    ;;

   * )
    echo "Unknown command"
    ;;
esac

exec "$@"
