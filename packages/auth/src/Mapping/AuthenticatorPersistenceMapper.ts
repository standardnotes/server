import { Dates, MapperInterface, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { Authenticator } from '../Domain/Authenticator/Authenticator'
import { TypeORMAuthenticator } from '../Infra/TypeORM/TypeORMAuthenticator'

export class AuthenticatorPersistenceMapper implements MapperInterface<Authenticator, TypeORMAuthenticator> {
  toDomain(projection: TypeORMAuthenticator): Authenticator {
    const userUuidOrError = Uuid.create(projection.userUuid)
    if (userUuidOrError.isFailed()) {
      throw new Error(`Failed to create authenticator from projection: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const datesOrError = Dates.create(projection.createdAt, projection.updatedAt)
    if (datesOrError.isFailed()) {
      throw new Error(`Failed to create authenticator from projection: ${datesOrError.getError()}`)
    }
    const dates = datesOrError.getValue()

    const authenticatorOrError = Authenticator.create(
      {
        userUuid,
        name: projection.name,
        counter: projection.counter,
        credentialBackedUp: projection.credentialBackedUp,
        credentialDeviceType: projection.credentialDeviceType,
        credentialId: projection.credentialId,
        credentialPublicKey: projection.credentialPublicKey,
        dates,
        transports: projection.transports ? JSON.parse(projection.transports) : undefined,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (authenticatorOrError.isFailed()) {
      throw new Error(`Failed to create authenticator from projection: ${authenticatorOrError.getError()}`)
    }
    const authenticator = authenticatorOrError.getValue()

    return authenticator
  }

  toProjection(domain: Authenticator): TypeORMAuthenticator {
    const typeorm = new TypeORMAuthenticator()

    typeorm.uuid = domain.id.toString()
    typeorm.name = domain.props.name
    typeorm.userUuid = domain.props.userUuid.value
    typeorm.credentialId = Buffer.from(domain.props.credentialId.buffer)
    typeorm.credentialPublicKey = Buffer.from(domain.props.credentialPublicKey.buffer)
    typeorm.counter = domain.props.counter
    typeorm.credentialDeviceType = domain.props.credentialDeviceType
    typeorm.credentialBackedUp = domain.props.credentialBackedUp
    if (domain.props.transports) {
      typeorm.transports = JSON.stringify(domain.props.transports)
    }
    typeorm.createdAt = domain.props.dates.createdAt
    typeorm.updatedAt = domain.props.dates.updatedAt

    return typeorm
  }
}
