export interface SharedSubscriptionInvitationCanceledEventPayload {
  inviterEmail: string
  inviterSubscriptionId: number
  inviterSubscriptionUuid: string
  inviteeIdentifier: string
  inviteeIdentifierType: 'email' | 'hash' | 'uuid'
  sharedSubscriptionInvitationUuid: string
}
