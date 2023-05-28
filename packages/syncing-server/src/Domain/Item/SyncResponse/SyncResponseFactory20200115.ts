import { VaultInvite } from '../../VaultInvite/Model/VaultInvite'
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
import { VaultInviteProjection } from '../../../Projection/VaultInviteProjection'
import { VaultProjection } from '../../../Projection/VaultProjection'
import { Vault } from '../../Vault/Model/Vault'

export class SyncResponseFactory20200115 implements SyncResponseFactoryInterface {
  constructor(
    private itemProjector: ProjectorInterface<Item, ItemProjection>,
    private itemConflictProjector: ProjectorInterface<ItemConflict, ItemConflictProjection>,
    private savedItemProjector: ProjectorInterface<Item, SavedItemProjection>,
    private vaultInviteProjector: ProjectorInterface<VaultInvite, VaultInviteProjection>,
    private contactProjector: ProjectorInterface<Contact, ContactProjection>,
    private vaultProjector: ProjectorInterface<Vault, VaultProjection>,
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

    const vaults = []
    for (const vault of syncItemsResponse.vaults) {
      vaults.push(this.vaultProjector.projectFull(vault))
    }

    const vaultInvites = []
    for (const vaultInvite of syncItemsResponse.vaultInvites) {
      vaultInvites.push(this.vaultInviteProjector.projectFull(vaultInvite))
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
      vaults,
      vault_invites: vaultInvites,
      contacts,
    }
  }
}
