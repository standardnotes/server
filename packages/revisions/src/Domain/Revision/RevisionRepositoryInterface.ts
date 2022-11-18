import { Uuid, RevisionMetadata } from '@standardnotes/domain-core'

export interface RevisionRepositoryInterface {
  findMetadataByItemId(itemUuid: Uuid): Promise<Array<RevisionMetadata>>
}
