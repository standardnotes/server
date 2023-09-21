import { MapperInterface, SharedVaultUser } from '@standardnotes/domain-core'

import { SharedVaultUserHttpRepresentation } from './SharedVaultUserHttpRepresentation'

export class SharedVaultUserHttpMapper implements MapperInterface<SharedVaultUser, SharedVaultUserHttpRepresentation> {
  toDomain(_projection: SharedVaultUserHttpRepresentation): SharedVaultUser {
    throw new Error('Mapping from http representation to domain is not implemented.')
  }

  toProjection(domain: SharedVaultUser): SharedVaultUserHttpRepresentation {
    return {
      uuid: domain.id.toString(),
      user_uuid: domain.props.userUuid.value,
      permission: domain.props.permission.value,
      shared_vault_uuid: domain.props.sharedVaultUuid.value,
      is_designated_survivor: domain.props.isDesignatedSurvivor,
      created_at_timestamp: domain.props.timestamps.createdAt,
      updated_at_timestamp: domain.props.timestamps.updatedAt,
    }
  }
}
