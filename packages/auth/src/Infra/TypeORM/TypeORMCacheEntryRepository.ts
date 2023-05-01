import { MapperInterface } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'
import { CacheEntry } from '../../Domain/Cache/CacheEntry'
import { CacheEntryRepositoryInterface } from '../../Domain/Cache/CacheEntryRepositoryInterface'
import { TypeORMCacheEntry } from './TypeORMCacheEntry'

export class TypeORMCacheEntryRepository implements CacheEntryRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMCacheEntry>,
    private mapper: MapperInterface<CacheEntry, TypeORMCacheEntry>,
  ) {}

  async save(cacheEntry: CacheEntry): Promise<void> {
    const persistence = this.mapper.toProjection(cacheEntry)

    await this.ormRepository.save(persistence)
  }

  async findUnexpiredOneByKey(key: string): Promise<CacheEntry | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('cache')
      .where('cache.key = :key', {
        key,
      })
      .andWhere('cache.expires_at > :now', {
        now: new Date(),
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async removeByKey(key: string): Promise<void> {
    await this.ormRepository.createQueryBuilder().delete().where('key = :key', { key }).execute()
  }
}
