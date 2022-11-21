import { Uuid } from '@standardnotes/domain-core'

import { RevisionMetadata } from './RevisionMetadata'

export interface RevisionRepositoryInterface {
  findMetadataByItemId(itemUuid: Uuid): Promise<Array<RevisionMetadata>>
}
