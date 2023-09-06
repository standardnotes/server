import { SharedVaultUser } from '@standardnotes/domain-core'

import { SharedVault } from '../../../SharedVault/SharedVault'

export interface CreateSharedVaultResult {
  sharedVaultUser: SharedVaultUser
  sharedVault: SharedVault
}
