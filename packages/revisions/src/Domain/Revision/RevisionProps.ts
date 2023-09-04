import { ContentType, Dates, Uuid } from '@standardnotes/domain-core'

import { SharedVaultAssociation } from '../SharedVault/SharedVaultAssociation'
import { KeySystemAssociation } from '../KeySystem/KeySystemAssociation'

export interface RevisionProps {
  itemUuid: Uuid
  userUuid: Uuid | null
  content: string | null
  contentType: ContentType
  itemsKeyId: string | null
  encItemKey: string | null
  authHash: string | null
  creationDate: Date
  dates: Dates
  sharedVaultAssociation?: SharedVaultAssociation
  keySystemAssociation?: KeySystemAssociation
}
