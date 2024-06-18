import * as IORedis from 'ioredis'

import { LockRepositoryInterface } from '../../Domain/User/LockRepositoryInterface'

export class RedisLockRepository implements LockRepositoryInterface {
  private readonly PREFIX = 'lock'
  private readonly CAPTCHA_PREFIX = 'captcha-lock'
  private readonly OTP_PREFIX = 'otp-lock'

  constructor(
    private redisClient: IORedis.Redis,
    private maxLoginAttempts: number,
    private nonCaptchaLockTTL: number,
    private captchaLockTTL: number,
  ) {}

  async lockSuccessfullOTP(userIdentifier: string, otp: string): Promise<void> {
    await this.redisClient.setex(`${this.OTP_PREFIX}:${userIdentifier}`, 60, otp)
  }

  async isOTPLocked(userIdentifier: string, otp: string): Promise<boolean> {
    const lock = await this.redisClient.get(`${this.OTP_PREFIX}:${userIdentifier}`)

    return lock === otp
  }

  async resetLockCounter(userIdentifier: string): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    pipeline.del(`${this.PREFIX}:${userIdentifier}`)
    pipeline.del(`${this.CAPTCHA_PREFIX}:${userIdentifier}`)

    await pipeline.exec()
  }

  async updateLockCounter(userIdentifier: string, counter: number, mode: 'captcha' | 'non-captcha'): Promise<void> {
    const prefix = mode === 'captcha' ? this.CAPTCHA_PREFIX : this.PREFIX
    const lockTTL = mode === 'captcha' ? this.captchaLockTTL : this.nonCaptchaLockTTL

    await this.redisClient.setex(`${prefix}:${userIdentifier}`, lockTTL, counter)
  }

  async getLockCounter(userIdentifier: string, mode: 'captcha' | 'non-captcha'): Promise<number> {
    const prefix = mode === 'captcha' ? this.CAPTCHA_PREFIX : this.PREFIX

    const counter = await this.redisClient.get(`${prefix}:${userIdentifier}`)

    if (!counter) {
      return 0
    }

    return +counter
  }

  async isUserLocked(userIdentifier: string): Promise<boolean> {
    const counter = await this.getLockCounter(userIdentifier, 'captcha')

    return counter >= this.maxLoginAttempts
  }
}
