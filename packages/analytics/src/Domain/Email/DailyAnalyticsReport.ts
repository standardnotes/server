import { TimerInterface } from '@standardnotes/time'

import { html } from './daily-analytics-report.html'

export function getSubject(): string {
  return `Daily analytics report ${new Date().toLocaleDateString('en-US')}`
}

export function getBody(data: unknown, timer: TimerInterface): string {
  return html(data, timer)
}
