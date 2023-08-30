export interface NotificationAddedForUserEventPayload {
  uuid: string
  userUuid: string
  type: string
  payload: string
  createdAtTimestamp: number
  updatedAtTimestamp: number
}
