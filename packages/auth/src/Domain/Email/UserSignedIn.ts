import { html } from './user-signed-in.html'

export function getSubject(email: string): string {
  return `New sign-in for ${email}`
}

export function getBody(email: string, device: string, browser: string, date: Date): string {
  const body = html

  return body
    .replace('%%EMAIL%%', email)
    .replace('%%DEVICE%%', device)
    .replace('%%BROWSER%%', browser)
    .replace('%%TIME_AND_DATE%%', date.toLocaleString())
}
