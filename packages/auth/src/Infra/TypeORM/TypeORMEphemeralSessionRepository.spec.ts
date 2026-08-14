import { CacheEntry, CacheEntryRepositoryInterface } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { EphemeralSession } from '../../Domain/Session/EphemeralSession'
import { TypeORMEphemeralSessionRepository } from './TypeORMEphemeralSessionRepository'

describe('TypeORMEphemeralSessionRepository', () => {
  let cacheEntryRepository: jest.Mocked<CacheEntryRepositoryInterface>
  let timer: jest.Mocked<TimerInterface>
  let repository: TypeORMEphemeralSessionRepository

  beforeEach(() => {
    cacheEntryRepository = {
      findUnexpiredOneByKey: jest.fn(),
      removeByKey: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<CacheEntryRepositoryInterface>

    timer = {} as jest.Mocked<TimerInterface>

    repository = new TypeORMEphemeralSessionRepository(cacheEntryRepository, 3600, timer)
  })

  describe('deleteOne', () => {
    it('should delete private identifier mapping when revoking a session', async () => {
      const session = {
        uuid: 'session-uuid',
        userUuid: 'user-uuid',
        privateIdentifier: 'private-id',
      } as EphemeralSession

      cacheEntryRepository.findUnexpiredOneByKey.mockResolvedValueOnce(
        CacheEntry.create({
          key: 'session:session-uuid:user-uuid',
          value: JSON.stringify(session),
          expiresAt: new Date(),
        }).getValue(),
      )

      await repository.deleteOne('session-uuid', 'user-uuid')

      expect(cacheEntryRepository.removeByKey).toHaveBeenCalledWith('session:session-uuid')
      expect(cacheEntryRepository.removeByKey).toHaveBeenCalledWith('session:session-uuid:user-uuid')
      expect(cacheEntryRepository.removeByKey).toHaveBeenCalledWith('session-private-id:private-id')
    })

    it('should skip private identifier deletion when session is not found', async () => {
      cacheEntryRepository.findUnexpiredOneByKey.mockResolvedValueOnce(null)

      await repository.deleteOne('session-uuid', 'user-uuid')

      expect(cacheEntryRepository.removeByKey).toHaveBeenCalledWith('session:session-uuid')
      expect(cacheEntryRepository.removeByKey).toHaveBeenCalledWith('session:session-uuid:user-uuid')
      expect(cacheEntryRepository.removeByKey).not.toHaveBeenCalledWith(expect.stringContaining('session-private-id'))
    })
  })
})
