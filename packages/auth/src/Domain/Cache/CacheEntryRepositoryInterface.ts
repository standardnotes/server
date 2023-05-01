import { CacheEntry } from './CacheEntry'

export interface CacheEntryRepositoryInterface {
  save(cacheEntry: CacheEntry): Promise<CacheEntry>
  findOneByKey(key: string): Promise<CacheEntry | null>
}
