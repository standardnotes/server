import { Uuid } from '@standardnotes/domain-core'

export interface AuthenticatorProps {
  userUuid: Uuid
  credentialId: Buffer
  credentialPublicKey: Buffer
  counter: number
  credentialDeviceType: string
  credentialBackedUp: boolean
  transports?: string[]
}
