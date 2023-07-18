import { Uuid } from '@standardnotes/domain-core'

import { KeySystemAssociation } from './KeySystemAssociation'

export interface KeySystemAssociationRepositoryInterface {
  save(keySystem: KeySystemAssociation): Promise<void>
  remove(keySystem: KeySystemAssociation): Promise<void>
  findByItemUuid(itemUuid: Uuid): Promise<KeySystemAssociation | null>
}
