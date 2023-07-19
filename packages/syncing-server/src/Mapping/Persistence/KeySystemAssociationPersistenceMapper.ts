import { MapperInterface, Timestamps, UniqueEntityId, Uuid, Validator } from '@standardnotes/domain-core'

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

    const keySystemIdentifiedValidationResult = Validator.isNotEmptyString(projection.keySystemIdentifier)
    if (keySystemIdentifiedValidationResult.isFailed()) {
      throw new Error(`Failed to create key system from projection: ${keySystemIdentifiedValidationResult.getError()}`)
    }

    const timestampsOrError = Timestamps.create(projection.createdAtTimestamp, projection.updatedAtTimestamp)
    if (timestampsOrError.isFailed()) {
      throw new Error(`Failed to create key system from projection: ${timestampsOrError.getError()}`)
    }
    const timestamps = timestampsOrError.getValue()

    const keySystemOrError = KeySystemAssociation.create(
      {
        itemUuid,
        timestamps,
        keySystemIdentifier: projection.keySystemIdentifier,
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
    typeorm.keySystemIdentifier = domain.props.keySystemIdentifier
    typeorm.createdAtTimestamp = domain.props.timestamps.createdAt
    typeorm.updatedAtTimestamp = domain.props.timestamps.updatedAt

    return typeorm
  }
}
