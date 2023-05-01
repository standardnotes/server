import { MapperInterface, UniqueEntityId } from '@standardnotes/domain-core'

import { CacheEntry } from '../Domain/Cache/CacheEntry'
import { TypeORMCacheEntry } from '../Infra/TypeORM/TypeORMCacheEntry'

export class CacheEntryPersistenceMapper implements MapperInterface<CacheEntry, TypeORMCacheEntry> {
  toDomain(projection: TypeORMCacheEntry): CacheEntry {
    const cacheEntryOrError = CacheEntry.create(
      {
        key: projection.key,
        value: projection.value,
        expiresAt: projection.expiresAt,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (cacheEntryOrError.isFailed()) {
      throw new Error(`CacheEntryPersistenceMapper.toDomain: ${cacheEntryOrError.getError()}`)
    }

    return cacheEntryOrError.getValue()
  }

  toProjection(domain: CacheEntry): TypeORMCacheEntry {
    const typeorm = new TypeORMCacheEntry()

    typeorm.uuid = domain.id.toString()
    typeorm.key = domain.props.key
    typeorm.value = domain.props.value
    typeorm.expiresAt = domain.props.expiresAt

    return typeorm
  }
}
