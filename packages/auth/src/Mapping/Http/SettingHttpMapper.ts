import { MapperInterface } from '@standardnotes/domain-core'

import { Setting } from '../../Domain/Setting/Setting'
import { SettingHttpRepresentation } from './SettingHttpRepresentation'

export class SettingHttpMapper implements MapperInterface<Setting, SettingHttpRepresentation> {
  toDomain(_projection: SettingHttpRepresentation): Setting {
    throw new Error('Mapping from http representation to domain is not implemented.')
  }

  toProjection(domain: Setting): SettingHttpRepresentation {
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
