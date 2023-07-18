import { ContentType, Dates, Timestamps, Uuid } from '@standardnotes/domain-core'

import { KeySystemAssociation } from '../KeySystem/KeySystemAssociation'
import { SharedVaultAssociation } from '../SharedVault/SharedVaultAssociation'

export interface ItemProps {
  duplicateOf: Uuid | null
  itemsKeyId: string | null
  content: string | null
  contentType: ContentType
  encItemKey: string | null
  authHash: string | null
  userUuid: Uuid
  deleted: boolean
  updatedWithSession: Uuid | null
  dates: Dates
  timestamps: Timestamps
  contentSize?: number
  sharedVaultAssociation?: SharedVaultAssociation
  keySystemAssociation?: KeySystemAssociation
}
