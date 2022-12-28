import { Uuid } from '@standardnotes/domain-core'
import { Authenticator } from './Authenticator'

export interface AuthenticatorRepositoryInterface {
  findByUserUuid(userUuid: Uuid): Promise<Authenticator[]>
  save(authenticator: Authenticator): Promise<void>
}
