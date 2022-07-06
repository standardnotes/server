export interface SharedSubscriptionInvitationCreatedEventPayload {
  inviterEmail: string
  inviterSubscriptionId: number
  inviteeIdentifier: string
  inviteeIdentifierType: 'email' | 'hash' | 'uuid'
  sharedSubscriptionInvitationUuid: string
}
