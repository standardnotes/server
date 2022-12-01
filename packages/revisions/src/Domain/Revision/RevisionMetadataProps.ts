import { Dates } from '@standardnotes/domain-core'

import { ContentType } from './ContentType'

export interface RevisionMetadataProps {
  contentType: ContentType
  dates: Dates
}
