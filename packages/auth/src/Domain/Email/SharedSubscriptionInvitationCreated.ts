import { html } from './shared-subscription-invitation-created.html'

export function getSubject(): string {
  return 'You have been invited to a Standard Notes subscription'
}

export function getBody(inviterIdentifier: string, inviteUuid: string): string {
  return html(inviterIdentifier, inviteUuid)
}
