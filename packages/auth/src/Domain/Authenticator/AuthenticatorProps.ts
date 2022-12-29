import { Dates, Uuid } from '@standardnotes/domain-core'

export interface AuthenticatorProps {
  name: string
  userUuid: Uuid
  credentialId: Buffer
  credentialPublicKey: Buffer
  counter: number
  credentialDeviceType: string
  credentialBackedUp: boolean
  transports?: string[]
  dates: Dates
}
