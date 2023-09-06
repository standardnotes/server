import { Timestamps } from '../Common/Timestamps'
import { Uuid } from '../Common/Uuid'
import { SharedVaultUserPermission } from './SharedVaultUserPermission'

export interface SharedVaultUserProps {
  sharedVaultUuid: Uuid
  userUuid: Uuid
  permission: SharedVaultUserPermission
  timestamps: Timestamps
}
