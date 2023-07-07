import { Notification } from './Notification'

export interface NotificationRepositoryInterface {
  save(notification: Notification): Promise<void>
}
