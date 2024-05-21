export interface LockRepositoryInterface {
  resetLockCounter(userIdentifier: string): Promise<void>
  updateLockCounter(userIdentifier: string, counter: number, mode: 'captcha' | 'non-captcha'): Promise<void>
  getLockCounter(userIdentifier: string, mode: 'captcha' | 'non-captcha'): Promise<number>
  isUserLocked(userIdentifier: string): Promise<boolean>
  lockSuccessfullOTP(userIdentifier: string, otp: string): Promise<void>
  isOTPLocked(userIdentifier: string, otp: string): Promise<boolean>
}
