import { User } from '../../User/User'

export type ChangeCredentialsDTO = {
  user: User
  apiVersion: string
  currentPassword: string
  newPassword: string
  newEmail?: string
  pwNonce: string
  updatedWithUserAgent: string
  protocolVersion?: string
  kpOrigination?: string
  kpCreated?: string
  publicKey?: string
  signingPublicKey?: string
}
