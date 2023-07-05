import { Timestamps, Uuid } from '@standardnotes/domain-core'
import { NotificationType } from './NotificationType'

export interface NotificationProps {
  userUuid: Uuid
  type: NotificationType
  payload: string
  timestamps: Timestamps
}
