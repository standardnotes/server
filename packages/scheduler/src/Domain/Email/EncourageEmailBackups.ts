import { readFileSync } from 'fs'

export function getSubject(): string {
  return 'Enable email backups for your account'
}

export function getBody(): string {
  return readFileSync(`${__dirname}/encourage-email-backups.html`).toString()
}
