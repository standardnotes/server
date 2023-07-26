import {
  Timestamps,
  MapperInterface,
  UniqueEntityId,
  Uuid,
  Validator,
  SharedVaultUserPermission,
} from '@standardnotes/domain-core'

import { SharedVaultInvite } from '../../Domain/SharedVault/User/Invite/SharedVaultInvite'
import { TypeORMSharedVaultInvite } from '../../Infra/TypeORM/TypeORMSharedVaultInvite'

export class SharedVaultInvitePersistenceMapper
  implements MapperInterface<SharedVaultInvite, TypeORMSharedVaultInvite>
{
  toDomain(projection: TypeORMSharedVaultInvite): SharedVaultInvite {
    const userUuidOrError = Uuid.create(projection.userUuid)
    if (userUuidOrError.isFailed()) {
      throw new Error(`Failed to create shared vault invite from projection: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const senderUuidOrError = Uuid.create(projection.senderUuid)
    if (senderUuidOrError.isFailed()) {
      throw new Error(`Failed to create shared vault invite from projection: ${senderUuidOrError.getError()}`)
    }
    const senderUuid = senderUuidOrError.getValue()

    const sharedVaultUuidOrError = Uuid.create(projection.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      throw new Error(`Failed to create shared vault invite from projection: ${sharedVaultUuidOrError.getError()}`)
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const timestampsOrError = Timestamps.create(projection.createdAtTimestamp, projection.updatedAtTimestamp)
    if (timestampsOrError.isFailed()) {
      throw new Error(`Failed to create shared vault invite from projection: ${timestampsOrError.getError()}`)
    }
    const timestamps = timestampsOrError.getValue()

    const permissionOrError = SharedVaultUserPermission.create(projection.permission)
    if (permissionOrError.isFailed()) {
      throw new Error(`Failed to create shared vault invite from projection: ${permissionOrError.getError()}`)
    }
    const permission = permissionOrError.getValue()

    const notEmptyMessageValidationResult = Validator.isNotEmpty(projection.encryptedMessage)
    if (notEmptyMessageValidationResult.isFailed()) {
      throw new Error(
        `Failed to create shared vault invite from projection: ${notEmptyMessageValidationResult.getError()}`,
      )
    }

    const sharedVaultInviteOrError = SharedVaultInvite.create(
      {
        userUuid,
        sharedVaultUuid,
        senderUuid,
        permission,
        timestamps,
        encryptedMessage: projection.encryptedMessage,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (sharedVaultInviteOrError.isFailed()) {
      throw new Error(`Failed to create shared vault invite from projection: ${sharedVaultInviteOrError.getError()}`)
    }
    const sharedVaultInvite = sharedVaultInviteOrError.getValue()

    return sharedVaultInvite
  }

  toProjection(domain: SharedVaultInvite): TypeORMSharedVaultInvite {
    const typeorm = new TypeORMSharedVaultInvite()

    typeorm.uuid = domain.id.toString()
    typeorm.sharedVaultUuid = domain.props.sharedVaultUuid.value
    typeorm.userUuid = domain.props.userUuid.value
    typeorm.permission = domain.props.permission.value
    typeorm.senderUuid = domain.props.senderUuid.value
    typeorm.encryptedMessage = domain.props.encryptedMessage
    typeorm.createdAtTimestamp = domain.props.timestamps.createdAt
    typeorm.updatedAtTimestamp = domain.props.timestamps.updatedAt

    return typeorm
  }
}
