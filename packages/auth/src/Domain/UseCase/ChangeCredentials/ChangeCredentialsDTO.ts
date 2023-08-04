import { Username } from '@standardnotes/domain-core'

export type ChangeCredentialsDTO = {
  username: Username
  apiVersion: string
  currentPassword: string
  newPassword: string
  currentSessionUuid: string
  newEmail?: string
  pwNonce: string
  updatedWithUserAgent: string
  protocolVersion?: string
  kpOrigination?: string
  kpCreated?: string
}
