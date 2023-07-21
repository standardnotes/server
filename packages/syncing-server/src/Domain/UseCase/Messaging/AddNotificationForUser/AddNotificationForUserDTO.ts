import { NotificationPayload } from '@standardnotes/domain-core'

export interface AddNotificationForUserDTO {
  version: string
  type: string
  userUuid: string
  payload: NotificationPayload
}
