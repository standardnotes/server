import { ContentType, Dates, Uuid } from '@standardnotes/domain-core'

export interface RevisionMetadataProps {
  contentType: ContentType
  itemUuid: Uuid
  sharedVaultUuid: Uuid | null
  dates: Dates
}
