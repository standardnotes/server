import { NotificationPayload, NotificationType, Timestamps, Uuid } from '@standardnotes/domain-core'

export interface NotificationProps {
  userUuid: Uuid
  type: NotificationType
  payload: NotificationPayload
  timestamps: Timestamps
}
