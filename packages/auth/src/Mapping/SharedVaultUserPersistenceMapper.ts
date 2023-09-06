import {
  Timestamps,
  MapperInterface,
  UniqueEntityId,
  Uuid,
  SharedVaultUserPermission,
  SharedVaultUser,
} from '@standardnotes/domain-core'

import { TypeORMSharedVaultUser } from '../Infra/TypeORM/TypeORMSharedVaultUser'

export class SharedVaultUserPersistenceMapper implements MapperInterface<SharedVaultUser, TypeORMSharedVaultUser> {
  toDomain(projection: TypeORMSharedVaultUser): SharedVaultUser {
    const userUuidOrError = Uuid.create(projection.userUuid)
    if (userUuidOrError.isFailed()) {
      throw new Error(`Failed to create shared vault user from projection: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const sharedVaultUuidOrError = Uuid.create(projection.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      throw new Error(`Failed to create shared vault user from projection: ${sharedVaultUuidOrError.getError()}`)
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const timestampsOrError = Timestamps.create(projection.createdAtTimestamp, projection.updatedAtTimestamp)
    if (timestampsOrError.isFailed()) {
      throw new Error(`Failed to create shared vault user from projection: ${timestampsOrError.getError()}`)
    }
    const timestamps = timestampsOrError.getValue()

    const permissionOrError = SharedVaultUserPermission.create(projection.permission)
    if (permissionOrError.isFailed()) {
      throw new Error(`Failed to create shared vault user from projection: ${permissionOrError.getError()}`)
    }
    const permission = permissionOrError.getValue()

    const sharedVaultUserOrError = SharedVaultUser.create(
      {
        userUuid,
        sharedVaultUuid,
        permission,
        timestamps,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (sharedVaultUserOrError.isFailed()) {
      throw new Error(`Failed to create shared vault user from projection: ${sharedVaultUserOrError.getError()}`)
    }
    const sharedVaultUser = sharedVaultUserOrError.getValue()

    return sharedVaultUser
  }

  toProjection(domain: SharedVaultUser): TypeORMSharedVaultUser {
    const typeorm = new TypeORMSharedVaultUser()

    typeorm.uuid = domain.id.toString()
    typeorm.sharedVaultUuid = domain.props.sharedVaultUuid.value
    typeorm.userUuid = domain.props.userUuid.value
    typeorm.permission = domain.props.permission.value
    typeorm.createdAtTimestamp = domain.props.timestamps.createdAt
    typeorm.updatedAtTimestamp = domain.props.timestamps.updatedAt

    return typeorm
  }
}
