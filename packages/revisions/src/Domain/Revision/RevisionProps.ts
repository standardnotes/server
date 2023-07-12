import { ContentType, Dates, Uuid } from '@standardnotes/domain-core'

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
}
