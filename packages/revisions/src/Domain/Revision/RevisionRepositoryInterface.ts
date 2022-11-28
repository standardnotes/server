import { Uuid } from '@standardnotes/domain-core'

import { Revision } from './Revision'
import { RevisionMetadata } from './RevisionMetadata'

export interface RevisionRepositoryInterface {
  removeByUserUuid(userUuid: Uuid): Promise<void>
  removeOneByUuid(revisionUuid: Uuid, userUuid: Uuid): Promise<void>
  findOneByUuid(revisionUuid: Uuid, userUuid: Uuid): Promise<Revision | null>
  findByItemUuid(itemUuid: Uuid): Promise<Array<Revision>>
  findMetadataByItemId(itemUuid: Uuid, userUuid: Uuid): Promise<Array<RevisionMetadata>>
  save(revision: Revision): Promise<Revision>
}
