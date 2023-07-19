import { MapperInterface } from '@standardnotes/domain-core'

import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'
import { SyncResponse20200115 } from './SyncResponse20200115'
import { SyncResponseFactoryInterface } from './SyncResponseFactoryInterface'
import { SyncItemsResponse } from '../../UseCase/Syncing/SyncItems/SyncItemsResponse'
import { ItemHttpRepresentation } from '../../../Mapping/Http/ItemHttpRepresentation'
import { ItemConflictHttpRepresentation } from '../../../Mapping/Http/ItemConflictHttpRepresentation'
import { SavedItemHttpRepresentation } from '../../../Mapping/Http/SavedItemHttpRepresentation'
import { SharedVault } from '../../SharedVault/SharedVault'
import { SharedVaultHttpRepresentation } from '../../../Mapping/Http/SharedVaultHttpRepresentation'
import { SharedVaultInvite } from '../../SharedVault/User/Invite/SharedVaultInvite'
import { SharedVaultInviteHttpRepresentation } from '../../../Mapping/Http/SharedVaultInviteHttpRepresentation'
import { Message } from '../../Message/Message'
import { MessageHttpRepresentation } from '../../../Mapping/Http/MessageHttpRepresentation'
import { Notification } from '../../Notifications/Notification'
import { NotificationHttpRepresentation } from '../../../Mapping/Http/NotificationHttpRepresentation'

export class SyncResponseFactory20200115 implements SyncResponseFactoryInterface {
  constructor(
    private httpMapper: MapperInterface<Item, ItemHttpRepresentation>,
    private itemConflictMapper: MapperInterface<ItemConflict, ItemConflictHttpRepresentation>,
    private savedItemMapper: MapperInterface<Item, SavedItemHttpRepresentation>,
    private sharedVaultMapper: MapperInterface<SharedVault, SharedVaultHttpRepresentation>,
    private sharedVaultInvitesMapper: MapperInterface<SharedVaultInvite, SharedVaultInviteHttpRepresentation>,
    private messageMapper: MapperInterface<Message, MessageHttpRepresentation>,
    private notificationMapper: MapperInterface<Notification, NotificationHttpRepresentation>,
  ) {}

  async createResponse(syncItemsResponse: SyncItemsResponse): Promise<SyncResponse20200115> {
    const retrievedItems = []
    for (const item of syncItemsResponse.retrievedItems) {
      retrievedItems.push(this.httpMapper.toProjection(item))
    }

    const savedItems = []
    for (const item of syncItemsResponse.savedItems) {
      savedItems.push(this.savedItemMapper.toProjection(item))
    }

    const conflicts = []
    for (const itemConflict of syncItemsResponse.conflicts) {
      conflicts.push(this.itemConflictMapper.toProjection(itemConflict))
    }

    const sharedVaults = []
    for (const sharedVault of syncItemsResponse.sharedVaults) {
      sharedVaults.push(this.sharedVaultMapper.toProjection(sharedVault))
    }

    const sharedVaultInvites = []
    for (const sharedVaultInvite of syncItemsResponse.sharedVaultInvites) {
      sharedVaultInvites.push(this.sharedVaultInvitesMapper.toProjection(sharedVaultInvite))
    }

    const messages = []
    for (const contact of syncItemsResponse.messages) {
      messages.push(this.messageMapper.toProjection(contact))
    }

    const notifications = []
    for (const notification of syncItemsResponse.notifications) {
      notifications.push(this.notificationMapper.toProjection(notification))
    }

    return {
      retrieved_items: retrievedItems,
      saved_items: savedItems,
      conflicts,
      sync_token: syncItemsResponse.syncToken,
      cursor_token: syncItemsResponse.cursorToken,
      messages,
      shared_vaults: sharedVaults,
      shared_vault_invites: sharedVaultInvites,
      notifications,
    }
  }
}
