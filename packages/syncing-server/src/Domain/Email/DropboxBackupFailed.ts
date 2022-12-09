import { html } from './dropbox-backup-failed.html'

export function getSubject(): string {
  return 'Failed Daily Backup to Dropbox'
}

export function getBody(): string {
  return html
}
