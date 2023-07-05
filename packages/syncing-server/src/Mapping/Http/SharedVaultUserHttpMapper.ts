import { MapperInterface } from '@standardnotes/domain-core'

import { SharedVaultUser } from '../../Domain/SharedVault/User/SharedVaultUser'
import { SharedVaultUserHttpRepresentation } from './SharedVaultUserHttpRepresentation copy'

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
      created_at_timestamp: domain.props.timestamps.createdAt,
      updated_at_timestamp: domain.props.timestamps.updatedAt,
    }
  }
}
