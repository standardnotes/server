import 'reflect-metadata'

import { ContentType } from '@standardnotes/common'
import { Item } from './Item'
import { ItemHash } from './ItemHash'

import { ItemRepositoryInterface } from './ItemRepositoryInterface'
import { ItemService } from './ItemService'
import { ApiVersion } from '../Api/ApiVersion'
import { RevisionServiceInterface } from '../Revision/RevisionServiceInterface'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { Logger } from 'winston'
import { Timer, TimerInterface } from '@standardnotes/time'
import { ItemSaveValidatorInterface } from './SaveValidator/ItemSaveValidatorInterface'
import { ItemFactoryInterface } from './ItemFactoryInterface'
import { ItemConflict } from './ItemConflict'
import { ItemTransferCalculatorInterface } from './ItemTransferCalculatorInterface'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { ItemProjection } from '../../Projection/ItemProjection'

describe('ItemService', () => {
  let itemRepository: ItemRepositoryInterface
  let revisionService: RevisionServiceInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  const revisionFrequency = 300
  const contentSizeTransferLimit = 100
  let timer: TimerInterface
  let item1: Item
  let item2: Item
  let itemHash1: ItemHash
  let itemHash2: ItemHash
  let emptyHash: ItemHash
  let syncToken: string
  let logger: Logger
  let itemSaveValidator: ItemSaveValidatorInterface
  let newItem: Item
  let itemFactory: ItemFactoryInterface
  let timeHelper: Timer
  let itemTransferCalculator: ItemTransferCalculatorInterface
  let itemProjector: ProjectorInterface<Item, ItemProjection>

  const createService = () =>
    new ItemService(
      itemSaveValidator,
      itemFactory,
      itemRepository,
      revisionService,
      domainEventPublisher,
      domainEventFactory,
      revisionFrequency,
      contentSizeTransferLimit,
      itemTransferCalculator,
      timer,
      itemProjector,
      logger,
    )

  beforeEach(() => {
    timeHelper = new Timer()

    item1 = {
      uuid: '1-2-3',
      userUuid: '1-2-3',
      createdAt: new Date(1616164633241311),
      createdAtTimestamp: 1616164633241311,
      updatedAt: new Date(1616164633241311),
      updatedAtTimestamp: 1616164633241311,
    } as jest.Mocked<Item>
    item2 = {
      uuid: '2-3-4',
      userUuid: '1-2-3',
      createdAt: new Date(1616164633241312),
      createdAtTimestamp: 1616164633241312,
      updatedAt: new Date(1616164633241312),
      updatedAtTimestamp: 1616164633241312,
    } as jest.Mocked<Item>

    itemHash1 = {
      uuid: '1-2-3',
      content: 'asdqwe1',
      content_type: ContentType.Note,
      duplicate_of: null,
      enc_item_key: 'qweqwe1',
      items_key_id: 'asdasd1',
      created_at: timeHelper.formatDate(
        timeHelper.convertMicrosecondsToDate(item1.createdAtTimestamp),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
      updated_at: timeHelper.formatDate(
        new Date(timeHelper.convertMicrosecondsToMilliseconds(item1.updatedAtTimestamp) + 1),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
    } as jest.Mocked<ItemHash>

    itemHash2 = {
      uuid: '2-3-4',
      content: 'asdqwe2',
      content_type: ContentType.Note,
      duplicate_of: null,
      enc_item_key: 'qweqwe2',
      items_key_id: 'asdasd2',
      created_at: timeHelper.formatDate(
        timeHelper.convertMicrosecondsToDate(item2.createdAtTimestamp),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
      updated_at: timeHelper.formatDate(
        new Date(timeHelper.convertMicrosecondsToMilliseconds(item2.updatedAtTimestamp) + 1),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
    } as jest.Mocked<ItemHash>

    emptyHash = {
      uuid: '2-3-4',
    } as jest.Mocked<ItemHash>

    itemTransferCalculator = {} as jest.Mocked<ItemTransferCalculatorInterface>
    itemTransferCalculator.computeItemUuidsToFetch = jest.fn().mockReturnValue([item1.uuid, item2.uuid])

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findAll = jest.fn().mockReturnValue([item1, item2])
    itemRepository.countAll = jest.fn().mockReturnValue(2)
    itemRepository.save = jest.fn().mockImplementation((item: Item) => item)

    revisionService = {} as jest.Mocked<RevisionServiceInterface>
    revisionService.createRevision = jest.fn()

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

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createDuplicateItemSyncedEvent = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
    logger.warn = jest.fn()

    syncToken = Buffer.from('2:1616164633.241564', 'utf-8').toString('base64')

    itemSaveValidator = {} as jest.Mocked<ItemSaveValidatorInterface>
    itemSaveValidator.validate = jest.fn().mockReturnValue({ passed: true })

    newItem = {} as jest.Mocked<Item>

    itemFactory = {} as jest.Mocked<ItemFactoryInterface>
    itemFactory.create = jest.fn().mockReturnValue(newItem)
    itemFactory.createStub = jest.fn().mockReturnValue(newItem)

    itemProjector = {} as jest.Mocked<ProjectorInterface<Item, ItemProjection>>
    itemProjector.projectFull = jest.fn().mockReturnValue({
      uuid: '1-2-3',
      items_key_id: 'foobar',
      duplicate_of: null,
      enc_item_key: 'foobar',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed viverra tellus in hac habitasse. Tortor posuere ac ut consequat semper. Ut diam quam nulla porttitor. Sapien pellentesque habitant morbi tristique senectus et netus et malesuada. Dapibus ultrices in iaculis nunc. Pellentesque habitant morbi tristique senectus et netus et malesuada fames. Faucibus et molestie ac feugiat sed lectus vestibulum mattis. Eu consequat ac felis donec. Eget velit aliquet sagittis id. Nullam eget felis eget nunc. Turpis in eu mi bibendum neque egestas congue.',
      content_type: ContentType.Note,
      auth_hash: 'foobar',
      deleted: false,
      created_at: '2022-09-01 10:00:00',
      created_at_timestamp: 123123123123123,
      updated_at: '2022-09-01 10:00:00',
      updated_at_timestamp: 123123123123123,
      updated_with_session: '2-4-5',
    })
  })

  it('should retrieve all items for a user from last sync with sync token version 1', async () => {
    syncToken = Buffer.from('1:2021-03-15 07:00:00', 'utf-8').toString('base64')

    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken,
        contentType: ContentType.Note,
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
      uuids: ['1-2-3', '2-3-4'],
      sortOrder: 'ASC',
      sortBy: 'updated_at_timestamp',
    })
  })

  it('should retrieve all items for a user from last sync', async () => {
    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken,
        contentType: ContentType.Note,
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
      uuids: ['1-2-3', '2-3-4'],
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })
  })

  it('should retrieve all items for a user from last sync with upper bound items limit', async () => {
    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken,
        contentType: ContentType.Note,
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
      uuids: ['1-2-3', '2-3-4'],
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
        contentType: ContentType.Note,
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
      contentType: ContentType.Note,
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
      uuids: ['1-2-3', '2-3-4'],
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
        contentType: ContentType.Note,
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
      uuids: ['1-2-3', '2-3-4'],
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })
  })

  it('should retrieve all undeleted items for a user without cursor or sync token', async () => {
    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        contentType: ContentType.Note,
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
      uuids: ['1-2-3', '2-3-4'],
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })
  })

  it('should retrieve all items with default limit if not defined', async () => {
    await createService().getItems({
      userUuid: '1-2-3',
      syncToken,
      contentType: ContentType.Note,
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
      uuids: ['1-2-3', '2-3-4'],
      sortOrder: 'ASC',
      sortBy: 'updated_at_timestamp',
    })
  })

  it('should retrieve all items with non-positive limit if not defined', async () => {
    await createService().getItems({
      userUuid: '1-2-3',
      syncToken,
      limit: 0,
      contentType: ContentType.Note,
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
      uuids: ['1-2-3', '2-3-4'],
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
        contentType: ContentType.Note,
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
        contentType: ContentType.Note,
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })

  it('should front load keys items to top of the collection for better client performance', async () => {
    const item3 = {
      uuid: '1-2-3',
    } as jest.Mocked<Item>
    const item4 = {
      uuid: '4-5-6',
    } as jest.Mocked<Item>

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
      syncToken: 'MjpOYU4=',
    })

    expect(revisionService.createRevision).toHaveBeenCalledTimes(1)
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

    expect(revisionService.createRevision).toHaveBeenCalledTimes(0)
  })

  it('should save new items that are duplicates', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)
    const duplicateItem = { updatedAtTimestamp: 1616164633241570, duplicateOf: '1-2-3' } as jest.Mocked<Item>
    itemFactory.create = jest.fn().mockReturnValueOnce(duplicateItem)

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

    expect(revisionService.createRevision).toHaveBeenCalledTimes(1)
    expect(domainEventPublisher.publish).toHaveBeenCalledTimes(1)
    expect(domainEventFactory.createDuplicateItemSyncedEvent).toHaveBeenCalledTimes(1)
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

    const skipped = {} as jest.Mocked<Item>
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
      syncToken: 'MjpOYU4=',
    })
  })

  it('should calculate the sync token based on last updated date of saved items incremented with 1 microsecond to avoid returning same object in subsequent sync', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)

    const itemHash3 = {
      uuid: '3-4-5',
      content: 'asdqwe3',
      content_type: ContentType.Note,
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

    itemFactory.create = jest
      .fn()
      .mockReturnValueOnce({ updatedAtTimestamp: item1Timestamp, duplicateOf: null } as jest.Mocked<Item>)
      .mockReturnValueOnce({ updatedAtTimestamp: item2Timestamp, duplicateOf: null } as jest.Mocked<Item>)
      .mockReturnValueOnce({ updatedAtTimestamp: item3Timestamp, duplicateOf: null } as jest.Mocked<Item>)

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
      savedItems: [
        {
          content: 'asdqwe1',
          contentSize: 950,
          contentType: 'Note',
          createdAtTimestamp: expect.any(Number),
          createdAt: expect.any(Date),
          encItemKey: 'qweqwe1',
          itemsKeyId: 'asdasd1',
          userUuid: '1-2-3',
          updatedAtTimestamp: expect.any(Number),
          updatedAt: expect.any(Date),
          updatedWithSession: '2-3-4',
          uuid: '1-2-3',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should update existing items from legacy clients', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(item1)

    delete itemHash1.updated_at
    delete itemHash1.updated_at_timestamp

    const result = await createService().saveItems({
      itemHashes: [itemHash1],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20161215,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [
        {
          content: 'asdqwe1',
          contentSize: 950,
          contentType: 'Note',
          createdAtTimestamp: expect.any(Number),
          createdAt: expect.any(Date),
          encItemKey: 'qweqwe1',
          itemsKeyId: 'asdasd1',
          userUuid: '1-2-3',
          updatedAtTimestamp: expect.any(Number),
          updatedAt: expect.any(Date),
          updatedWithSession: '2-3-4',
          uuid: '1-2-3',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should update existing items with created_at_timestamp', async () => {
    itemHash1.created_at_timestamp = 123
    itemHash1.updated_at_timestamp = item1.updatedAtTimestamp
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
      savedItems: [
        {
          content: 'asdqwe1',
          contentSize: 950,
          contentType: 'Note',
          createdAtTimestamp: 123,
          createdAt: expect.any(Date),
          encItemKey: 'qweqwe1',
          itemsKeyId: 'asdasd1',
          userUuid: '1-2-3',
          updatedAtTimestamp: expect.any(Number),
          updatedAt: expect.any(Date),
          updatedWithSession: '2-3-4',
          uuid: '1-2-3',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should update existing empty hashes', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(item2)
    emptyHash.updated_at = timeHelper.formatDate(
      new Date(timeHelper.convertMicrosecondsToMilliseconds(item2.updatedAtTimestamp) + 1),
      'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
    )

    const result = await createService().saveItems({
      itemHashes: [emptyHash],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [
        {
          contentSize: 950,
          createdAtTimestamp: expect.any(Number),
          createdAt: expect.any(Date),
          userUuid: '1-2-3',
          updatedAtTimestamp: expect.any(Number),
          updatedAt: expect.any(Date),
          updatedWithSession: '2-3-4',
          uuid: '2-3-4',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should create a revision for existing item if revisions frequency is matched', async () => {
    timer.convertMicrosecondsToSeconds = itemRepository.findByUuid = jest.fn().mockReturnValue(item1)

    const result = await createService().saveItems({
      itemHashes: [itemHash1],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [
        {
          content: 'asdqwe1',
          contentSize: 950,
          contentType: 'Note',
          createdAtTimestamp: expect.any(Number),
          createdAt: expect.any(Date),
          encItemKey: 'qweqwe1',
          itemsKeyId: 'asdasd1',
          userUuid: '1-2-3',
          updatedAtTimestamp: expect.any(Number),
          updatedAt: expect.any(Date),
          updatedWithSession: '2-3-4',
          uuid: '1-2-3',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should update existing items with empty user-agent', async () => {
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
      savedItems: [
        {
          content: 'asdqwe1',
          contentSize: 950,
          contentType: 'Note',
          createdAtTimestamp: expect.any(Number),
          createdAt: expect.any(Date),
          encItemKey: 'qweqwe1',
          itemsKeyId: 'asdasd1',
          userUuid: '1-2-3',
          updatedAtTimestamp: expect.any(Number),
          updatedAt: expect.any(Date),
          updatedWithSession: '2-3-4',
          uuid: '1-2-3',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should update existing items with auth hash', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(item1)

    itemHash1.auth_hash = 'test'

    const result = await createService().saveItems({
      itemHashes: [itemHash1],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [
        {
          content: 'asdqwe1',
          contentSize: 950,
          contentType: 'Note',
          createdAtTimestamp: expect.any(Number),
          createdAt: expect.any(Date),
          encItemKey: 'qweqwe1',
          itemsKeyId: 'asdasd1',
          authHash: 'test',
          userUuid: '1-2-3',
          updatedAtTimestamp: expect.any(Number),
          updatedAt: expect.any(Date),
          updatedWithSession: '2-3-4',
          uuid: '1-2-3',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should mark existing item as deleted', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(item1)

    itemHash1.deleted = true
    const result = await createService().saveItems({
      itemHashes: [itemHash1],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [
        {
          content: null,
          contentSize: 0,
          authHash: null,
          contentType: 'Note',
          createdAtTimestamp: expect.any(Number),
          createdAt: expect.any(Date),
          encItemKey: null,
          deleted: true,
          itemsKeyId: null,
          userUuid: '1-2-3',
          updatedAtTimestamp: expect.any(Number),
          updatedAt: expect.any(Date),
          updatedWithSession: '2-3-4',
          uuid: '1-2-3',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should mark existing item as duplicate', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(item1)

    itemHash1.duplicate_of = '1-2-3'
    const result = await createService().saveItems({
      itemHashes: [itemHash1],
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      readOnlyAccess: false,
      sessionUuid: '2-3-4',
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [
        {
          content: 'asdqwe1',
          contentSize: 950,
          contentType: 'Note',
          createdAtTimestamp: expect.any(Number),
          createdAt: expect.any(Date),
          encItemKey: 'qweqwe1',
          duplicateOf: '1-2-3',
          itemsKeyId: 'asdasd1',
          userUuid: '1-2-3',
          updatedAtTimestamp: expect.any(Number),
          updatedAt: expect.any(Date),
          updatedWithSession: '2-3-4',
          uuid: '1-2-3',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
    expect(domainEventPublisher.publish).toHaveBeenCalledTimes(1)
    expect(domainEventFactory.createDuplicateItemSyncedEvent).toHaveBeenCalledTimes(1)
  })

  it('should skip saving conflicting items and mark them as sync conflicts when saving to database fails', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)
    itemRepository.save = jest.fn().mockImplementation(() => {
      throw new Error('Something bad happened')
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
