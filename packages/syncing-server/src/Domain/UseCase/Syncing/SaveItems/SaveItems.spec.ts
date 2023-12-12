import { TimerInterface } from '@standardnotes/time'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { ItemSaveValidatorInterface } from '../../../Item/SaveValidator/ItemSaveValidatorInterface'
import { SaveItems } from './SaveItems'
import { SaveNewItem } from '../SaveNewItem/SaveNewItem'
import { UpdateExistingItem } from '../UpdateExistingItem/UpdateExistingItem'
import { Logger } from 'winston'
import { ContentType, Dates, Result, Timestamps, Uuid } from '@standardnotes/domain-core'
import { ItemHash } from '../../../Item/ItemHash'
import { Item } from '../../../Item/Item'
import { SendEventToClient } from '../SendEventToClient/SendEventToClient'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { ItemsChangedOnServerEvent } from '@standardnotes/domain-events'
import { SendEventToClients } from '../SendEventToClients/SendEventToClients'
import { SharedVaultAssociation } from '../../../SharedVault/SharedVaultAssociation'

describe('SaveItems', () => {
  let itemSaveValidator: ItemSaveValidatorInterface
  let itemRepository: ItemRepositoryInterface
  let timer: TimerInterface
  let saveNewItem: SaveNewItem
  let updateExistingItem: UpdateExistingItem
  let logger: Logger
  let itemHash1: ItemHash
  let savedItem: Item
  let sendEventToClient: SendEventToClient
  let sendEventToClients: SendEventToClients
  let domainEventFactory: DomainEventFactoryInterface

  const createUseCase = () =>
    new SaveItems(
      itemSaveValidator,
      itemRepository,
      timer,
      saveNewItem,
      updateExistingItem,
      sendEventToClient,
      sendEventToClients,
      domainEventFactory,
      logger,
    )

  beforeEach(() => {
    sendEventToClient = {} as jest.Mocked<SendEventToClient>
    sendEventToClient.execute = jest.fn().mockReturnValue(Result.ok())

    sendEventToClients = {} as jest.Mocked<SendEventToClients>
    sendEventToClients.execute = jest.fn().mockReturnValue(Result.ok())

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createItemsChangedOnServerEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<ItemsChangedOnServerEvent>)

    itemSaveValidator = {} as jest.Mocked<ItemSaveValidatorInterface>
    itemSaveValidator.validate = jest.fn().mockResolvedValue({ passed: true })

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findByUuid = jest.fn().mockResolvedValue(null)

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)

    savedItem = Item.create({
      duplicateOf: null,
      itemsKeyId: 'items-key-id',
      content: 'content',
      contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
      encItemKey: 'enc-item-key',
      authHash: 'auth-hash',
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      deleted: false,
      updatedWithSession: null,
      dates: Dates.create(new Date(123), new Date(123)).getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    saveNewItem = {} as jest.Mocked<SaveNewItem>
    saveNewItem.execute = jest.fn().mockReturnValue(Result.ok(savedItem))

    updateExistingItem = {} as jest.Mocked<UpdateExistingItem>
    updateExistingItem.execute = jest.fn().mockResolvedValue(Result.ok(savedItem))

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()

    itemHash1 = ItemHash.create({
      uuid: '00000000-0000-0000-0000-000000000000',
      user_uuid: 'user-uuid',
      content: 'content',
      content_type: ContentType.TYPES.Note,
      deleted: false,
      auth_hash: 'auth-hash',
      enc_item_key: 'enc-item-key',
      items_key_id: 'items-key-id',
      key_system_identifier: null,
      shared_vault_uuid: null,
      created_at: '2020-01-01T00:00:00.000Z',
      created_at_timestamp: 123,
      updated_at: '2020-01-01T00:00:00.000Z',
      updated_at_timestamp: 123,
    }).getValue()
  })

  it('should save new items', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      itemHashes: [itemHash1],
      userUuid: 'user-uuid',
      apiVersion: '1',
      readOnlyAccess: false,
      sessionUuid: 'session-uuid',
      snjsVersion: '2.200.0',
      isFreeUser: false,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().syncToken).toEqual('MjowLjAwMDEyNA==')
    expect(saveNewItem.execute).toHaveBeenCalledWith({
      itemHash: itemHash1,
      userUuid: 'user-uuid',
      sessionUuid: 'session-uuid',
    })
    expect(sendEventToClient.execute).toHaveBeenCalled()
  })

  it('should mark items as conflicts if saving new item fails', async () => {
    const useCase = createUseCase()

    saveNewItem.execute = jest.fn().mockResolvedValue(Result.fail('error'))

    const result = await useCase.execute({
      itemHashes: [itemHash1],
      userUuid: 'user-uuid',
      apiVersion: '1',
      readOnlyAccess: false,
      sessionUuid: 'session-uuid',
      snjsVersion: '2.200.0',
      isFreeUser: false,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().conflicts).toEqual([
      {
        unsavedItem: itemHash1,
        type: 'uuid_conflict',
      },
    ])
    expect(sendEventToClient.execute).not.toHaveBeenCalled()
  })

  it('should mark items as conflicts if saving new item throws an error', async () => {
    const useCase = createUseCase()

    saveNewItem.execute = jest.fn().mockRejectedValue(new Error('error'))

    const result = await useCase.execute({
      itemHashes: [itemHash1],
      userUuid: 'user-uuid',
      apiVersion: '1',
      readOnlyAccess: false,
      sessionUuid: 'session-uuid',
      snjsVersion: '2.200.0',
      isFreeUser: false,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().conflicts).toEqual([
      {
        unsavedItem: itemHash1,
        type: 'uuid_conflict',
      },
    ])
  })

  it('should not save items if in read-only mode', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      itemHashes: [itemHash1],
      userUuid: 'user-uuid',
      apiVersion: '1',
      readOnlyAccess: true,
      sessionUuid: 'session-uuid',
      snjsVersion: '2.200.0',
      isFreeUser: false,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(saveNewItem.execute).not.toHaveBeenCalled()
  })

  it('should return conflicts if the items have not passed validation', async () => {
    const useCase = createUseCase()

    const conflict = {
      unsavedItem: itemHash1,
      type: 'conflict-type',
    }
    itemSaveValidator.validate = jest.fn().mockResolvedValue({ passed: false, conflict })

    const result = await useCase.execute({
      itemHashes: [itemHash1],
      userUuid: 'user-uuid',
      apiVersion: '1',
      readOnlyAccess: false,
      sessionUuid: 'session-uuid',
      snjsVersion: '2.200.0',
      isFreeUser: false,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().conflicts).toEqual([conflict])
  })

  it('should mark items as saved if they are skipped on validation', async () => {
    const useCase = createUseCase()

    itemSaveValidator.validate = jest.fn().mockResolvedValue({ passed: false, skipped: savedItem })

    const result = await useCase.execute({
      itemHashes: [itemHash1],
      userUuid: 'user-uuid',
      apiVersion: '1',
      readOnlyAccess: false,
      sessionUuid: 'session-uuid',
      snjsVersion: '2.200.0',
      isFreeUser: false,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().savedItems).toEqual([savedItem])
  })

  it('should update existing items', async () => {
    const useCase = createUseCase()

    itemRepository.findByUuid = jest.fn().mockResolvedValue(savedItem)

    const result = await useCase.execute({
      itemHashes: [itemHash1],
      userUuid: '00000000-0000-0000-0000-000000000000',
      apiVersion: '1',
      readOnlyAccess: false,
      sessionUuid: 'session-uuid',
      snjsVersion: '2.200.0',
      isFreeUser: false,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(updateExistingItem.execute).toHaveBeenCalledWith({
      isFreeUser: false,
      itemHash: itemHash1,
      existingItem: savedItem,
      sessionUuid: 'session-uuid',
      performingUserUuid: '00000000-0000-0000-0000-000000000000',
    })
    expect(sendEventToClient.execute).toHaveBeenCalled()
    expect(sendEventToClients.execute).not.toHaveBeenCalled()
  })

  it('should update existing shared vault items', async () => {
    savedItem = Item.create({
      duplicateOf: null,
      itemsKeyId: 'items-key-id',
      content: 'content',
      contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
      encItemKey: 'enc-item-key',
      authHash: 'auth-hash',
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      deleted: false,
      updatedWithSession: null,
      sharedVaultAssociation: SharedVaultAssociation.create({
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000001').getValue(),
        lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      }).getValue(),
      dates: Dates.create(new Date(123), new Date(123)).getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    const useCase = createUseCase()

    itemRepository.findByUuid = jest.fn().mockResolvedValue(savedItem)
    updateExistingItem.execute = jest.fn().mockResolvedValue(Result.ok(savedItem))

    const result = await useCase.execute({
      itemHashes: [itemHash1],
      userUuid: '00000000-0000-0000-0000-000000000000',
      apiVersion: '1',
      readOnlyAccess: false,
      sessionUuid: 'session-uuid',
      snjsVersion: '2.200.0',
      isFreeUser: false,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(updateExistingItem.execute).toHaveBeenCalledWith({
      isFreeUser: false,
      itemHash: itemHash1,
      existingItem: savedItem,
      sessionUuid: 'session-uuid',
      performingUserUuid: '00000000-0000-0000-0000-000000000000',
    })
    expect(sendEventToClient.execute).toHaveBeenCalled()
    expect(sendEventToClients.execute).toHaveBeenCalled()
  })

  it('should mark items as conflicts if updating existing item fails', async () => {
    const useCase = createUseCase()

    itemRepository.findByUuid = jest.fn().mockResolvedValue(savedItem)
    updateExistingItem.execute = jest.fn().mockResolvedValue(Result.fail('error'))

    const result = await useCase.execute({
      itemHashes: [itemHash1],
      userUuid: 'user-uuid',
      apiVersion: '1',
      readOnlyAccess: false,
      sessionUuid: 'session-uuid',
      snjsVersion: '2.200.0',
      isFreeUser: false,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().conflicts).toEqual([
      {
        unsavedItem: itemHash1,
        type: 'uuid_conflict',
      },
    ])
  })

  it('should mark items as conflict if the item uuid is invalid', async () => {
    const useCase = createUseCase()

    itemRepository.findByUuid = jest.fn().mockResolvedValue(savedItem)
    updateExistingItem.execute = jest.fn().mockResolvedValue(Result.fail('error'))

    const result = await useCase.execute({
      itemHashes: [ItemHash.create({ ...itemHash1.props, uuid: 'invalid-uuid' }).getValue()],
      userUuid: 'user-uuid',
      apiVersion: '1',
      readOnlyAccess: false,
      sessionUuid: 'session-uuid',
      snjsVersion: '2.200.0',
      isFreeUser: false,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().conflicts).toEqual([
      {
        unsavedItem: ItemHash.create({ ...itemHash1.props, uuid: 'invalid-uuid' }).getValue(),
        type: 'uuid_conflict',
      },
    ])
  })

  it('should calculate the sync token based on existing and new items saved', async () => {
    const useCase = createUseCase()

    saveNewItem.execute = jest
      .fn()
      .mockResolvedValueOnce(Result.ok(savedItem))
      .mockResolvedValueOnce(
        Result.ok(
          Item.create({
            ...savedItem.props,
            timestamps: Timestamps.create(100, 100).getValue(),
          }).getValue(),
        ),
      )
      .mockResolvedValueOnce(
        Result.ok(
          Item.create({
            ...savedItem.props,
            timestamps: Timestamps.create(159, 159).getValue(),
          }).getValue(),
        ),
      )

    const result = await useCase.execute({
      itemHashes: [
        itemHash1,
        ItemHash.create({ ...itemHash1.props, uuid: '00000000-0000-0000-0000-000000000002' }).getValue(),
        ItemHash.create({ ...itemHash1.props, uuid: '00000000-0000-0000-0000-000000000003' }).getValue(),
      ],
      userUuid: 'user-uuid',
      apiVersion: '2',
      readOnlyAccess: false,
      sessionUuid: 'session-uuid',
      snjsVersion: '2.200.0',
      isFreeUser: false,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().syncToken).toEqual('MjowLjAwMDE2')
  })
})
