import { html } from './google-drive-backup-failed.html'

export function getSubject(): string {
  return 'Failed Daily Backup to Google Drive Sync'
}

export function getBody(): string {
  return html
}
