export interface UserRolesChangedEventPayload {
  userUuid: string
  email: string
  currentRoles: string[]
  timestamp: number
}
