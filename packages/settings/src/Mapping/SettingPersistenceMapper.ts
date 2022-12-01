import {
  EncryptionVersion,
  MapperInterface,
  SettingName,
  Timestamps,
  UniqueEntityId,
  Uuid,
} from '@standardnotes/domain-core'

import { Setting } from '../Domain/Setting/Setting'
import { TypeORMSetting } from '../Infra/TypeORM/TypeORMSetting'

export class SettingPersistenceMapper implements MapperInterface<Setting, TypeORMSetting> {
  toDomain(projection: TypeORMSetting): Setting {
    const settingNameOrError = SettingName.create(projection.name)
    if (settingNameOrError.isFailed()) {
      throw new Error(`Could not create setting projection: ${settingNameOrError.getError()}`)
    }
    const name = settingNameOrError.getValue()

    const serverEncryptionVersionOrError = EncryptionVersion.create(projection.serverEncryptionVersion)
    if (serverEncryptionVersionOrError.isFailed()) {
      throw new Error(`Could not create setting projection: ${serverEncryptionVersionOrError.getError()}`)
    }
    const serverEncryptionVersion = serverEncryptionVersionOrError.getValue()

    const userUuidOrError = Uuid.create(projection.userUuid)
    if (userUuidOrError.isFailed()) {
      throw new Error(`Could not create setting projection: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const timestampsOrError = Timestamps.create(projection.createdAt, projection.updatedAt)
    if (timestampsOrError.isFailed()) {
      throw new Error(`Could not create setting projection: ${timestampsOrError.getError()}`)
    }
    const timestamps = timestampsOrError.getValue()

    const settingOrError = Setting.create(
      {
        name,
        sensitive: projection.sensitive,
        serverEncryptionVersion,
        timestamps,
        userUuid,
        value: projection.value,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (settingOrError.isFailed()) {
      throw new Error(`Could not create setting projection: ${settingOrError.getError()}`)
    }
    const setting = settingOrError.getValue()

    return setting
  }

  toProjection(domain: Setting): TypeORMSetting {
    const typeOrmSetting = new TypeORMSetting()

    typeOrmSetting.name = domain.props.name.value
    typeOrmSetting.sensitive = domain.props.sensitive
    typeOrmSetting.serverEncryptionVersion = domain.props.serverEncryptionVersion.value
    typeOrmSetting.userUuid = domain.props.userUuid.value
    typeOrmSetting.uuid = domain.id.toString()
    typeOrmSetting.value = domain.props.value
    typeOrmSetting.createdAt = domain.props.timestamps.createdAt
    typeOrmSetting.updatedAt = domain.props.timestamps.updatedAt

    return typeOrmSetting
  }
}
