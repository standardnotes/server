import { Uuid } from '@standardnotes/common'

export type InviteToSharedSubscriptionResult =
  | {
      success: true
      sharedSubscriptionInvitationUuid: Uuid
    }
  | {
      success: false
    }
