import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { CacheEntryProps } from './CacheEntryProps'

export class CacheEntry extends Entity<CacheEntryProps> {
  get id(): UniqueEntityId {
    return this._id
  }

  private constructor(props: CacheEntryProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: CacheEntryProps, id?: UniqueEntityId): Result<CacheEntry> {
    return Result.ok<CacheEntry>(new CacheEntry(props, id))
  }
}
