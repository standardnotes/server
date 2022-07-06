import { RoleName } from '@standardnotes/common'

export interface UserRolesChangedEventPayload {
  userUuid: string
  email: string
  currentRoles: RoleName[]
  timestamp: number
}
