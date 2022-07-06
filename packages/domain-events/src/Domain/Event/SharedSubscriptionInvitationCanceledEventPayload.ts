import { Uuid } from '@standardnotes/common'

export interface SharedSubscriptionInvitationCanceledEventPayload {
  inviterEmail: string
  inviterSubscriptionId: number
  inviterSubscriptionUuid: Uuid
  inviteeIdentifier: string
  inviteeIdentifierType: 'email' | 'hash' | 'uuid'
  sharedSubscriptionInvitationUuid: string
}
