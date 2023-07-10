import { SharedVault } from '../../../SharedVault/SharedVault'
import { SharedVaultUser } from '../../../SharedVault/User/SharedVaultUser'

export interface CreateSharedVaultResult {
  sharedVaultUser: SharedVaultUser
  sharedVault: SharedVault
}
