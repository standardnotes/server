import { html } from './one-drive-backup-failed.html'

export function getSubject(): string {
  return 'Failed Daily Backup to OneDrive Sync'
}

export function getBody(): string {
  return html
}
