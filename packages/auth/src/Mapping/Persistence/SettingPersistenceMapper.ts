import { MapperInterface, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'
import { Setting } from '../../Domain/Setting/Setting'
import { TypeORMSetting } from '../../Infra/TypeORM/TypeORMSetting'

export class SettingPersistenceMapper implements MapperInterface<Setting, TypeORMSetting> {
  toDomain(projection: TypeORMSetting): Setting {
    const timestampsOrError = Timestamps.create(projection.createdAt, projection.updatedAt)
    if (timestampsOrError.isFailed()) {
      throw new Error(`Failed to create setting from projection: ${timestampsOrError.getError()}`)
    }
    const timestamps = timestampsOrError.getValue()

    const userUuidOrError = Uuid.create(projection.userUuid)
    if (userUuidOrError.isFailed()) {
      throw new Error(`Failed to create setting from projection: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const settingOrError = Setting.create(
      {
        name: projection.name,
        value: projection.value,
        serverEncryptionVersion: projection.serverEncryptionVersion,
        sensitive: !!projection.sensitive,
        userUuid,
        timestamps,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (settingOrError.isFailed()) {
      throw new Error(`Failed to create setting from projection: ${settingOrError.getError()}`)
    }
    const setting = settingOrError.getValue()

    return setting
  }

  toProjection(domain: Setting): TypeORMSetting {
    const projection = new TypeORMSetting()

    projection.uuid = domain.id.toString()
    projection.name = domain.props.name
    projection.value = domain.props.value
    projection.serverEncryptionVersion = domain.props.serverEncryptionVersion
    projection.createdAt = domain.props.timestamps.createdAt
    projection.updatedAt = domain.props.timestamps.updatedAt
    projection.userUuid = domain.props.userUuid.value
    projection.sensitive = !!domain.props.sensitive

    return projection
  }
}
