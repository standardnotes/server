import { MapperInterface } from '@standardnotes/domain-core'

import { SharedVault } from '../../Domain/SharedVault/SharedVault'
import { SharedVaultHttpRepresentation } from './SharedVaultHttpRepresentation'

export class SharedVaultHttpMapper implements MapperInterface<SharedVault, SharedVaultHttpRepresentation> {
  toDomain(_projection: SharedVaultHttpRepresentation): SharedVault {
    throw new Error('Mapping from http representation to domain is not implemented.')
  }

  toProjection(domain: SharedVault): SharedVaultHttpRepresentation {
    return {
      uuid: domain.id.toString(),
      user_uuid: domain.props.userUuid.value,
      file_upload_bytes_limit: domain.props.fileUploadBytesLimit,
      file_upload_bytes_used: domain.props.fileUploadBytesUsed,
      created_at_timestamp: domain.props.timestamps.createdAt,
      updated_at_timestamp: domain.props.timestamps.updatedAt,
    }
  }
}
