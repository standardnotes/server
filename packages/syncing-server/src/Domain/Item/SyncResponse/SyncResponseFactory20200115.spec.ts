import 'reflect-metadata'

import { MapperInterface } from '@standardnotes/domain-core'

import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'
import { SyncResponseFactory20200115 } from './SyncResponseFactory20200115'
import { ItemHttpRepresentation } from '../../../Mapping/Http/ItemHttpRepresentation'
import { SavedItemHttpRepresentation } from '../../../Mapping/Http/SavedItemHttpRepresentation'
import { ItemConflictHttpRepresentation } from '../../../Mapping/Http/ItemConflictHttpRepresentation'
import { MessageHttpRepresentation } from '../../../Mapping/Http/MessageHttpRepresentation'
import { NotificationHttpRepresentation } from '../../../Mapping/Http/NotificationHttpRepresentation'
import { Notification } from '../../Notifications/Notification'
import { SharedVaultHttpRepresentation } from '../../../Mapping/Http/SharedVaultHttpRepresentation'
import { SharedVaultInviteHttpRepresentation } from '../../../Mapping/Http/SharedVaultInviteHttpRepresentation'
import { Message } from '../../Message/Message'
import { SharedVault } from '../../SharedVault/SharedVault'
import { SharedVaultInvite } from '../../SharedVault/User/Invite/SharedVaultInvite'

describe('SyncResponseFactory20200115', () => {
  let itemMapper: MapperInterface<Item, ItemHttpRepresentation>
  let savedItemMapper: MapperInterface<Item, SavedItemHttpRepresentation>
  let itemConflictMapper: MapperInterface<ItemConflict, ItemConflictHttpRepresentation>
  let itemProjection: ItemHttpRepresentation
  let savedItemHttpRepresentation: SavedItemHttpRepresentation
  let itemConflictProjection: ItemConflictHttpRepresentation
  let item1: Item
  let item2: Item
  let itemConflict: ItemConflict
  let sharedVault: SharedVault
  let sharedVaultInvite: SharedVaultInvite
  let message: Message
  let notification: Notification
  let sharedVaultMapper: MapperInterface<SharedVault, SharedVaultHttpRepresentation>
  let sharedVaultInvitesMapper: MapperInterface<SharedVaultInvite, SharedVaultInviteHttpRepresentation>
  let messageMapper: MapperInterface<Message, MessageHttpRepresentation>
  let notificationMapper: MapperInterface<Notification, NotificationHttpRepresentation>

  const createFactory = () =>
    new SyncResponseFactory20200115(
      itemMapper,
      itemConflictMapper,
      savedItemMapper,
      sharedVaultMapper,
      sharedVaultInvitesMapper,
      messageMapper,
      notificationMapper,
    )

  beforeEach(() => {
    itemProjection = {
      uuid: '2-3-4',
    } as jest.Mocked<ItemHttpRepresentation>

    itemMapper = {} as jest.Mocked<MapperInterface<Item, ItemHttpRepresentation>>
    itemMapper.toProjection = jest.fn().mockReturnValue(itemProjection)

    itemConflictMapper = {} as jest.Mocked<MapperInterface<ItemConflict, ItemConflictHttpRepresentation>>
    itemConflictMapper.toProjection = jest.fn().mockReturnValue(itemConflictProjection)

    savedItemHttpRepresentation = {
      uuid: '1-2-3',
    } as jest.Mocked<SavedItemHttpRepresentation>

    savedItemMapper = {} as jest.Mocked<MapperInterface<Item, SavedItemHttpRepresentation>>
    savedItemMapper.toProjection = jest.fn().mockReturnValue(savedItemHttpRepresentation)

    item1 = {} as jest.Mocked<Item>

    item2 = {} as jest.Mocked<Item>

    itemConflict = {} as jest.Mocked<ItemConflict>

    sharedVaultMapper = {} as jest.Mocked<MapperInterface<SharedVault, SharedVaultHttpRepresentation>>
    sharedVaultMapper.toProjection = jest.fn().mockReturnValue({} as jest.Mocked<SharedVaultHttpRepresentation>)

    sharedVaultInvitesMapper = {} as jest.Mocked<
      MapperInterface<SharedVaultInvite, SharedVaultInviteHttpRepresentation>
    >
    sharedVaultInvitesMapper.toProjection = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<SharedVaultInviteHttpRepresentation>)

    messageMapper = {} as jest.Mocked<MapperInterface<Message, MessageHttpRepresentation>>
    messageMapper.toProjection = jest.fn().mockReturnValue({} as jest.Mocked<MessageHttpRepresentation>)

    notificationMapper = {} as jest.Mocked<MapperInterface<Notification, NotificationHttpRepresentation>>
    notificationMapper.toProjection = jest.fn().mockReturnValue({} as jest.Mocked<NotificationHttpRepresentation>)

    sharedVault = {} as jest.Mocked<SharedVault>
    sharedVaultInvite = {} as jest.Mocked<SharedVaultInvite>
    message = {} as jest.Mocked<Message>
    notification = {} as jest.Mocked<Notification>
  })

  it('should turn sync items response into a sync response for API Version 20200115', async () => {
    expect(
      await createFactory().createResponse({
        retrievedItems: [item1],
        savedItems: [item2],
        conflicts: [itemConflict],
        syncToken: 'sync-test',
        cursorToken: 'cursor-test',
        sharedVaults: [sharedVault],
        sharedVaultInvites: [sharedVaultInvite],
        messages: [message],
        notifications: [notification],
      }),
    ).toEqual({
      retrieved_items: [itemProjection],
      saved_items: [savedItemHttpRepresentation],
      conflicts: [itemConflictProjection],
      sync_token: 'sync-test',
      cursor_token: 'cursor-test',
      shared_vaults: [{} as jest.Mocked<SharedVaultHttpRepresentation>],
      shared_vault_invites: [{} as jest.Mocked<SharedVaultInviteHttpRepresentation>],
      messages: [{} as jest.Mocked<MessageHttpRepresentation>],
      notifications: [{} as jest.Mocked<NotificationHttpRepresentation>],
    })
  })
})
