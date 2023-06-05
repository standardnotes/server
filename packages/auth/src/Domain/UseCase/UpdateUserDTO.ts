import { User } from '../User/User'

export type UpdateUserDTO = {
  user: User
  apiVersion: string
  updatedWithUserAgent: string
  publicKey: string
  encryptedPrivateKey: string
  signingPublicKey: string
  encryptedSigningPrivateKey: string
}
