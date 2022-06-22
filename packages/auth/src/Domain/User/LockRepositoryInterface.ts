export interface LockRepositoryInterface {
  resetLockCounter(userIdentifier: string): Promise<void>
  updateLockCounter(userIdentifier: string, counter: number): Promise<void>
  getLockCounter(userIdentifier: string): Promise<number>
  lockUser(userIdentifier: string): Promise<void>
  isUserLocked(userIdentifier: string): Promise<boolean>
  lockSuccessfullOTP(userIdentifier: string, otp: string): Promise<void>
  isOTPLocked(userIdentifier: string, otp: string): Promise<boolean>
}
