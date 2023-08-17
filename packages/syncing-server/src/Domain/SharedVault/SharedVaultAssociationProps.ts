import { Uuid } from '@standardnotes/domain-core'

export interface SharedVaultAssociationProps {
  lastEditedBy: Uuid
  sharedVaultUuid: Uuid
}
