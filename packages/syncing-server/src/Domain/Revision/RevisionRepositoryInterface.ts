import { Revision } from './Revision'
import { RevisionMetadata } from './RevisionMetadata'

export interface RevisionRepositoryInterface {
  findByItemId(parameters: { itemUuid: string; afterDate?: Date }): Promise<Array<Revision>>
  findOneById(itemId: string, id: string): Promise<Revision | null>
  save(revision: Revision): Promise<Revision>
  removeByUuid(itemUuid: string, revisionUuid: string): Promise<void>
  findMetadataByItemId(itemUuid: string): Promise<Array<RevisionMetadata>>
}
