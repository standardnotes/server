import { html } from './user-signed-in.html'

export function getSubject(email: string): string {
  return `New sign-in for ${email}`
}

export function getBody(email: string, device: string, browser: string, date: Date): string {
  return html(email, device, browser, date.toLocaleString())
}
