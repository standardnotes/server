import { html } from './encourage-subscription-purchasing.html'

export function getSubject(): string {
  return 'Checking in after one month with Standard Notes'
}

export function getBody(registrationDate: string): string {
  const body = html

  return body.replace('%%REGISTRATION_DATE%%', registrationDate)
}
