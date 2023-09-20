import { NotificationPayload } from '@standardnotes/domain-core'

export interface AddNotificationsForUsersDTO {
  exceptUserUuid?: string
  sharedVaultUuid: string
  version: string
  type: string
  payload: NotificationPayload
}
