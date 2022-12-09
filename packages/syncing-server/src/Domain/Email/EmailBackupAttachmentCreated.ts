import { html } from './email-backup-attachment-created.html'

export function getSubject(fileIndex: number, numberOfFiles: number, date: string): string {
  let subject = `Data Backup for ${date}`
  if (numberOfFiles > 1) {
    subject = `Data Backup for ${date} - Part ${fileIndex} Of ${numberOfFiles}`
  }

  return subject
}

export function getBody(email: string): string {
  return html(email)
}
