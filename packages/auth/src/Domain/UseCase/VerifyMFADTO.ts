export type VerifyMFADTO = {
  email: string
  requestParams: Record<string, unknown>
  preventOTPFromFurtherUsage: boolean
}
