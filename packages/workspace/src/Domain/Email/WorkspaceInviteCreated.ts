import { html } from './workspace-invite-created.html'

export function getSubject(): string {
  return 'You have been invited to a Standard Notes workspace'
}

export function getBody(inviteUuid: string): string {
  return html(inviteUuid)
}
