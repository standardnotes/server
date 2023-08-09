import { NotificationPayload } from '@standardnotes/domain-core'

export interface AddNotificationsForUsersDTO {
  sharedVaultUuid: string
  version: string
  type: string
  payload: NotificationPayload
}
