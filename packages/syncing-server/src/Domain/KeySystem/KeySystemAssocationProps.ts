import { Timestamps, Uuid } from '@standardnotes/domain-core'

export interface KeySystemAssociationProps {
  itemUuid: Uuid
  keySystemIdentifier: string
  timestamps: Timestamps
}
