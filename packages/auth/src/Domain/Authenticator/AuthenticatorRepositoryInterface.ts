import { UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { Authenticator } from './Authenticator'

export interface AuthenticatorRepositoryInterface {
  findByUserUuid(userUuid: Uuid): Promise<Authenticator[]>
  findById(id: UniqueEntityId): Promise<Authenticator | null>
  findByUserUuidAndCredentialId(userUuid: Uuid, credentialId: string): Promise<Authenticator | null>
  save(authenticator: Authenticator): Promise<void>
  remove(authenticator: Authenticator): Promise<void>
  removeByUserUuid(userUuid: Uuid): Promise<void>
}
