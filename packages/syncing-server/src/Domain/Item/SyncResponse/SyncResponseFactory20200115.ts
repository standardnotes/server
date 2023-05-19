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
import { GroupUserKey } from '../../GroupUserKey/Model/GroupUserKey'
import { GroupUserKeyProjection } from '../../../Projection/GroupUserKeyProjection'
import { ContactProjection } from '../../../Projection/ContactProjection'

export class SyncResponseFactory20200115 implements SyncResponseFactoryInterface {
  constructor(
    private itemProjector: ProjectorInterface<Item, ItemProjection>,
    private itemConflictProjector: ProjectorInterface<ItemConflict, ItemConflictProjection>,
    private savedItemProjector: ProjectorInterface<Item, SavedItemProjection>,
    private groupUserKeyProjector: ProjectorInterface<GroupUserKey, GroupUserKeyProjection>,
    private contactProjector: ProjectorInterface<Contact, ContactProjection>,
  ) {}

  async createResponse(syncItemsResponse: SyncItemsResponse): Promise<SyncResponse20200115> {
    const retrievedItems = []
    for (const item of syncItemsResponse.retrievedItems) {
      retrievedItems.push(<ItemProjection>this.itemProjector.projectFull(item))
    }

    const savedItems = []
    for (const item of syncItemsResponse.savedItems) {
      savedItems.push(<SavedItemProjection>this.savedItemProjector.projectFull(item))
    }

    const conflicts = []
    for (const itemConflict of syncItemsResponse.conflicts) {
      conflicts.push(<ItemConflictProjection>this.itemConflictProjector.projectFull(itemConflict))
    }

    const groupKeys = []
    for (const groupKey of syncItemsResponse.groupKeys) {
      groupKeys.push(<GroupUserKeyProjection>this.groupUserKeyProjector.projectFull(groupKey))
    }

    const contacts = []
    for (const contact of syncItemsResponse.contacts) {
      contacts.push(<ContactProjection>this.contactProjector.projectFull(contact))
    }

    return {
      retrieved_items: retrievedItems,
      saved_items: savedItems,
      conflicts,
      sync_token: syncItemsResponse.syncToken,
      cursor_token: syncItemsResponse.cursorToken,
      group_keys: groupKeys,
      contacts,
    }
  }
}
