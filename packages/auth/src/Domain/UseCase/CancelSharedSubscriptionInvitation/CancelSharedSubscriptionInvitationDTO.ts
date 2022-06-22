import { Uuid } from '@standardnotes/common'

export type CancelSharedSubscriptionInvitationDTO = {
  sharedSubscriptionInvitationUuid: Uuid
  inviterEmail: string
}
