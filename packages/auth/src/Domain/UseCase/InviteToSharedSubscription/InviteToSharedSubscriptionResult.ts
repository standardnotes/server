export type InviteToSharedSubscriptionResult =
  | {
      success: true
      sharedSubscriptionInvitationUuid: string
    }
  | {
      success: false
    }
