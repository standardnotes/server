import { Uuid } from '@standardnotes/domain-core'

export interface SharedVaultAssociationProps {
  editedBy: Uuid
  sharedVaultUuid: Uuid
}
