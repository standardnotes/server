import { readFileSync } from 'fs'

export function getSubject(): string {
  return 'Can we ask why you canceled?'
}

export function getBody(): string {
  return readFileSync(`${__dirname}/exit-interview.html`).toString()
}
