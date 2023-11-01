import { html } from './user-email-changed.html'

export function getSubject(): string {
  return 'Confirmation: Your Email Address Has Been Successfully Updated'
}

export function getBody(newEmail: string): string {
  return html(newEmail)
}
