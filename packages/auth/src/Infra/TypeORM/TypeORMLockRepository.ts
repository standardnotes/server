import { CacheEntryRepositoryInterface, CacheEntry } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { LockRepositoryInterface } from '../../Domain/User/LockRepositoryInterface'

export class TypeORMLockRepository implements LockRepositoryInterface {
  private readonly PREFIX = 'lock'
  private readonly OTP_PREFIX = 'otp-lock'

  constructor(
    private cacheEntryRepository: CacheEntryRepositoryInterface,
    private timer: TimerInterface,
    private maxLoginAttempts: number,
    private failedLoginLockout: number,
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
  }

  async updateLockCounter(userIdentifier: string, counter: number): Promise<void> {
    let cacheEntry = await this.cacheEntryRepository.findUnexpiredOneByKey(`${this.PREFIX}:${userIdentifier}`)
    if (!cacheEntry) {
      cacheEntry = CacheEntry.create({
        key: `${this.PREFIX}:${userIdentifier}`,
        value: counter.toString(),
        expiresAt: this.timer.getUTCDateNSecondsAhead(this.failedLoginLockout),
      }).getValue()
    } else {
      cacheEntry.props.value = counter.toString()
      cacheEntry.props.expiresAt = this.timer.getUTCDateNSecondsAhead(this.failedLoginLockout)
    }

    await this.cacheEntryRepository.save(cacheEntry)
  }

  async getLockCounter(userIdentifier: string): Promise<number> {
    const counter = await this.cacheEntryRepository.findUnexpiredOneByKey(`${this.PREFIX}:${userIdentifier}`)

    if (!counter) {
      return 0
    }

    return +counter.props.value
  }

  async lockUser(userIdentifier: string): Promise<void> {
    const cacheEntry = await this.cacheEntryRepository.findUnexpiredOneByKey(`${this.PREFIX}:${userIdentifier}`)
    if (cacheEntry !== null) {
      cacheEntry.props.expiresAt = this.timer.getUTCDateNSecondsAhead(this.failedLoginLockout)

      await this.cacheEntryRepository.save(cacheEntry)
    }
  }

  async isUserLocked(userIdentifier: string): Promise<boolean> {
    const counter = await this.getLockCounter(userIdentifier)

    return counter >= this.maxLoginAttempts
  }
}
