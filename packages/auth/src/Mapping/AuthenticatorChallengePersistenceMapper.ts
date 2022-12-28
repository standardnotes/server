import { MapperInterface, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { AuthenticatorChallenge } from '../Domain/Authenticator/AuthenticatorChallenge'
import { TypeORMAuthenticatorChallenge } from '../Infra/TypeORM/TypeORMAuthenticatorChallenge'

export class AuthenticatorChallengePersistenceMapper
  implements MapperInterface<AuthenticatorChallenge, TypeORMAuthenticatorChallenge>
{
  toDomain(projection: TypeORMAuthenticatorChallenge): AuthenticatorChallenge {
    const userUuidOrError = Uuid.create(projection.userUuid)
    if (userUuidOrError.isFailed()) {
      throw new Error(`Failed to create authenticator challenge from projection: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const authenticatorChallengeOrError = AuthenticatorChallenge.create(
      {
        challenge: projection.challenge,
        userUuid,
        createdAt: projection.createdAt,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (authenticatorChallengeOrError.isFailed()) {
      throw new Error(
        `Failed to create authenticator challenge from projection: ${authenticatorChallengeOrError.getError()}`,
      )
    }
    const authenticatorChallenge = authenticatorChallengeOrError.getValue()

    return authenticatorChallenge
  }

  toProjection(domain: AuthenticatorChallenge): TypeORMAuthenticatorChallenge {
    const typeorm = new TypeORMAuthenticatorChallenge()

    typeorm.uuid = domain.id.toString()
    typeorm.userUuid = domain.props.userUuid.value
    typeorm.challenge = domain.props.challenge
    typeorm.createdAt = domain.props.createdAt

    return typeorm
  }
}
