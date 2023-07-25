import { NotificationType, Uuid } from '@standardnotes/domain-core'

import { Notification } from './Notification'

export interface NotificationRepositoryInterface {
  save(notification: Notification): Promise<void>
  findByUserUuidUpdatedAfter(userUuid: Uuid, lastSyncTime: number): Promise<Notification[]>
  findByUserUuid(userUuid: Uuid): Promise<Notification[]>
  findByUserUuidAndType(userUuid: Uuid, type: NotificationType): Promise<Notification[]>
  remove(notification: Notification): Promise<void>
}
