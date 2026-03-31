import { RedisMfaSecretRepository } from './RedisMfaSecretRepository'
import * as IORedis from 'ioredis'

describe('RedisMfaSecretRepository', () => {
  let redisClient: jest.Mocked<IORedis.Redis>
  let repository: RedisMfaSecretRepository

  beforeEach(() => {
    redisClient = {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
    } as unknown as jest.Mocked<IORedis.Redis>

    repository = new RedisMfaSecretRepository(redisClient)
  })

  describe('getMfaSecret', () => {
    it('should return the cached secret for a user', async () => {
      const userUuid = 'user-123'
      const secret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

      redisClient.get.mockResolvedValue(secret)

      const result = await repository.getMfaSecret(userUuid)

      expect(result).toEqual(secret)
      expect(redisClient.get).toHaveBeenCalledWith('mfa-secret:user-123')
    })

    it('should return null when no secret is cached', async () => {
      const userUuid = 'user-123'

      redisClient.get.mockResolvedValue(null)

      const result = await repository.getMfaSecret(userUuid)

      expect(result).toBeNull()
      expect(redisClient.get).toHaveBeenCalledWith('mfa-secret:user-123')
    })
  })

  describe('setMfaSecret', () => {
    it('should cache the secret with default TTL', async () => {
      const userUuid = 'user-123'
      const secret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

      await repository.setMfaSecret(userUuid, secret)

      expect(redisClient.setex).toHaveBeenCalledWith('mfa-secret:user-123', 300, secret)
    })

    it('should cache the secret with custom TTL', async () => {
      const userUuid = 'user-123'
      const secret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
      const customTtl = 600

      await repository.setMfaSecret(userUuid, secret, customTtl)

      expect(redisClient.setex).toHaveBeenCalledWith('mfa-secret:user-123', 600, secret)
    })
  })

  describe('deleteMfaSecret', () => {
    it('should delete the cached secret', async () => {
      const userUuid = 'user-123'

      await repository.deleteMfaSecret(userUuid)

      expect(redisClient.del).toHaveBeenCalledWith('mfa-secret:user-123')
    })
  })
})
