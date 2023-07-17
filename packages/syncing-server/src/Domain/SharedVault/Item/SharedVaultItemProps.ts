import { Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

export interface SharedVaultItemProps {
  sharedVaultId: UniqueEntityId
  itemId: UniqueEntityId
  keySystemIdentifier: string
  lastEditedBy: Uuid
  timestamps: Timestamps
}
