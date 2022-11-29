import { Timestamps, Uuid } from '@standardnotes/domain-core'

import { ContentType } from './ContentType'

export interface RevisionProps {
  itemUuid: Uuid
  userUuid: Uuid | null
  content: string | null
  contentType: ContentType
  itemsKeyId: string | null
  encItemKey: string | null
  authHash: string | null
  creationDate: Date
  timestamps: Timestamps
}
