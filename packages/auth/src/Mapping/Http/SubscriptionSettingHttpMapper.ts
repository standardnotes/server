import { MapperInterface } from '@standardnotes/domain-core'
import { SubscriptionSetting } from '../../Domain/Setting/SubscriptionSetting'
import { SubscriptionSettingHttpRepresentation } from './SubscriptionSettingHttpRepresentation'

export class SubscriptionSettingHttpMapper
  implements MapperInterface<SubscriptionSetting, SubscriptionSettingHttpRepresentation>
{
  toDomain(_projection: SubscriptionSettingHttpRepresentation): SubscriptionSetting {
    throw new Error('Mapping from http representation to domain is not implemented.')
  }

  toProjection(domain: SubscriptionSetting): SubscriptionSettingHttpRepresentation {
    return {
      uuid: domain.id.toString(),
      name: domain.props.name,
      value: domain.props.value,
      createdAt: domain.props.timestamps.createdAt,
      updatedAt: domain.props.timestamps.updatedAt,
      sensitive: domain.props.sensitive,
    }
  }
}
