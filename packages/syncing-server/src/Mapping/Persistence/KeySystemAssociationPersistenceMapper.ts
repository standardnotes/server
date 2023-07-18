import { MapperInterface, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { KeySystemAssociation } from '../../Domain/KeySystem/KeySystemAssociation'

import { TypeORMKeySystemAssociation } from '../../Infra/TypeORM/TypeORMKeySystemAssociation'

export class KeySystemAssociationPersistenceMapper
  implements MapperInterface<KeySystemAssociation, TypeORMKeySystemAssociation>
{
  toDomain(projection: TypeORMKeySystemAssociation): KeySystemAssociation {
    const itemUuidOrError = Uuid.create(projection.itemUuid)
    if (itemUuidOrError.isFailed()) {
      throw new Error(`Failed to create key system from projection: ${itemUuidOrError.getError()}`)
    }
    const itemUuid = itemUuidOrError.getValue()

    const keySystemUuidOrError = Uuid.create(projection.keySystemUuid)
    if (keySystemUuidOrError.isFailed()) {
      throw new Error(`Failed to create key system from projection: ${keySystemUuidOrError.getError()}`)
    }
    const keySystemUuid = keySystemUuidOrError.getValue()

    const timestampsOrError = Timestamps.create(projection.createdAtTimestamp, projection.updatedAtTimestamp)
    if (timestampsOrError.isFailed()) {
      throw new Error(`Failed to create key system from projection: ${timestampsOrError.getError()}`)
    }
    const timestamps = timestampsOrError.getValue()

    const keySystemOrError = KeySystemAssociation.create(
      {
        itemUuid,
        timestamps,
        keySystemUuid,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (keySystemOrError.isFailed()) {
      throw new Error(`Failed to create key system from projection: ${keySystemOrError.getError()}`)
    }

    const keySystem = keySystemOrError.getValue()

    return keySystem
  }

  toProjection(domain: KeySystemAssociation): TypeORMKeySystemAssociation {
    const typeorm = new TypeORMKeySystemAssociation()

    typeorm.uuid = domain.id.toString()
    typeorm.itemUuid = domain.props.itemUuid.value
    typeorm.keySystemUuid = domain.props.keySystemUuid.value
    typeorm.createdAtTimestamp = domain.props.timestamps.createdAt
    typeorm.updatedAtTimestamp = domain.props.timestamps.updatedAt

    return typeorm
  }
}
