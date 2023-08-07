export type DeleteOtherSessionsForUserDTO = {
  userUuid: string
  currentSessionUuid: string
  markAsRevoked: boolean
}
