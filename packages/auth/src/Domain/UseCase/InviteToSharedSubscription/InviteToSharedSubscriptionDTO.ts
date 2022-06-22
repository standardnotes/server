import { RoleName, Uuid } from '@standardnotes/common'

export type InviteToSharedSubscriptionDTO = {
  inviterEmail: string
  inviterUuid: Uuid
  inviterRoles: RoleName[]
  inviteeIdentifier: string
}
