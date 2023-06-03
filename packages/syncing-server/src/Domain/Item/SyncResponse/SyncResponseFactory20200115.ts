import { SharedVaultInvite } from '../../SharedVaultInvite/Model/SharedVaultInvite'
import { Contact } from './../../Contact/Model/Contact'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { SyncItemsResponse } from '../../UseCase/SyncItemsResponse'
import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'
import { ItemConflictProjection } from '../../../Projection/ItemConflictProjection'
import { ItemProjection } from '../../../Projection/ItemProjection'
import { SyncResponse20200115 } from './SyncResponse20200115'
import { SyncResponseFactoryInterface } from './SyncResponseFactoryInterface'
import { SavedItemProjection } from '../../../Projection/SavedItemProjection'
import { ContactProjection } from '../../../Projection/ContactProjection'
import { SharedVaultInviteProjection } from '../../../Projection/SharedVaultInviteProjection'
import { SharedVaultProjection } from '../../../Projection/SharedVaultProjection'
import { SharedVault } from '../../SharedVault/Model/SharedVault'

export class SyncResponseFactory20200115 implements SyncResponseFactoryInterface {
  constructor(
    private itemProjector: ProjectorInterface<Item, ItemProjection>,
    private itemConflictProjector: ProjectorInterface<ItemConflict, ItemConflictProjection>,
    private savedItemProjector: ProjectorInterface<Item, SavedItemProjection>,
    private sharedVaultInviteProjector: ProjectorInterface<SharedVaultInvite, SharedVaultInviteProjection>,
    private contactProjector: ProjectorInterface<Contact, ContactProjection>,
    private sharedVaultProjector: ProjectorInterface<SharedVault, SharedVaultProjection>,
  ) {}

  async createResponse(syncItemsResponse: SyncItemsResponse): Promise<SyncResponse20200115> {
    const retrievedItems = []
    for (const item of syncItemsResponse.retrievedItems) {
      retrievedItems.push(this.itemProjector.projectFull(item))
    }

    const savedItems = []
    for (const item of syncItemsResponse.savedItems) {
      savedItems.push(this.savedItemProjector.projectFull(item))
    }

    const conflicts = []
    for (const itemConflict of syncItemsResponse.conflicts) {
      conflicts.push(this.itemConflictProjector.projectFull(itemConflict))
    }

    const sharedVaults = []
    for (const sharedVault of syncItemsResponse.sharedVaults) {
      sharedVaults.push(this.sharedVaultProjector.projectFull(sharedVault))
    }

    const sharedVaultInvites = []
    for (const sharedVaultInvite of syncItemsResponse.sharedVaultInvites) {
      sharedVaultInvites.push(this.sharedVaultInviteProjector.projectFull(sharedVaultInvite))
    }

    const contacts = []
    for (const contact of syncItemsResponse.contacts) {
      contacts.push(this.contactProjector.projectFull(contact))
    }

    return {
      retrieved_items: retrievedItems,
      saved_items: savedItems,
      conflicts,
      sync_token: syncItemsResponse.syncToken,
      cursor_token: syncItemsResponse.cursorToken,
      shared_vaults: sharedVaults,
      shared_vault_invites: sharedVaultInvites,
      contacts,
    }
  }
}
