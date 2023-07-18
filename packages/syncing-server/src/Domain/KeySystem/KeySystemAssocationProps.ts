import { Timestamps, Uuid } from '@standardnotes/domain-core'

export interface KeySystemAssociationProps {
  itemUuid: Uuid
  keySystemUuid: Uuid
  timestamps: Timestamps
}
