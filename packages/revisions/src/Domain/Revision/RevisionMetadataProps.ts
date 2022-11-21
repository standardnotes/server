import { Timestamps } from '@standardnotes/domain-core'

import { ContentType } from './ContentType'

export interface RevisionMetadataProps {
  contentType: ContentType
  timestamps: Timestamps
}
