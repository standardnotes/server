import { UniqueEntityId } from '@standardnotes/domain-core'

import { SharedVaultItem } from './SharedVaultItem'

export interface SharedVaultItemRepositoryInterface {
  save(sharedVaultItem: SharedVaultItem): Promise<void>
  findBySharedVaultId(sharedVaultId: UniqueEntityId): Promise<SharedVaultItem[]>
}
