import { MapperInterface } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'

import { AuthenticatorChallenge } from '../../Domain/Authenticator/AuthenticatorChallenge'
import { AuthenticatorChallengeRepositoryInterface } from '../../Domain/Authenticator/AuthenticatorChallengeRepositoryInterface'

import { TypeORMAuthenticatorChallenge } from '../TypeORM/TypeORMAuthenticatorChallenge'

export class MySQLAuthenticatorChallengeRepository implements AuthenticatorChallengeRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMAuthenticatorChallenge>,
    private mapper: MapperInterface<AuthenticatorChallenge, TypeORMAuthenticatorChallenge>,
  ) {}

  async save(authenticatorChallenge: AuthenticatorChallenge): Promise<void> {
    const persistence = this.mapper.toProjection(authenticatorChallenge)

    await this.ormRepository.save(persistence)
  }
}
