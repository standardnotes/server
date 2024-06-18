import { CacheEntryRepositoryInterface, CacheEntry } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { LockRepositoryInterface } from '../../Domain/User/LockRepositoryInterface'

export class TypeORMLockRepository implements LockRepositoryInterface {
  private readonly PREFIX = 'lock'
  private readonly CAPTCHA_PREFIX = 'captcha-lock'
  private readonly OTP_PREFIX = 'otp-lock'

  constructor(
    private cacheEntryRepository: CacheEntryRepositoryInterface,
    private timer: TimerInterface,
    private maxLoginAttempts: number,
    private nonCaptchaLockTTL: number,
    private captchaLockTTL: number,
  ) {}

  async lockSuccessfullOTP(userIdentifier: string, otp: string): Promise<void> {
    const cacheEntryOrError = CacheEntry.create({
      key: `${this.OTP_PREFIX}:${userIdentifier}`,
      value: otp,
      expiresAt: this.timer.getUTCDateNSecondsAhead(60),
    })
    if (cacheEntryOrError.isFailed()) {
      throw new Error('Could not create cache entry')
    }

    await this.cacheEntryRepository.save(cacheEntryOrError.getValue())
  }

  async isOTPLocked(userIdentifier: string, otp: string): Promise<boolean> {
    const lock = await this.cacheEntryRepository.findUnexpiredOneByKey(`${this.OTP_PREFIX}:${userIdentifier}`)
    if (!lock) {
      return false
    }

    return lock.props.value === otp
  }

  async resetLockCounter(userIdentifier: string): Promise<void> {
    await this.cacheEntryRepository.removeByKey(`${this.PREFIX}:${userIdentifier}`)
    await this.cacheEntryRepository.removeByKey(`${this.CAPTCHA_PREFIX}:${userIdentifier}`)
  }

  async updateLockCounter(userIdentifier: string, counter: number, mode: 'captcha' | 'non-captcha'): Promise<void> {
    const prefix = mode === 'captcha' ? this.CAPTCHA_PREFIX : this.PREFIX
    const lockTTL = mode === 'captcha' ? this.captchaLockTTL : this.nonCaptchaLockTTL

    let cacheEntry = await this.cacheEntryRepository.findUnexpiredOneByKey(`${prefix}:${userIdentifier}`)
    if (!cacheEntry) {
      cacheEntry = CacheEntry.create({
        key: `${prefix}:${userIdentifier}`,
        value: counter.toString(),
        expiresAt: this.timer.getUTCDateNSecondsAhead(lockTTL),
      }).getValue()
    } else {
      cacheEntry.props.value = counter.toString()
      cacheEntry.props.expiresAt = this.timer.getUTCDateNSecondsAhead(lockTTL)
    }

    await this.cacheEntryRepository.save(cacheEntry)
  }

  async getLockCounter(userIdentifier: string, mode: 'captcha' | 'non-captcha'): Promise<number> {
    const prefix = mode === 'captcha' ? this.CAPTCHA_PREFIX : this.PREFIX

    const counter = await this.cacheEntryRepository.findUnexpiredOneByKey(`${prefix}:${userIdentifier}`)

    if (!counter) {
      return 0
    }

    return +counter.props.value
  }

  async isUserLocked(userIdentifier: string): Promise<boolean> {
    const counter = await this.getLockCounter(userIdentifier, 'captcha')

    return counter >= this.maxLoginAttempts
  }
}
