import { DomainEventInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { Timer, TimerInterface } from '@standardnotes/time'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { Item } from '../../../Item/Item'
import { ItemHash } from '../../../Item/ItemHash'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { UpdateExistingItem } from './UpdateExistingItem'
import { Uuid, ContentType, Dates, Timestamps, UniqueEntityId, Result } from '@standardnotes/domain-core'

describe('UpdateExistingItem', () => {
  let itemRepository: ItemRepositoryInterface
  let timer: TimerInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let itemHash1: ItemHash
  let item1: Item

  const createUseCase = () => new UpdateExistingItem(itemRepository, timer, domainEventPublisher, domainEventFactory, 5)

  beforeEach(() => {
    const timeHelper = new Timer()

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
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    itemHash1 = ItemHash.create({
      uuid: '1-2-3',
      user_uuid: '00000000-0000-0000-0000-000000000000',
      key_system_identifier: null,
      shared_vault_uuid: null,
      content: 'asdqwe1',
      content_type: ContentType.TYPES.Note,
      duplicate_of: null,
      enc_item_key: 'qweqwe1',
      auth_hash: 'auth_hash',
      items_key_id: 'asdasd1',
      created_at: timeHelper.formatDate(
        timeHelper.convertMicrosecondsToDate(item1.props.timestamps.createdAt),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
      updated_at: timeHelper.formatDate(
        new Date(timeHelper.convertMicrosecondsToMilliseconds(item1.props.timestamps.updatedAt) + 1),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
    }).getValue()

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.save = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123456789)
    timer.convertMicrosecondsToDate = jest.fn().mockReturnValue(new Date(123456789))
    timer.convertStringDateToMicroseconds = jest.fn().mockReturnValue(123456789)
    timer.convertMicrosecondsToSeconds = jest.fn().mockReturnValue(123456789)
    timer.convertStringDateToDate = jest.fn().mockReturnValue(new Date(123456789))

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createDuplicateItemSyncedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<DomainEventInterface>)
    domainEventFactory.createItemRevisionCreationRequested = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<DomainEventInterface>)
  })

  it('should update item', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      existingItem: item1,
      itemHash: itemHash1,
      sessionUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(itemRepository.save).toHaveBeenCalled()
  })

  it('should return error if session uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      existingItem: item1,
      itemHash: itemHash1,
      sessionUuid: 'invalid-uuid',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if content type is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      existingItem: item1,
      itemHash: ItemHash.create({
        ...itemHash1.props,
        content_type: 'invalid',
      }).getValue(),
      sessionUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should mark item as deleted if item hash is deleted', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      existingItem: item1,
      itemHash: ItemHash.create({
        ...itemHash1.props,
        deleted: true,
      }).getValue(),
      sessionUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(itemRepository.save).toHaveBeenCalled()
    expect(item1.props.deleted).toBeTruthy()
    expect(item1.props.content).toBeNull()
    expect(item1.props.encItemKey).toBeNull()
    expect(item1.props.authHash).toBeNull()
    expect(item1.props.itemsKeyId).toBeNull()
    expect(item1.props.duplicateOf).toBeNull()
  })

  it('should mark item as duplicate if item hash has duplicate_of', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      existingItem: item1,
      itemHash: ItemHash.create({
        ...itemHash1.props,
        duplicate_of: '00000000-0000-0000-0000-000000000001',
      }).getValue(),
      sessionUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(itemRepository.save).toHaveBeenCalled()
    expect(item1.props.duplicateOf?.value).toBe('00000000-0000-0000-0000-000000000001')
  })

  it('shuld return error if duplicate uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      existingItem: item1,
      itemHash: ItemHash.create({
        ...itemHash1.props,
        duplicate_of: 'invalid-uuid',
      }).getValue(),
      sessionUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should update item with update timestamps', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      existingItem: item1,
      itemHash: ItemHash.create({
        ...itemHash1.props,
        updated_at_timestamp: 123,
        created_at_timestamp: 123,
      }).getValue(),
      sessionUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(itemRepository.save).toHaveBeenCalled()
  })

  it('should return error if created at time is not give in any form', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      existingItem: item1,
      itemHash: ItemHash.create({
        ...itemHash1.props,
        created_at: undefined,
        created_at_timestamp: undefined,
      }).getValue(),
      sessionUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if dates could not be created from timestamps', async () => {
    const mock = jest.spyOn(Dates, 'create')
    mock.mockImplementation(() => {
      return Result.fail('Oops')
    })

    const useCase = createUseCase()

    const result = await useCase.execute({
      existingItem: item1,
      itemHash: ItemHash.create({
        ...itemHash1.props,
        created_at_timestamp: 123,
        updated_at_timestamp: 123,
      }).getValue(),
      sessionUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()

    mock.mockRestore()
  })

  it('should return error if timestamps could not be created from timestamps', async () => {
    const mock = jest.spyOn(Timestamps, 'create')
    mock.mockImplementation(() => {
      return Result.fail('Oops')
    })

    const useCase = createUseCase()

    const result = await useCase.execute({
      existingItem: item1,
      itemHash: ItemHash.create({
        ...itemHash1.props,
        created_at_timestamp: 123,
        updated_at_timestamp: 123,
      }).getValue(),
      sessionUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
    mock.mockRestore()
  })
})
