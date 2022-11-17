import { Uuid } from '../Common/Uuid'
import { ContentType } from './ContentType'

export interface RevisionProps {
  itemUuid: Uuid
  content: string | null
  contentType: ContentType
  itemsKeyId: string | null
  encItemKey: string | null
  authHash: string | null
  creationDate: Date
  createdAt: Date
  updatedAt: Date
}
