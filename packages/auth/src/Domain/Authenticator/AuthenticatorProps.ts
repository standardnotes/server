export interface AuthenticatorProps {
  credentialId: Buffer
  credentialPublicKey: Buffer
  counter: number
  credentialDeviceType: string
  credentialBackedUp: boolean
  transports?: string[]
}
