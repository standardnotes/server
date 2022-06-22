import { SessionBody } from '@standardnotes/responses'

export type RefreshSessionTokenResponse = {
  success: boolean
  userUuid?: string
  errorTag?: string
  errorMessage?: string
  sessionPayload?: SessionBody
}
