import { MapperInterface, Uuid } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'

import { AuthenticatorChallenge } from '../../Domain/Authenticator/AuthenticatorChallenge'
import { AuthenticatorChallengeRepositoryInterface } from '../../Domain/Authenticator/AuthenticatorChallengeRepositoryInterface'

import { TypeORMAuthenticatorChallenge } from './TypeORMAuthenticatorChallenge'

export class TypeORMAuthenticatorChallengeRepository implements AuthenticatorChallengeRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMAuthenticatorChallenge>,
    private mapper: MapperInterface<AuthenticatorChallenge, TypeORMAuthenticatorChallenge>,
  ) {}

  async save(authenticatorChallenge: AuthenticatorChallenge): Promise<void> {
    let persistence = this.mapper.toProjection(authenticatorChallenge)

    const existing = await this.findByUserUuid(authenticatorChallenge.props.userUuid)
    if (existing !== null) {
      existing.props.challenge = authenticatorChallenge.props.challenge
      existing.props.createdAt = authenticatorChallenge.props.createdAt

      persistence = this.mapper.toProjection(existing)
    }

    await this.ormRepository.save(persistence)
  }

  async findByUserUuid(userUuid: Uuid): Promise<AuthenticatorChallenge | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('challenge')
      .where('challenge.user_uuid = :userUuid', {
        userUuid: userUuid.value,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }
}
