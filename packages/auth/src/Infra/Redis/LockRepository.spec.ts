import 'reflect-metadata'

import * as IORedis from 'ioredis'
import { LockRepository } from './LockRepository'

describe('LockRepository', () => {
  let redisClient: IORedis.Redis
  const maxLoginAttempts = 3
  const failedLoginLockout = 120

  const createRepository = () => new LockRepository(redisClient, maxLoginAttempts, failedLoginLockout)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.expire = jest.fn()
    redisClient.del = jest.fn()
    redisClient.get = jest.fn()
    redisClient.setex = jest.fn()
  })

  it('should lock a successfully used OTP for the lockout period', async () => {
    await createRepository().lockSuccessfullOTP('test@test.te', '123456')

    expect(redisClient.setex).toHaveBeenCalledWith('otp-lock:test@test.te', 60, '123456')
  })

  it('should indicate if an OTP was already used in the lockout period', async () => {
    redisClient.get = jest.fn().mockReturnValue('123456')

    expect(await createRepository().isOTPLocked('test@test.te', '123456')).toEqual(true)
  })

  it('should indicate if an OTP was not already used in the lockout period', async () => {
    redisClient.get = jest.fn().mockReturnValue('654321')

    expect(await createRepository().isOTPLocked('test@test.te', '123456')).toEqual(false)
  })

  it('should lock a user for the lockout period', async () => {
    await createRepository().lockUser('123')

    expect(redisClient.expire).toHaveBeenCalledWith('lock:123', 120)
  })

  it('should tell a user is locked if his counter is above threshold', async () => {
    redisClient.get = jest.fn().mockReturnValue('4')

    expect(await createRepository().isUserLocked('123')).toBeTruthy()
  })

  it('should tell a user is locked if his counter is at the threshold', async () => {
    redisClient.get = jest.fn().mockReturnValue('3')

    expect(await createRepository().isUserLocked('123')).toBeTruthy()
  })

  it('should tell a user is not locked if his counter is below threshold', async () => {
    redisClient.get = jest.fn().mockReturnValue('2')

    expect(await createRepository().isUserLocked('123')).toBeFalsy()
  })

  it('should tell a user is not locked if he has no counter', async () => {
    redisClient.get = jest.fn().mockReturnValue(null)

    expect(await createRepository().isUserLocked('123')).toBeFalsy()
  })

  it('should tell what the user lock counter is', async () => {
    redisClient.get = jest.fn().mockReturnValue('3')

    expect(await createRepository().getLockCounter('123')).toStrictEqual(3)
  })

  it('should tell that the user lock counter is 0 when there is no counter', async () => {
    redisClient.get = jest.fn().mockReturnValue(null)

    expect(await createRepository().getLockCounter('123')).toStrictEqual(0)
  })

  it('should reset a lock counter', async () => {
    await createRepository().resetLockCounter('123')

    expect(redisClient.del).toHaveBeenCalledWith('lock:123')
  })

  it('should update a lock counter', async () => {
    await createRepository().updateLockCounter('123', 3)

    expect(redisClient.setex).toHaveBeenCalledWith('lock:123', 120, 3)
  })
})
