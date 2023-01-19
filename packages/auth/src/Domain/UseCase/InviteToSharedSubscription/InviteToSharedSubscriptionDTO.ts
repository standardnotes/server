import { Uuid } from '@standardnotes/common'

export type InviteToSharedSubscriptionDTO = {
  inviterEmail: string
  inviterUuid: Uuid
  inviterRoles: string[]
  inviteeIdentifier: string
}
