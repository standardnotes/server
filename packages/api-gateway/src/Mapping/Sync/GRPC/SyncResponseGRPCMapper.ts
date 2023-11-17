import { MapperInterface } from '@standardnotes/domain-core'
import {
  ItemConflictRepresentation,
  ItemHashRepresentation,
  ItemRepresentation,
  MessageRepresentation,
  NotificationRepresentation,
  SavedItemRepresentation,
  SharedVaultInviteRepresentation,
  SharedVaultRepresentation,
  SyncResponse,
} from '@standardnotes/grpc'

import { ItemHttpRepresentation } from '../Http/ItemHttpRepresentation'
import { SavedItemHttpRepresentation } from '../Http/SavedItemHttpRepresentation'
import { ItemConflictHttpRepresentation } from '../Http/ItemConflictHttpRepresentation'
import { ItemHashHttpRepresentation } from '../Http/ItemHashHttpRepresentation'
import { MessageHttpRepresentation } from '../Http/MessageHttpRepresentation'
import { SharedVaultHttpRepresentation } from '../Http/SharedVaultHttpRepresentation'
import { SharedVaultInviteHttpRepresentation } from '../Http/SharedVaultInviteHttpRepresentation'
import { NotificationHttpRepresentation } from '../Http/NotificationHttpRepresentation'
import { SyncResponseHttpRepresentation } from '../Http/SyncResponseHttpRepresentation'

export class SyncResponseGRPCMapper implements MapperInterface<SyncResponse, SyncResponseHttpRepresentation> {
  toDomain(_projection: SyncResponseHttpRepresentation): SyncResponse {
    throw new Error('Method not implemented.')
  }

  toProjection(domain: SyncResponse): SyncResponseHttpRepresentation {
    return {
      retrieved_items: domain.getRetrievedItemsList().map((item) => this.createItem(item)),
      saved_items: domain.getSavedItemsList().map((item) => this.createSavedItem(item)),
      conflicts: domain.getConflictsList().map((conflict) => this.createConflict(conflict)),
      sync_token: domain.getSyncToken(),
      cursor_token: domain.getCursorToken(),
      messages: domain.getMessagesList().map((message) => this.createMessage(message)),
      shared_vaults: domain.getSharedVaultsList().map((sharedVault) => this.createSharedVault(sharedVault)),
      shared_vault_invites: domain
        .getSharedVaultInvitesList()
        .map((sharedVaultInvite) => this.createSharedVaultInvite(sharedVaultInvite)),
      notifications: domain.getNotificationsList().map((notification) => this.createNotification(notification)),
    }
  }

  private createNotification(notification: NotificationRepresentation): NotificationHttpRepresentation {
    return {
      uuid: notification.getUuid(),
      user_uuid: notification.getUserUuid(),
      type: notification.getType(),
      payload: notification.getPayload(),
      created_at_timestamp: notification.getCreatedAtTimestamp(),
      updated_at_timestamp: notification.getUpdatedAtTimestamp(),
    }
  }

  private createSharedVaultInvite(
    sharedVaultInvite: SharedVaultInviteRepresentation,
  ): SharedVaultInviteHttpRepresentation {
    return {
      uuid: sharedVaultInvite.getUuid(),
      shared_vault_uuid: sharedVaultInvite.getSharedVaultUuid(),
      user_uuid: sharedVaultInvite.getUserUuid(),
      sender_uuid: sharedVaultInvite.getSenderUuid(),
      encrypted_message: sharedVaultInvite.getEncryptedMessage(),
      permission: sharedVaultInvite.getPermission(),
      created_at_timestamp: sharedVaultInvite.getCreatedAtTimestamp(),
      updated_at_timestamp: sharedVaultInvite.getUpdatedAtTimestamp(),
    }
  }

  private createSharedVault(sharedVault: SharedVaultRepresentation): SharedVaultHttpRepresentation {
    return {
      uuid: sharedVault.getUuid(),
      user_uuid: sharedVault.getUserUuid(),
      file_upload_bytes_used: sharedVault.getFileUploadBytesUsed(),
      created_at_timestamp: sharedVault.getCreatedAtTimestamp(),
      updated_at_timestamp: sharedVault.getUpdatedAtTimestamp(),
    }
  }

  private createMessage(message: MessageRepresentation): MessageHttpRepresentation {
    return {
      uuid: message.getUuid(),
      recipient_uuid: message.getRecipientUuid(),
      sender_uuid: message.getSenderUuid(),
      encrypted_message: message.getEncryptedMessage(),
      replaceability_identifier: message.getReplaceabilityIdentifier() ?? null,
      created_at_timestamp: message.getCreatedAtTimestamp(),
      updated_at_timestamp: message.getUpdatedAtTimestamp(),
    }
  }

  private createConflict(conflict: ItemConflictRepresentation): ItemConflictHttpRepresentation {
    return {
      server_item: conflict.hasServerItem()
        ? this.createItem(conflict.getServerItem() as ItemRepresentation)
        : undefined,
      unsaved_item: conflict.hasUnsavedItem()
        ? this.createItemHash(conflict.getUnsavedItem() as ItemHashRepresentation)
        : undefined,
      type: conflict.getType(),
    }
  }

  private createItemHash(itemHash: ItemHashRepresentation): ItemHashHttpRepresentation {
    return {
      uuid: itemHash.getUuid(),
      user_uuid: itemHash.getUserUuid(),
      content: itemHash.getContent(),
      content_type: itemHash.getContentType() ?? null,
      deleted: itemHash.getDeleted(),
      duplicate_of: itemHash.getDuplicateOf() ?? null,
      auth_hash: itemHash.getAuthHash(),
      enc_item_key: itemHash.getEncItemKey(),
      items_key_id: itemHash.getItemsKeyId(),
      key_system_identifier: itemHash.getKeySystemIdentifier() ?? null,
      shared_vault_uuid: itemHash.getSharedVaultUuid() ?? null,
      created_at: itemHash.getCreatedAt(),
      created_at_timestamp: itemHash.getCreatedAtTimestamp(),
      updated_at: itemHash.getUpdatedAt(),
      updated_at_timestamp: itemHash.getUpdatedAtTimestamp(),
    }
  }

  private createSavedItem(item: SavedItemRepresentation): SavedItemHttpRepresentation {
    return {
      uuid: item.getUuid(),
      duplicate_of: item.getDuplicateOf() ?? null,
      content_type: item.getContentType(),
      auth_hash: item.getAuthHash() ?? null,
      deleted: item.getDeleted(),
      created_at: item.getCreatedAt(),
      created_at_timestamp: item.getCreatedAtTimestamp(),
      updated_at: item.getUpdatedAt(),
      updated_at_timestamp: item.getUpdatedAtTimestamp(),
      key_system_identifier: item.getKeySystemIdentifier() ?? null,
      shared_vault_uuid: item.getSharedVaultUuid() ?? null,
      user_uuid: item.getUserUuid() ?? null,
      last_edited_by_uuid: item.getLastEditedByUuid() ?? null,
    }
  }

  private createItem(item: ItemRepresentation): ItemHttpRepresentation {
    return {
      uuid: item.getUuid(),
      items_key_id: item.getItemsKeyId() ?? null,
      duplicate_of: item.getDuplicateOf() ?? null,
      enc_item_key: item.getEncItemKey() ?? null,
      content: item.getContent() ?? null,
      content_type: item.getContentType(),
      auth_hash: item.getAuthHash() ?? null,
      deleted: item.getDeleted(),
      created_at: item.getCreatedAt(),
      created_at_timestamp: item.getCreatedAtTimestamp(),
      updated_at: item.getUpdatedAt(),
      updated_at_timestamp: item.getUpdatedAtTimestamp(),
      updated_with_session: item.getUpdatedWithSession() ?? null,
      key_system_identifier: item.getKeySystemIdentifier() ?? null,
      shared_vault_uuid: item.getSharedVaultUuid() ?? null,
      user_uuid: item.getUserUuid() ?? null,
      last_edited_by_uuid: item.getLastEditedByUuid() ?? null,
    }
  }
}
