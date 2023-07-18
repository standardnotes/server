import { SharedVaultAssociation } from './SharedVaultAssociation'

export interface SharedVaultAssociationRepositoryInterface {
  save(sharedVaultAssociation: SharedVaultAssociation): Promise<void>
  remove(sharedVaultAssociation: SharedVaultAssociation): Promise<void>
}
