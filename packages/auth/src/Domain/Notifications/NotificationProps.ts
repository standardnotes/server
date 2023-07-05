import { NotificationType, Timestamps, Uuid } from '@standardnotes/domain-core'

export interface NotificationProps {
  userUuid: Uuid
  type: NotificationType
  payload: string
  timestamps: Timestamps
}
