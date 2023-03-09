import { Dates, Uuid } from '@standardnotes/domain-core'

export interface AuthenticatorProps {
  userUuid: Uuid
  credentialId: Uint8Array
  credentialPublicKey: Uint8Array
  counter: number
  credentialDeviceType: string
  credentialBackedUp: boolean
  transports?: string[]
  dates: Dates
}
