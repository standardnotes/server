import 'reflect-metadata'

import { ApiVersion } from '../../../Api/ApiVersion'
import { Item } from '../../../Item/Item'
import { ItemHash } from '../../../Item/ItemHash'

import { SyncItems } from './SyncItems'
import { ContentType, Dates, Result, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'
import { GetItems } from '../GetItems/GetItems'
import { SaveItems } from '../SaveItems/SaveItems'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { GetSharedVaults } from '../../SharedVaults/GetSharedVaults/GetSharedVaults'
import { GetMessagesSentToUser } from '../../Messaging/GetMessagesSentToUser/GetMessagesSentToUser'
import { GetUserNotifications } from '../../Messaging/GetUserNotifications/GetUserNotifications'
import { GetSharedVaultInvitesSentToUser } from '../../SharedVaults/GetSharedVaultInvitesSentToUser/GetSharedVaultInvitesSentToUser'

describe('SyncItems', () => {
  let getItemsUseCase: GetItems
  let saveItemsUseCase: SaveItems
  let itemRepository: ItemRepositoryInterface
  let item1: Item
  let item2: Item
  let item3: Item
  let itemHash: ItemHash
  let getSharedVaultsUseCase: GetSharedVaults
  let getSharedVaultInvitesSentToUserUseCase: GetSharedVaultInvitesSentToUser
  let getMessagesSentToUser: GetMessagesSentToUser
  let getUserNotifications: GetUserNotifications

  const createUseCase = () =>
    new SyncItems(
      itemRepository,
      getItemsUseCase,
      saveItemsUseCase,
      getSharedVaultsUseCase,
      getSharedVaultInvitesSentToUserUseCase,
      getMessagesSentToUser,
      getUserNotifications,
    )

  beforeEach(() => {
    item1 = Item.create(
      {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        updatedWithSession: null,
        content: 'foobar',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: null,
        authHash: null,
        itemsKeyId: null,
        duplicateOf: null,
        deleted: false,
        dates: Dates.create(new Date(1616164633241311), new Date(1616164633241311)).getValue(),
        timestamps: Timestamps.create(1616164633241311, 1616164633241311).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000001'),
    ).getValue()
    item2 = Item.create(
      {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        updatedWithSession: null,
        content: 'foobar',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: null,
        authHash: null,
        itemsKeyId: null,
        duplicateOf: null,
        deleted: false,
        dates: Dates.create(new Date(1616164633241311), new Date(1616164633241311)).getValue(),
        timestamps: Timestamps.create(1616164633241311, 1616164633241311).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000002'),
    ).getValue()
    item3 = Item.create(
      {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        updatedWithSession: null,
        content: 'foobar',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: null,
        authHash: null,
        itemsKeyId: null,
        duplicateOf: null,
        deleted: false,
        dates: Dates.create(new Date(1616164633241311), new Date(1616164633241311)).getValue(),
        timestamps: Timestamps.create(1616164633241311, 1616164633241311).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000003'),
    ).getValue()

    itemHash = ItemHash.create({
      uuid: '2-3-4',
      user_uuid: '1-2-3',
      key_system_identifier: null,
      shared_vault_uuid: null,
      content: 'asdqwe',
      content_type: ContentType.TYPES.Note,
      duplicate_of: null,
      enc_item_key: 'qweqwe',
      items_key_id: 'asdasd',
      created_at: '2021-02-19T11:35:45.655Z',
      updated_at: '2021-03-25T09:37:37.944Z',
    }).getValue()

    getItemsUseCase = {} as jest.Mocked<GetItems>
    getItemsUseCase.execute = jest.fn().mockReturnValue(
      Result.ok({
        items: [item1],
        cursorToken: 'asdzxc',
      }),
    )

    saveItemsUseCase = {} as jest.Mocked<SaveItems>
    saveItemsUseCase.execute = jest.fn().mockReturnValue(
      Result.ok({
        savedItems: [item2],
        conflicts: [],
        syncToken: 'qwerty',
      }),
    )

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findAll = jest.fn().mockReturnValue([item3, item1])

    getSharedVaultsUseCase = {} as jest.Mocked<GetSharedVaults>
    getSharedVaultsUseCase.execute = jest.fn().mockReturnValue(Result.ok([]))

    getSharedVaultInvitesSentToUserUseCase = {} as jest.Mocked<GetSharedVaultInvitesSentToUser>
    getSharedVaultInvitesSentToUserUseCase.execute = jest.fn().mockReturnValue(Result.ok([]))

    getMessagesSentToUser = {} as jest.Mocked<GetMessagesSentToUser>
    getMessagesSentToUser.execute = jest.fn().mockReturnValue(Result.ok([]))

    getUserNotifications = {} as jest.Mocked<GetUserNotifications>
    getUserNotifications.execute = jest.fn().mockReturnValue(Result.ok([]))
  })

  it('should sync items', async () => {
    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [itemHash],
      computeIntegrityHash: false,
      syncToken: 'foo',
      cursorToken: 'bar',
      limit: 10,
      readOnlyAccess: false,
      contentType: 'Note',
      apiVersion: ApiVersion.v20200115,
      sessionUuid: null,
      snjsVersion: '1.2.3',
    })
    expect(result.getValue()).toEqual({
      conflicts: [],
      cursorToken: 'asdzxc',
      retrievedItems: [item1],
      savedItems: [item2],
      syncToken: 'qwerty',
      sharedVaults: [],
      sharedVaultInvites: [],
      notifications: [],
      messages: [],
    })

    expect(getItemsUseCase.execute).toHaveBeenCalledWith({
      contentType: 'Note',
      cursorToken: 'bar',
      limit: 10,
      syncToken: 'foo',
      userUuid: '1-2-3',
    })
    expect(saveItemsUseCase.execute).toHaveBeenCalledWith({
      itemHashes: [itemHash],
      userUuid: '1-2-3',
      apiVersion: '20200115',
      readOnlyAccess: false,
      sessionUuid: null,
    })
  })

  it('should sync items and return items keys on top for first sync that is not a shared vault exclusive sync', async () => {
    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [itemHash],
      computeIntegrityHash: false,
      limit: 10,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
      contentType: 'Note',
      apiVersion: ApiVersion.v20200115,
      snjsVersion: '1.2.3',
    })
    expect(result.getValue()).toEqual({
      conflicts: [],
      cursorToken: 'asdzxc',
      retrievedItems: [item3, item1],
      savedItems: [item2],
      syncToken: 'qwerty',
      sharedVaults: [],
      sharedVaultInvites: [],
      notifications: [],
      messages: [],
    })
  })

  it('should sync items and not return items keys on top for first sync that is a shared vault exclusive sync', async () => {
    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [itemHash],
      computeIntegrityHash: false,
      limit: 10,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
      contentType: 'Note',
      apiVersion: ApiVersion.v20200115,
      snjsVersion: '1.2.3',
      sharedVaultUuids: ['00000000-0000-0000-0000-000000000000'],
    })
    expect(result.getValue()).toEqual({
      conflicts: [],
      cursorToken: 'asdzxc',
      retrievedItems: [item1],
      savedItems: [item2],
      syncToken: 'qwerty',
      sharedVaults: [],
      sharedVaultInvites: [],
      notifications: [],
      messages: [],
    })
  })

  it('should sync items and return filtered out sync conflicts for consecutive sync operations', async () => {
    getItemsUseCase.execute = jest.fn().mockReturnValue(
      Result.ok({
        items: [item1, item2],
        cursorToken: 'asdzxc',
      }),
    )

    saveItemsUseCase.execute = jest.fn().mockReturnValue(
      Result.ok({
        savedItems: [],
        conflicts: [
          {
            serverItem: item2,
            type: 'sync_conflict',
          },
          {
            serverItem: undefined,
            type: 'sync_conflict',
          },
        ],
        syncToken: 'qwerty',
      }),
    )

    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [itemHash],
      computeIntegrityHash: false,
      syncToken: 'foo',
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
      cursorToken: 'bar',
      limit: 10,
      contentType: 'Note',
      apiVersion: ApiVersion.v20200115,
      snjsVersion: '1.2.3',
    })

    expect(result.getValue()).toEqual({
      conflicts: [
        {
          serverItem: item2,
          type: 'sync_conflict',
        },
        {
          serverItem: undefined,
          type: 'sync_conflict',
        },
      ],
      cursorToken: 'asdzxc',
      retrievedItems: [item1],
      savedItems: [],
      syncToken: 'qwerty',
      sharedVaults: [],
      sharedVaultInvites: [],
      notifications: [],
      messages: [],
    })
  })

  it('should return error if get items fails', async () => {
    getItemsUseCase.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [itemHash],
      computeIntegrityHash: false,
      syncToken: 'foo',
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
      cursorToken: 'bar',
      limit: 10,
      contentType: 'Note',
      apiVersion: ApiVersion.v20200115,
      snjsVersion: '1.2.3',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if save items fails', async () => {
    saveItemsUseCase.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [itemHash],
      computeIntegrityHash: false,
      syncToken: 'foo',
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
      cursorToken: 'bar',
      limit: 10,
      contentType: 'Note',
      apiVersion: ApiVersion.v20200115,
      snjsVersion: '1.2.3',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if get shared vaults fails', async () => {
    getSharedVaultsUseCase.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [itemHash],
      computeIntegrityHash: false,
      syncToken: 'foo',
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
      cursorToken: 'bar',
      limit: 10,
      contentType: 'Note',
      apiVersion: ApiVersion.v20200115,
      snjsVersion: '1.2.3',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if get shared vault invites fails', async () => {
    getSharedVaultInvitesSentToUserUseCase.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [itemHash],
      computeIntegrityHash: false,
      syncToken: 'foo',
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
      cursorToken: 'bar',
      limit: 10,
      contentType: 'Note',
      apiVersion: ApiVersion.v20200115,
      snjsVersion: '1.2.3',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if get messages fails', async () => {
    getMessagesSentToUser.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [itemHash],
      computeIntegrityHash: false,
      syncToken: 'foo',
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
      cursorToken: 'bar',
      limit: 10,
      contentType: 'Note',
      apiVersion: ApiVersion.v20200115,
      snjsVersion: '1.2.3',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if get user notifications fails', async () => {
    getUserNotifications.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [itemHash],
      computeIntegrityHash: false,
      syncToken: 'foo',
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
      cursorToken: 'bar',
      limit: 10,
      contentType: 'Note',
      apiVersion: ApiVersion.v20200115,
      snjsVersion: '1.2.3',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
