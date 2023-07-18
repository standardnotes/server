import { MapperInterface, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { TypeORMSharedVaultAssociation } from '../../Infra/TypeORM/TypeORMSharedVaultAssociation'
import { SharedVaultAssociation } from '../../Domain/SharedVault/SharedVaultAssociation'

export class SharedVaultAssociationPersistenceMapper
  implements MapperInterface<SharedVaultAssociation, TypeORMSharedVaultAssociation>
{
  toDomain(projection: TypeORMSharedVaultAssociation): SharedVaultAssociation {
    const itemUuidOrError = Uuid.create(projection.itemUuid)
    if (itemUuidOrError.isFailed()) {
      throw new Error(`Failed to create shared vault association from projection: ${itemUuidOrError.getError()}`)
    }
    const itemUuid = itemUuidOrError.getValue()

    const sharedVaultUuidOrError = Uuid.create(projection.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      throw new Error(`Failed to create shared vault association from projection: ${sharedVaultUuidOrError.getError()}`)
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const lastEditedByOrError = Uuid.create(projection.lastEditedBy)
    if (lastEditedByOrError.isFailed()) {
      throw new Error(`Failed to create shared vault association from projection: ${lastEditedByOrError.getError()}`)
    }
    const lastEditedBy = lastEditedByOrError.getValue()

    const timestampsOrError = Timestamps.create(projection.createdAtTimestamp, projection.updatedAtTimestamp)
    if (timestampsOrError.isFailed()) {
      throw new Error(`Failed to create shared vault association from projection: ${timestampsOrError.getError()}`)
    }
    const timestamps = timestampsOrError.getValue()

    const sharedVaultAssociationOrError = SharedVaultAssociation.create(
      {
        itemUuid,
        lastEditedBy,
        sharedVaultUuid,
        timestamps,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (sharedVaultAssociationOrError.isFailed()) {
      throw new Error(
        `Failed to create shared vault association from projection: ${sharedVaultAssociationOrError.getError()}`,
      )
    }
    const sharedVaultAssociation = sharedVaultAssociationOrError.getValue()

    return sharedVaultAssociation
  }

  toProjection(domain: SharedVaultAssociation): TypeORMSharedVaultAssociation {
    const typeorm = new TypeORMSharedVaultAssociation()

    typeorm.uuid = domain.id.toString()
    typeorm.sharedVaultUuid = domain.props.sharedVaultUuid.value
    typeorm.itemUuid = domain.props.itemUuid.value
    typeorm.lastEditedBy = domain.props.lastEditedBy.value
    typeorm.createdAtTimestamp = domain.props.timestamps.createdAt
    typeorm.updatedAtTimestamp = domain.props.timestamps.updatedAt

    return typeorm
  }
}
