export type VerifyMFAResponse = {
  success: boolean
  errorTag?: string
  errorMessage?: string
  errorPayload?: Record<string, unknown>
}
