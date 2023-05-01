import { CacheEntry } from './CacheEntry'

export interface CacheEntryRepositoryInterface {
  save(cacheEntry: CacheEntry): Promise<void>
  findUnexpiredOneByKey(key: string): Promise<CacheEntry | null>
  removeByKey(key: string): Promise<void>
}
