import { Uuid } from '../Common/Uuid'
import { NotificationType } from './NotificationType'

export interface NotificationPayloadProps {
  type: NotificationType
  sharedVaultUuid: Uuid
  version: string
  itemUuid?: Uuid
}
