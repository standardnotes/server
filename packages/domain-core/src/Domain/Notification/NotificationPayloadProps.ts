import { Uuid } from '../Common/Uuid'
import { NotificationPayloadIdentifierType } from './NotificationPayloadIdentifierType'
import { NotificationType } from './NotificationType'

export interface NotificationPayloadProps {
  type: NotificationType
  primaryIdentifier: Uuid
  primaryIndentifierType: NotificationPayloadIdentifierType
  secondaryIdentifier?: Uuid
  secondaryIdentifierType?: NotificationPayloadIdentifierType
  version: string
}
