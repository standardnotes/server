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
import { SyncResponse20200115 } from '../../Domain/Item/SyncResponse/SyncResponse20200115'
import { SavedItemHttpRepresentation } from '../Http/SavedItemHttpRepresentation'
import { ItemConflictHttpRepresentation } from '../Http/ItemConflictHttpRepresentation'
import { ItemHashHttpRepresentation } from '../Http/ItemHashHttpRepresentation'
import { MessageHttpRepresentation } from '../Http/MessageHttpRepresentation'
import { SharedVaultHttpRepresentation } from '../Http/SharedVaultHttpRepresentation'
import { SharedVaultInviteHttpRepresentation } from '../Http/SharedVaultInviteHttpRepresentation'
import { NotificationHttpRepresentation } from '../Http/NotificationHttpRepresentation'

export class SyncResponseGRPCMapper implements MapperInterface<SyncResponse20200115, SyncResponse> {
  toDomain(_projection: SyncResponse): SyncResponse20200115 {
    throw new Error('Method not implemented.')
  }

  toProjection(domain: SyncResponse20200115): SyncResponse {
    const syncResponse = new SyncResponse()

    const retrievedItems = domain.retrieved_items.map((item) => this.createRetrievedItem(item))
    syncResponse.setRetrievedItemsList(retrievedItems)

    const savedItems = domain.saved_items.map((item) => this.createSavedItem(item))
    syncResponse.setSavedItemsList(savedItems)

    const conflicts = domain.conflicts.map((conflict) => this.createConflict(conflict))
    syncResponse.setConflictsList(conflicts)

    syncResponse.setSyncToken(domain.sync_token)
    if (domain.cursor_token) {
      syncResponse.setCursorToken(domain.cursor_token)
    }

    const messages = domain.messages.map((message) => this.createMessage(message))
    syncResponse.setMessagesList(messages)

    const sharedVaults = domain.shared_vaults.map((sharedVault) => this.createSharedVault(sharedVault))
    syncResponse.setSharedVaultsList(sharedVaults)

    const sharedVaultInvites = domain.shared_vault_invites.map((sharedVaultInvite) =>
      this.createSharedVaultInvite(sharedVaultInvite),
    )
    syncResponse.setSharedVaultInvitesList(sharedVaultInvites)

    const notifications = domain.notifications.map((notification) => this.createNotification(notification))
    syncResponse.setNotificationsList(notifications)

    return syncResponse
  }

  private createNotification(notification: NotificationHttpRepresentation): NotificationRepresentation {
    const notificationRepresentation = new NotificationRepresentation()
    notificationRepresentation.setUuid(notification.uuid)
    notificationRepresentation.setUserUuid(notification.user_uuid)
    notificationRepresentation.setType(notification.type)
    notificationRepresentation.setPayload(notification.payload)
    notificationRepresentation.setCreatedAtTimestamp(notification.created_at_timestamp)
    notificationRepresentation.setUpdatedAtTimestamp(notification.updated_at_timestamp)

    return notificationRepresentation
  }

  private createSharedVaultInvite(
    sharedVaultInvite: SharedVaultInviteHttpRepresentation,
  ): SharedVaultInviteRepresentation {
    const sharedVaultInviteRepresentation = new SharedVaultInviteRepresentation()
    sharedVaultInviteRepresentation.setUuid(sharedVaultInvite.uuid)
    sharedVaultInviteRepresentation.setSharedVaultUuid(sharedVaultInvite.shared_vault_uuid)
    sharedVaultInviteRepresentation.setUserUuid(sharedVaultInvite.user_uuid)
    sharedVaultInviteRepresentation.setSenderUuid(sharedVaultInvite.sender_uuid)
    sharedVaultInviteRepresentation.setEncryptedMessage(sharedVaultInvite.encrypted_message)
    sharedVaultInviteRepresentation.setPermission(sharedVaultInvite.permission)
    sharedVaultInviteRepresentation.setCreatedAtTimestamp(sharedVaultInvite.created_at_timestamp)
    sharedVaultInviteRepresentation.setUpdatedAtTimestamp(sharedVaultInvite.updated_at_timestamp)

    return sharedVaultInviteRepresentation
  }

  private createSharedVault(sharedVault: SharedVaultHttpRepresentation): SharedVaultRepresentation {
    const sharedVaultRepresentation = new SharedVaultRepresentation()
    sharedVaultRepresentation.setUuid(sharedVault.uuid)
    sharedVaultRepresentation.setUserUuid(sharedVault.user_uuid)
    sharedVaultRepresentation.setFileUploadBytesUsed(sharedVault.file_upload_bytes_used)
    sharedVaultRepresentation.setCreatedAtTimestamp(sharedVault.created_at_timestamp)
    sharedVaultRepresentation.setUpdatedAtTimestamp(sharedVault.updated_at_timestamp)

    return sharedVaultRepresentation
  }

  private createMessage(message: MessageHttpRepresentation): MessageRepresentation {
    const messageRepresentation = new MessageRepresentation()
    messageRepresentation.setUuid(message.uuid)
    messageRepresentation.setRecipientUuid(message.recipient_uuid)
    messageRepresentation.setSenderUuid(message.sender_uuid)
    messageRepresentation.setEncryptedMessage(message.encrypted_message)
    if (message.replaceability_identifier) {
      messageRepresentation.setReplaceabilityIdentifier(message.replaceability_identifier)
    }
    messageRepresentation.setCreatedAtTimestamp(message.created_at_timestamp)
    messageRepresentation.setUpdatedAtTimestamp(message.updated_at_timestamp)

    return messageRepresentation
  }

  private createConflict(conflict: ItemConflictHttpRepresentation): ItemConflictRepresentation {
    const itemConflictRepresentation = new ItemConflictRepresentation()
    if (conflict.server_item) {
      itemConflictRepresentation.setServerItem(this.createRetrievedItem(conflict.server_item))
    }
    if (conflict.unsaved_item) {
      itemConflictRepresentation.setUnsavedItem(this.createItemHash(conflict.unsaved_item))
    }
    itemConflictRepresentation.setType(conflict.type)

    return itemConflictRepresentation
  }

  private createItemHash(itemHash: ItemHashHttpRepresentation): ItemHashRepresentation {
    const itemHashRepresentation = new ItemHashRepresentation()
    itemHashRepresentation.setUuid(itemHash.uuid)
    itemHashRepresentation.setUserUuid(itemHash.user_uuid)
    if (itemHash.content) {
      itemHashRepresentation.setContent(itemHash.content)
    }
    if (itemHash.content_type) {
      itemHashRepresentation.setContentType(itemHash.content_type)
    }
    if (itemHash.deleted) {
      itemHashRepresentation.setDeleted(itemHash.deleted)
    }
    if (itemHash.duplicate_of) {
      itemHashRepresentation.setDuplicateOf(itemHash.duplicate_of)
    }
    if (itemHash.auth_hash) {
      itemHashRepresentation.setAuthHash(itemHash.auth_hash)
    }
    if (itemHash.enc_item_key) {
      itemHashRepresentation.setEncItemKey(itemHash.enc_item_key)
    }
    if (itemHash.items_key_id) {
      itemHashRepresentation.setItemsKeyId(itemHash.items_key_id)
    }
    if (itemHash.key_system_identifier) {
      itemHashRepresentation.setKeySystemIdentifier(itemHash.key_system_identifier)
    }
    if (itemHash.shared_vault_uuid) {
      itemHashRepresentation.setSharedVaultUuid(itemHash.shared_vault_uuid)
    }
    if (itemHash.created_at) {
      itemHashRepresentation.setCreatedAt(itemHash.created_at)
    }
    if (itemHash.created_at_timestamp) {
      itemHashRepresentation.setCreatedAtTimestamp(itemHash.created_at_timestamp)
    }
    if (itemHash.updated_at) {
      itemHashRepresentation.setUpdatedAt(itemHash.updated_at)
    }
    if (itemHash.updated_at_timestamp) {
      itemHashRepresentation.setUpdatedAtTimestamp(itemHash.updated_at_timestamp)
    }

    return itemHashRepresentation
  }

  private createSavedItem(item: SavedItemHttpRepresentation): SavedItemRepresentation {
    const savedItemRepresentation = new SavedItemRepresentation()
    savedItemRepresentation.setUuid(item.uuid)
    if (item.duplicate_of) {
      savedItemRepresentation.setDuplicateOf(item.duplicate_of)
    }
    savedItemRepresentation.setContentType(item.content_type)
    if (item.auth_hash) {
      savedItemRepresentation.setAuthHash(item.auth_hash)
    }
    savedItemRepresentation.setDeleted(item.deleted)
    savedItemRepresentation.setCreatedAt(item.created_at)
    savedItemRepresentation.setCreatedAtTimestamp(item.created_at_timestamp)
    savedItemRepresentation.setUpdatedAt(item.updated_at)
    savedItemRepresentation.setUpdatedAtTimestamp(item.updated_at_timestamp)
    if (item.key_system_identifier) {
      savedItemRepresentation.setKeySystemIdentifier(item.key_system_identifier)
    }
    if (item.shared_vault_uuid) {
      savedItemRepresentation.setSharedVaultUuid(item.shared_vault_uuid)
    }
    if (item.user_uuid) {
      savedItemRepresentation.setUserUuid(item.user_uuid)
    }
    if (item.last_edited_by_uuid) {
      savedItemRepresentation.setLastEditedByUuid(item.last_edited_by_uuid)
    }

    return savedItemRepresentation
  }

  private createRetrievedItem(item: ItemHttpRepresentation): ItemRepresentation {
    const itemRepresentation = new ItemRepresentation()
    itemRepresentation.setUuid(item.uuid)
    if (item.items_key_id) {
      itemRepresentation.setItemsKeyId(item.items_key_id)
    }
    if (item.duplicate_of) {
      itemRepresentation.setDuplicateOf(item.duplicate_of)
    }
    if (item.enc_item_key) {
      itemRepresentation.setEncItemKey(item.enc_item_key)
    }
    if (item.content) {
      itemRepresentation.setContent(item.content)
    }
    itemRepresentation.setContentType(item.content_type)
    if (item.auth_hash) {
      itemRepresentation.setAuthHash(item.auth_hash)
    }
    itemRepresentation.setDeleted(item.deleted)
    itemRepresentation.setCreatedAt(item.created_at)
    itemRepresentation.setCreatedAtTimestamp(item.created_at_timestamp)
    itemRepresentation.setUpdatedAt(item.updated_at)
    itemRepresentation.setUpdatedAtTimestamp(item.updated_at_timestamp)
    if (item.updated_with_session) {
      itemRepresentation.setUpdatedWithSession(item.updated_with_session)
    }
    if (item.key_system_identifier) {
      itemRepresentation.setKeySystemIdentifier(item.key_system_identifier)
    }
    if (item.shared_vault_uuid) {
      itemRepresentation.setSharedVaultUuid(item.shared_vault_uuid)
    }
    if (item.user_uuid) {
      itemRepresentation.setUserUuid(item.user_uuid)
    }
    if (item.last_edited_by_uuid) {
      itemRepresentation.setLastEditedByUuid(item.last_edited_by_uuid)
    }

    return itemRepresentation
  }
}
