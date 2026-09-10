import * as IORedis from 'ioredis'

import { EphemeralSession } from '../../Domain/Session/EphemeralSession'
import { RedisEphemeralSessionRepository } from './RedisEphemeralSessionRepository'

describe('RedisEphemeralSessionRepository', () => {
  let redisClient: jest.Mocked<IORedis.Redis>
  let pipeline: {
    del: jest.Mock
    srem: jest.Mock
    exec: jest.Mock
  }
  let repository: RedisEphemeralSessionRepository

  beforeEach(() => {
    pipeline = {
      del: jest.fn().mockReturnThis(),
      srem: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    }

    redisClient = {
      get: jest.fn(),
      pipeline: jest.fn().mockReturnValue(pipeline),
    } as unknown as jest.Mocked<IORedis.Redis>

    repository = new RedisEphemeralSessionRepository(redisClient, 3600)
  })

  describe('deleteOne', () => {
    it('should delete private identifier mapping when revoking a session', async () => {
      const session = {
        uuid: 'session-uuid',
        userUuid: 'user-uuid',
        privateIdentifier: 'private-id',
      } as EphemeralSession

      redisClient.get.mockResolvedValue(JSON.stringify(session))

      await repository.deleteOne('session-uuid', 'user-uuid')

      expect(redisClient.get).toHaveBeenCalledWith('session:session-uuid:user-uuid')
      expect(pipeline.del).toHaveBeenCalledWith('session:session-uuid')
      expect(pipeline.del).toHaveBeenCalledWith('session:session-uuid:user-uuid')
      expect(pipeline.del).toHaveBeenCalledWith('session-private-id:private-id')
      expect(pipeline.srem).toHaveBeenCalledWith('user-sessions:user-uuid', 'session-uuid')
      expect(pipeline.exec).toHaveBeenCalled()
    })

    it('should skip private identifier deletion when session is not found', async () => {
      redisClient.get.mockResolvedValue(null)

      await repository.deleteOne('session-uuid', 'user-uuid')

      expect(pipeline.del).toHaveBeenCalledWith('session:session-uuid')
      expect(pipeline.del).toHaveBeenCalledWith('session:session-uuid:user-uuid')
      expect(pipeline.del).not.toHaveBeenCalledWith(expect.stringContaining('session-private-id'))
    })
  })
})
