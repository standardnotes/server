import { Uuid } from '@standardnotes/domain-core'
import { Authenticator } from './Authenticator'

export interface AuthenticatorRepositoryInterface {
  findByUserUuid(userUuid: Uuid): Promise<Authenticator[]>
  findByUserUuidAndCredentialId(userUuid: Uuid, credentialId: Buffer): Promise<Authenticator | null>
  save(authenticator: Authenticator): Promise<void>
}
