import { MapperInterface } from '@standardnotes/domain-core'

import { SharedVaultInvite } from '../../Domain/SharedVault/User/Invite/SharedVaultInvite'
import { SharedVaultInviteHttpRepresentation } from './SharedVaultInviteHttpRepresentation'

export class SharedVaultInviteHttpMapper
  implements MapperInterface<SharedVaultInvite, SharedVaultInviteHttpRepresentation>
{
  toDomain(_projection: SharedVaultInviteHttpRepresentation): SharedVaultInvite {
    throw new Error('Mapping from http representation to domain is not implemented.')
  }

  toProjection(domain: SharedVaultInvite): SharedVaultInviteHttpRepresentation {
    return {
      uuid: domain.id.toString(),
      shared_vault_uuid: domain.props.sharedVaultUuid.value,
      user_uuid: domain.props.userUuid.value,
      sender_uuid: domain.props.senderUuid.value,
      encrypted_message: domain.props.encryptedMessage,
      permission: domain.props.permission.value,
      created_at_timestamp: domain.props.timestamps.createdAt,
      updated_at_timestamp: domain.props.timestamps.updatedAt,
    }
  }
}
