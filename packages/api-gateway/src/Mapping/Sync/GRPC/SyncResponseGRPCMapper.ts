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
      content: itemHash.hasContent() ? (itemHash.getContent() as string) : undefined,
      content_type: itemHash.hasContentType() ? (itemHash.getContentType() as string) : null,
      deleted: itemHash.hasDeleted() ? (itemHash.getDeleted() as boolean) : false,
      duplicate_of: itemHash.hasDuplicateOf() ? (itemHash.getDuplicateOf() as string) : null,
      auth_hash: itemHash.hasAuthHash() ? (itemHash.getAuthHash() as string) : undefined,
      enc_item_key: itemHash.hasEncItemKey() ? (itemHash.getEncItemKey() as string) : undefined,
      items_key_id: itemHash.hasItemsKeyId() ? (itemHash.getItemsKeyId() as string) : undefined,
      key_system_identifier: itemHash.hasKeySystemIdentifier() ? (itemHash.getKeySystemIdentifier() as string) : null,
      shared_vault_uuid: itemHash.hasSharedVaultUuid() ? (itemHash.getSharedVaultUuid() as string) : null,
      created_at: itemHash.hasCreatedAt() ? (itemHash.getCreatedAt() as string) : undefined,
      created_at_timestamp: itemHash.hasCreatedAtTimestamp() ? (itemHash.getCreatedAtTimestamp() as number) : undefined,
      updated_at: itemHash.hasUpdatedAt() ? (itemHash.getUpdatedAt() as string) : undefined,
      updated_at_timestamp: itemHash.hasUpdatedAtTimestamp() ? (itemHash.getUpdatedAtTimestamp() as number) : undefined,
    }
  }

  private createSavedItem(item: SavedItemRepresentation): SavedItemHttpRepresentation {
    return {
      uuid: item.getUuid(),
      duplicate_of: item.hasDuplicateOf() ? (item.getDuplicateOf() as string) : null,
      content_type: item.getContentType(),
      auth_hash: item.hasAuthHash() ? (item.getAuthHash() as string) : null,
      deleted: item.getDeleted(),
      created_at: item.getCreatedAt(),
      created_at_timestamp: item.getCreatedAtTimestamp(),
      updated_at: item.getUpdatedAt(),
      updated_at_timestamp: item.getUpdatedAtTimestamp(),
      key_system_identifier: item.hasKeySystemIdentifier() ? (item.getKeySystemIdentifier() as string) : null,
      shared_vault_uuid: item.hasSharedVaultUuid() ? (item.getSharedVaultUuid() as string) : null,
      user_uuid: item.hasUserUuid() ? (item.getUserUuid() as string) : null,
      last_edited_by_uuid: item.hasLastEditedByUuid() ? (item.getLastEditedByUuid() as string) : null,
    }
  }

  private createItem(item: ItemRepresentation): ItemHttpRepresentation {
    return {
      uuid: item.getUuid(),
      items_key_id: item.hasItemsKeyId() ? (item.getItemsKeyId() as string) : null,
      duplicate_of: item.hasDuplicateOf() ? (item.getDuplicateOf() as string) : null,
      enc_item_key: item.hasEncItemKey() ? (item.getEncItemKey() as string) : null,
      content: item.hasContent() ? (item.getContent() as string) : null,
      content_type: item.getContentType(),
      auth_hash: item.hasAuthHash() ? (item.getAuthHash() as string) : null,
      deleted: item.getDeleted(),
      created_at: item.getCreatedAt(),
      created_at_timestamp: item.getCreatedAtTimestamp(),
      updated_at: item.getUpdatedAt(),
      updated_at_timestamp: item.getUpdatedAtTimestamp(),
      updated_with_session: item.hasUpdatedWithSession() ? (item.getUpdatedWithSession() as string) : null,
      key_system_identifier: item.hasKeySystemIdentifier() ? (item.getKeySystemIdentifier() as string) : null,
      shared_vault_uuid: item.hasSharedVaultUuid() ? (item.getSharedVaultUuid() as string) : null,
      user_uuid: item.hasUserUuid() ? (item.getUserUuid() as string) : null,
      last_edited_by_uuid: item.hasLastEditedByUuid() ? (item.getLastEditedByUuid() as string) : null,
    }
  }
}
