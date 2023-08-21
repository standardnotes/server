import { Timestamps, MapperInterface, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { SharedVault } from '../../Domain/SharedVault/SharedVault'
import { TypeORMSharedVault } from '../../Infra/TypeORM/TypeORMSharedVault'

export class SharedVaultPersistenceMapper implements MapperInterface<SharedVault, TypeORMSharedVault> {
  toDomain(projection: TypeORMSharedVault): SharedVault {
    const userUuidOrError = Uuid.create(projection.userUuid)
    if (userUuidOrError.isFailed()) {
      throw new Error(`Failed to create shared vault from projection: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const timestampsOrError = Timestamps.create(projection.createdAtTimestamp, projection.updatedAtTimestamp)
    if (timestampsOrError.isFailed()) {
      throw new Error(`Failed to create shared vault from projection: ${timestampsOrError.getError()}`)
    }
    const timestamps = timestampsOrError.getValue()

    const sharedVaultOrError = SharedVault.create(
      {
        userUuid,
        fileUploadBytesUsed: projection.fileUploadBytesUsed,
        timestamps,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (sharedVaultOrError.isFailed()) {
      throw new Error(`Failed to create shared vault from projection: ${sharedVaultOrError.getError()}`)
    }
    const sharedVault = sharedVaultOrError.getValue()

    return sharedVault
  }

  toProjection(domain: SharedVault): TypeORMSharedVault {
    const typeorm = new TypeORMSharedVault()

    typeorm.uuid = domain.id.toString()
    typeorm.userUuid = domain.props.userUuid.value
    typeorm.fileUploadBytesUsed = domain.props.fileUploadBytesUsed
    typeorm.createdAtTimestamp = domain.props.timestamps.createdAt
    typeorm.updatedAtTimestamp = domain.props.timestamps.updatedAt

    return typeorm
  }
}
