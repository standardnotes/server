import { ContentType, Dates } from '@standardnotes/domain-core'

export interface RevisionMetadataProps {
  contentType: ContentType
  sharedVaultUuid: string | null
  dates: Dates
}
