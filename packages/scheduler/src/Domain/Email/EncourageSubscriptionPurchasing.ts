import { readFileSync } from 'fs'

export function getSubject(): string {
  return 'Checking in after one month with Standard Notes'
}

export function getBody(registrationDate: string): string {
  const body = readFileSync(`${__dirname}/encourage-subscription-purchasing.html`).toString()

  return body.replace('%%REGISTRATION_DATE%%', registrationDate)
}
