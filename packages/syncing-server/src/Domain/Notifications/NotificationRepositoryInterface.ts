import { Uuid } from '@standardnotes/domain-core'

import { Notification } from './Notification'

export interface NotificationRepositoryInterface {
  save(notification: Notification): Promise<void>
  findByUserUuidUpdatedAfter(userUuid: Uuid, lastSyncTime: number): Promise<Notification[]>
  findByUserUuid(userUuid: Uuid): Promise<Notification[]>
}
