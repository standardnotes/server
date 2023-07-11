import 'reflect-metadata'

import { Timer, TimerInterface } from '@standardnotes/time'
import { Logger } from 'winston'

import { Item } from './Item'
import { ItemHash } from './ItemHash'

import { ItemRepositoryInterface } from './ItemRepositoryInterface'
import { ItemService } from './ItemService'
import { ApiVersion } from '../Api/ApiVersion'
import { ItemSaveValidatorInterface } from './SaveValidator/ItemSaveValidatorInterface'
import { ItemConflict } from './ItemConflict'
import { ItemTransferCalculatorInterface } from './ItemTransferCalculatorInterface'
import { SaveNewItem } from '../UseCase/Syncing/SaveNewItem/SaveNewItem'
import { UpdateExistingItem } from '../UseCase/Syncing/UpdateExistingItem/UpdateExistingItem'
import { Uuid, ContentType, Dates, Timestamps, UniqueEntityId, Result } from '@standardnotes/domain-core'

describe('ItemService', () => {
  let itemRepository: ItemRepositoryInterface
  const contentSizeTransferLimit = 100
  let timer: TimerInterface
  let item1: Item
  let item2: Item
  let itemHash1: ItemHash
  let itemHash2: ItemHash
  let syncToken: string
  let logger: Logger
  let itemSaveValidator: ItemSaveValidatorInterface
  let newItem: Item
  let timeHelper: Timer
  let itemTransferCalculator: ItemTransferCalculatorInterface
  let saveNewItemUseCase: SaveNewItem
  let updateExistingItemUseCase: UpdateExistingItem
  const maxItemsSyncLimit = 300

  const createService = () =>
    new ItemService(
      itemSaveValidator,
      itemRepository,
      contentSizeTransferLimit,
      itemTransferCalculator,
      timer,
      maxItemsSyncLimit,
      saveNewItemUseCase,
      updateExistingItemUseCase,
      logger,
    )

  beforeEach(() => {
    timeHelper = new Timer()

    item1 = Item.create(
      {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        updatedWithSession: null,
        content: 'foobar1',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: null,
        authHash: null,
        itemsKeyId: null,
        duplicateOf: null,
        deleted: false,
        dates: Dates.create(new Date(1616164633241311), new Date(1616164633241311)).getValue(),
        timestamps: Timestamps.create(1616164633241311, 1616164633241311).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()
    item2 = Item.create(
      {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        updatedWithSession: null,
        content: 'foobar2',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: null,
        authHash: null,
        itemsKeyId: null,
        duplicateOf: null,
        deleted: false,
        dates: Dates.create(new Date(1616164633241312), new Date(1616164633241312)).getValue(),
        timestamps: Timestamps.create(1616164633241312, 1616164633241312).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000001'),
    ).getValue()

    itemHash1 = {
      uuid: '1-2-3',
      content: 'asdqwe1',
      content_type: ContentType.TYPES.Note,
      duplicate_of: null,
      enc_item_key: 'qweqwe1',
      items_key_id: 'asdasd1',
      created_at: timeHelper.formatDate(
        timeHelper.convertMicrosecondsToDate(item1.props.timestamps.createdAt),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
      updated_at: timeHelper.formatDate(
        new Date(timeHelper.convertMicrosecondsToMilliseconds(item1.props.timestamps.updatedAt) + 1),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
    } as jest.Mocked<ItemHash>

    itemHash2 = {
      uuid: '2-3-4',
      content: 'asdqwe2',
      content_type: ContentType.TYPES.Note,
      duplicate_of: null,
      enc_item_key: 'qweqwe2',
      items_key_id: 'asdasd2',
      created_at: timeHelper.formatDate(
        timeHelper.convertMicrosecondsToDate(item2.props.timestamps.createdAt),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
      updated_at: timeHelper.formatDate(
        new Date(timeHelper.convertMicrosecondsToMilliseconds(item2.props.timestamps.updatedAt) + 1),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
    } as jest.Mocked<ItemHash>

    itemTransferCalculator = {} as jest.Mocked<ItemTransferCalculatorInterface>
    itemTransferCalculator.computeItemUuidsToFetch = jest
      .fn()
      .mockReturnValue([item1.id.toString(), item2.id.toString()])

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findAll = jest.fn().mockReturnValue([item1, item2])
    itemRepository.countAll = jest.fn().mockReturnValue(2)

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1616164633241568)
    timer.getUTCDate = jest.fn().mockReturnValue(new Date())
    timer.convertStringDateToDate = jest
      .fn()
      .mockImplementation((date: string) => timeHelper.convertStringDateToDate(date))
    timer.convertMicrosecondsToSeconds = jest.fn().mockReturnValue(600)
    timer.convertStringDateToMicroseconds = jest
      .fn()
      .mockImplementation((date: string) => timeHelper.convertStringDateToMicroseconds(date))
    timer.convertMicrosecondsToDate = jest
      .fn()
      .mockImplementation((microseconds: number) => timeHelper.convertMicrosecondsToDate(microseconds))

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
    logger.warn = jest.fn()

    syncToken = Buffer.from('2:1616164633.241564', 'utf-8').toString('base64')

    itemSaveValidator = {} as jest.Mocked<ItemSaveValidatorInterface>
    itemSaveValidator.validate = jest.fn().mockReturnValue({ passed: true })

    newItem = Item.create(
      {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        updatedWithSession: null,
        content: 'foobar2',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: null,
        authHash: null,
        itemsKeyId: null,
        duplicateOf: null,
        deleted: false,
        dates: Dates.create(new Date(1616164633241313), new Date(1616164633241313)).getValue(),
        timestamps: Timestamps.create(1616164633241313, 1616164633241313).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000002'),
    ).getValue()

    saveNewItemUseCase = {} as jest.Mocked<SaveNewItem>
    saveNewItemUseCase.execute = jest.fn().mockReturnValue(Result.ok(newItem))

    updateExistingItemUseCase = {} as jest.Mocked<UpdateExistingItem>
    updateExistingItemUseCase.execute = jest.fn().mockReturnValue(Result.ok(item1))
  })

  it('should retrieve all items for a user from last sync with sync token version 1', async () => {
    syncToken = Buffer.from('1:2021-03-15 07:00:00', 'utf-8').toString('base64')

    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken,
        contentType: ContentType.TYPES.Note,
      }),
    ).toEqual({
      items: [item1, item2],
    })

    expect(itemRepository.countAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: 1615791600000000,
      syncTimeComparison: '>',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      userUuid: '1-2-3',
      limit: 150,
    })
    expect(itemRepository.findAll).toHaveBeenCalledWith({
      uuids: ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'],
      sortOrder: 'ASC',
      sortBy: 'updated_at_timestamp',
    })
  })

  it('should retrieve all items for a user from last sync', async () => {
    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken,
        contentType: ContentType.TYPES.Note,
      }),
    ).toEqual({
      items: [item1, item2],
    })

    expect(itemRepository.countAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: 1616164633241564,
      syncTimeComparison: '>',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      userUuid: '1-2-3',
      limit: 150,
    })
    expect(itemRepository.findAll).toHaveBeenCalledWith({
      uuids: ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'],
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })
  })

  it('should retrieve all items for a user from last sync with upper bound items limit', async () => {
    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken,
        contentType: ContentType.TYPES.Note,
        limit: 1000,
      }),
    ).toEqual({
      items: [item1, item2],
    })

    expect(itemRepository.countAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: 1616164633241564,
      syncTimeComparison: '>',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      userUuid: '1-2-3',
      limit: 300,
    })
    expect(itemRepository.findAll).toHaveBeenCalledWith({
      uuids: ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'],
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })
  })

  it('should retrieve no items for a user if there are none from last sync', async () => {
    itemTransferCalculator.computeItemUuidsToFetch = jest.fn().mockReturnValue([])

    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken,
        contentType: ContentType.TYPES.Note,
      }),
    ).toEqual({
      items: [],
    })

    expect(itemRepository.findAll).not.toHaveBeenCalled()
    expect(itemRepository.countAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: 1616164633241564,
      syncTimeComparison: '>',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      userUuid: '1-2-3',
      limit: 150,
    })
  })

  it('should return a cursor token if there are more items than requested with limit', async () => {
    itemRepository.findAll = jest.fn().mockReturnValue([item1])

    const itemsResponse = await createService().getItems({
      userUuid: '1-2-3',
      syncToken,
      limit: 1,
      contentType: ContentType.TYPES.Note,
    })

    expect(itemsResponse).toEqual({
      cursorToken: 'MjoxNjE2MTY0NjMzLjI0MTMxMQ==',
      items: [item1],
    })

    expect(Buffer.from(<string>itemsResponse.cursorToken, 'base64').toString('utf-8')).toEqual('2:1616164633.241311')

    expect(itemRepository.countAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: 1616164633241564,
      syncTimeComparison: '>',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      userUuid: '1-2-3',
      limit: 1,
    })
    expect(itemRepository.findAll).toHaveBeenCalledWith({
      uuids: ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'],
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })
  })

  it('should retrieve all items for a user from cursor token', async () => {
    const cursorToken = Buffer.from('2:1616164633.241123', 'utf-8').toString('base64')

    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken,
        cursorToken,
        contentType: ContentType.TYPES.Note,
      }),
    ).toEqual({
      items: [item1, item2],
    })

    expect(itemRepository.countAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: 1616164633241123,
      syncTimeComparison: '>=',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      userUuid: '1-2-3',
      limit: 150,
    })
    expect(itemRepository.findAll).toHaveBeenCalledWith({
      uuids: ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'],
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })
  })

  it('should retrieve all undeleted items for a user without cursor or sync token', async () => {
    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        contentType: ContentType.TYPES.Note,
      }),
    ).toEqual({
      items: [item1, item2],
    })

    expect(itemRepository.countAll).toHaveBeenCalledWith({
      contentType: 'Note',
      deleted: false,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      syncTimeComparison: '>',
      userUuid: '1-2-3',
      limit: 150,
    })
    expect(itemRepository.findAll).toHaveBeenCalledWith({
      uuids: ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'],
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })
  })

  it('should retrieve all items with default limit if not defined', async () => {
    await createService().getItems({
      userUuid: '1-2-3',
      syncToken,
      contentType: ContentType.TYPES.Note,
    })

    expect(itemRepository.countAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: 1616164633241564,
      syncTimeComparison: '>',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      userUuid: '1-2-3',
      limit: 150,
    })
    expect(itemRepository.findAll).toHaveBeenCalledWith({
      uuids: ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'],
      sortOrder: 'ASC',
      sortBy: 'updated_at_timestamp',
    })
  })

  it('should retrieve all items with non-positive limit if not defined', async () => {
    await createService().getItems({
      userUuid: '1-2-3',
      syncToken,
      limit: 0,
      contentType: ContentType.TYPES.Note,
    })

    expect(itemRepository.countAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: 1616164633241564,
      syncTimeComparison: '>',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      userUuid: '1-2-3',
      limit: 150,
    })
    expect(itemRepository.findAll).toHaveBeenCalledWith({
      uuids: ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'],
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })
  })

  it('should throw an error if the sync token is missing time', async () => {
    let error = null

    try {
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken: '2:',
        limit: 0,
        contentType: ContentType.TYPES.Note,
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })

  it('should throw an error if the sync token is missing version', async () => {
    let error = null

    try {
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken: '1234567890',
        limit: 0,
        contentType: ContentType.TYPES.Note,
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })

  it('should front load keys items to top of the collection for better client performance', async () => {
    const item3 = Item.create(
      {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        updatedWithSession: null,
        content: 'foobar1',
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
    const item4 = Item.create(
      {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        updatedWithSession: null,
        content: 'foobar2',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: null,
        authHash: null,
        itemsKeyId: null,
        duplicateOf: null,
        deleted: false,
        dates: Dates.create(new Date(1616164633241312), new Date(1616164633241312)).getValue(),
        timestamps: Timestamps.create(1616164633241312, 1616164633241312).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000004'),
    ).getValue()

    itemRepository.findAll = jest.fn().mockReturnValue([item3, item4])

    await createService().frontLoadKeysItemsToTop('1-2-3', [item1, item2])
  })

  it('should save new items', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)

    const result = await createService().saveItems({
      itemHashes: [itemHash1],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [newItem],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTMxNA==',
    })

    expect(saveNewItemUseCase.execute).toHaveBeenCalled()
  })

  it('should not save new items in read only access mode', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)

    const result = await createService().saveItems({
      itemHashes: [itemHash1],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: true,
      sessionUuid: null,
    })

    expect(result).toEqual({
      conflicts: [
        {
          type: 'readonly_error',
          unsavedItem: itemHash1,
        },
      ],
      savedItems: [],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })

    expect(saveNewItemUseCase.execute).not.toHaveBeenCalled()
  })

  it('should save new items that are duplicates', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)
    const duplicateItem = Item.create(
      {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        updatedWithSession: null,
        content: 'foobar1',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: null,
        authHash: null,
        itemsKeyId: null,
        duplicateOf: Uuid.create('00000000-0000-0000-0000-000000000001').getValue(),
        deleted: false,
        dates: Dates.create(new Date(1616164633241570), new Date(1616164633241570)).getValue(),
        timestamps: Timestamps.create(1616164633241570, 1616164633241570).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000005'),
    ).getValue()
    saveNewItemUseCase.execute = jest.fn().mockReturnValue(Result.ok(duplicateItem))

    const result = await createService().saveItems({
      itemHashes: [itemHash1],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [duplicateItem],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU3MQ==',
    })
  })

  it('should skip items that are conflicting on validation', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)

    const conflict = {} as jest.Mocked<ItemConflict>
    const validationResult = { passed: false, conflict }
    itemSaveValidator.validate = jest.fn().mockReturnValue(validationResult)

    const result = await createService().saveItems({
      itemHashes: [itemHash1],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result).toEqual({
      conflicts: [conflict],
      savedItems: [],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should mark items as saved that are skipped on validation', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)

    const skipped = item1
    const validationResult = { passed: false, skipped }
    itemSaveValidator.validate = jest.fn().mockReturnValue(validationResult)

    const result = await createService().saveItems({
      itemHashes: [itemHash1],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [skipped],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTMxMg==',
    })
  })

  it('should calculate the sync token based on last updated date of saved items incremented with 1 microsecond to avoid returning same object in subsequent sync', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)

    const itemHash3 = {
      uuid: '3-4-5',
      content: 'asdqwe3',
      content_type: ContentType.TYPES.Note,
      duplicate_of: null,
      enc_item_key: 'qweqwe3',
      items_key_id: 'asdasd3',
      created_at: '2021-02-19T11:35:45.652Z',
      updated_at: '2021-03-25T09:37:37.943Z',
    } as jest.Mocked<ItemHash>

    const saveProcedureStartTimestamp = 1616164633241580
    const item1Timestamp = 1616164633241570
    const item2Timestamp = 1616164633241568
    const item3Timestamp = 1616164633241569
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValueOnce(saveProcedureStartTimestamp)

    saveNewItemUseCase.execute = jest
      .fn()
      .mockReturnValueOnce(
        Result.ok(
          Item.create(
            {
              ...item1.props,
              timestamps: Timestamps.create(item1Timestamp, item1Timestamp).getValue(),
            },
            new UniqueEntityId('00000000-0000-0000-0000-000000000001'),
          ).getValue(),
        ),
      )
      .mockReturnValueOnce(
        Result.ok(
          Item.create(
            {
              ...item2.props,
              timestamps: Timestamps.create(item2Timestamp, item2Timestamp).getValue(),
            },
            new UniqueEntityId('00000000-0000-0000-0000-000000000002'),
          ).getValue(),
        ),
      )
      .mockReturnValueOnce(
        Result.ok(
          Item.create(
            {
              ...item2.props,
              timestamps: Timestamps.create(item3Timestamp, item3Timestamp).getValue(),
            },
            new UniqueEntityId('00000000-0000-0000-0000-000000000003'),
          ).getValue(),
        ),
      )

    const result = await createService().saveItems({
      itemHashes: [itemHash1, itemHash3, itemHash2],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result.syncToken).toEqual('MjoxNjE2MTY0NjMzLjI0MTU3MQ==')
    expect(Buffer.from(result.syncToken, 'base64').toString('utf-8')).toEqual('2:1616164633.241571')
  })

  it('should update existing items', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(item1)

    const result = await createService().saveItems({
      itemHashes: [itemHash1],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [item1],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTMxMg==',
    })
  })

  it('should mark as skipped existing items that failed to update', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(item1)
    updateExistingItemUseCase.execute = jest.fn().mockReturnValue(Result.fail('Oops'))

    const result = await createService().saveItems({
      itemHashes: [itemHash1],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result).toEqual({
      conflicts: [
        {
          type: 'uuid_conflict',
          unsavedItem: itemHash1,
        },
      ],
      savedItems: [],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should skip saving conflicting items and mark them as sync conflicts when saving fails', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)
    saveNewItemUseCase.execute = jest.fn().mockReturnValue(Result.fail('Oops'))

    const result = await createService().saveItems({
      itemHashes: [itemHash1, itemHash2],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result).toEqual({
      conflicts: [
        {
          type: 'uuid_conflict',
          unsavedItem: itemHash1,
        },
        {
          type: 'uuid_conflict',
          unsavedItem: itemHash2,
        },
      ],
      savedItems: [],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should skip saving conflicting items and mark them as sync conflicts when saving throws an error', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)
    saveNewItemUseCase.execute = jest.fn().mockImplementation(() => {
      throw new Error('Oops')
    })

    const result = await createService().saveItems({
      itemHashes: [itemHash1, itemHash2],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result).toEqual({
      conflicts: [
        {
          type: 'uuid_conflict',
          unsavedItem: itemHash1,
        },
        {
          type: 'uuid_conflict',
          unsavedItem: itemHash2,
        },
      ],
      savedItems: [],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })
})
