import { MapperInterface, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'
import { SubscriptionSetting } from '../../Domain/Setting/SubscriptionSetting'
import { TypeORMSubscriptionSetting } from '../../Infra/TypeORM/TypeORMSubscriptionSetting'

export class SubscriptionSettingPersistenceMapper
  implements MapperInterface<SubscriptionSetting, TypeORMSubscriptionSetting>
{
  toDomain(projection: TypeORMSubscriptionSetting): SubscriptionSetting {
    const timestampsOrError = Timestamps.create(projection.createdAt, projection.updatedAt)
    if (timestampsOrError.isFailed()) {
      throw new Error(`Failed to create subscription setting from projection: ${timestampsOrError.getError()}`)
    }
    const timestamps = timestampsOrError.getValue()

    const userSubscriptionUuidOrError = Uuid.create(projection.userSubscriptionUuid)
    if (userSubscriptionUuidOrError.isFailed()) {
      throw new Error(
        `Failed to create subscription setting from projection: ${userSubscriptionUuidOrError.getError()}`,
      )
    }
    const userSubscriptionUuid = userSubscriptionUuidOrError.getValue()

    const subscriptionSettingOrError = SubscriptionSetting.create(
      {
        name: projection.name,
        value: projection.value,
        serverEncryptionVersion: projection.serverEncryptionVersion,
        sensitive: projection.sensitive,
        userSubscriptionUuid,
        timestamps,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (subscriptionSettingOrError.isFailed()) {
      throw new Error(`Failed to create subscription setting from projection: ${subscriptionSettingOrError.getError()}`)
    }
    const subscriptionSetting = subscriptionSettingOrError.getValue()

    return subscriptionSetting
  }

  toProjection(domain: SubscriptionSetting): TypeORMSubscriptionSetting {
    const projection = new TypeORMSubscriptionSetting()

    projection.uuid = domain.id.toString()
    projection.name = domain.props.name
    projection.value = domain.props.value
    projection.serverEncryptionVersion = domain.props.serverEncryptionVersion
    projection.createdAt = domain.props.timestamps.createdAt
    projection.updatedAt = domain.props.timestamps.updatedAt
    projection.userSubscriptionUuid = domain.props.userSubscriptionUuid.value

    return projection
  }
}
