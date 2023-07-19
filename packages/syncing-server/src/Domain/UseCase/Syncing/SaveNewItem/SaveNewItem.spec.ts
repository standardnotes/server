import { Timer, TimerInterface } from '@standardnotes/time'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { SaveNewItem } from './SaveNewItem'
import { DomainEventInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { ItemHash } from '../../../Item/ItemHash'
import { ContentType, Dates, Result, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'
import { Item } from '../../../Item/Item'
import { SharedVaultAssociation } from '../../../SharedVault/SharedVaultAssociation'
import { KeySystemAssociation } from '../../../KeySystem/KeySystemAssociation'

describe('SaveNewItem', () => {
  let itemRepository: ItemRepositoryInterface
  let timer: TimerInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let itemHash1: ItemHash
  let item1: Item

  const createUseCase = () => new SaveNewItem(itemRepository, timer, domainEventPublisher, domainEventFactory)

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
      uuid: '00000000-0000-0000-0000-000000000000',
      user_uuid: '00000000-0000-0000-0000-000000000000',
      key_system_identifier: null,
      shared_vault_uuid: null,
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
    }).getValue()

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.save = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123456789)
    timer.convertMicrosecondsToDate = jest.fn().mockReturnValue(new Date(123456789))
    timer.convertStringDateToMicroseconds = jest.fn().mockReturnValue(123456789)
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

  it('saves a new item', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000001',
      itemHash: itemHash1,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(itemRepository.save).toHaveBeenCalled()
  })

  it('saves a new empty item', async () => {
    const useCase = createUseCase()

    itemHash1 = ItemHash.create({
      ...itemHash1.props,
      content: undefined,
      content_type: null,
      enc_item_key: undefined,
      items_key_id: undefined,
    }).getValue()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000001',
      itemHash: itemHash1,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(itemRepository.save).toHaveBeenCalled()
  })

  it('saves a new item with given timestamps', async () => {
    const useCase = createUseCase()

    itemHash1 = ItemHash.create({
      ...itemHash1.props,
      created_at_timestamp: 123,
      updated_at_timestamp: 123,
    }).getValue()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000001',
      itemHash: itemHash1,
    })

    expect(result.isFailed()).toBeFalsy()
  })

  it('publishes a duplicate item synced event if the item is a duplicate', async () => {
    const useCase = createUseCase()

    itemHash1 = ItemHash.create({
      ...itemHash1.props,
      duplicate_of: '00000000-0000-0000-0000-000000000003',
    }).getValue()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000001',
      itemHash: itemHash1,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(domainEventFactory.createDuplicateItemSyncedEvent).toHaveBeenCalled()
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('publishes a item revision creation requested event if the item is a revision', async () => {
    const useCase = createUseCase()

    itemHash1 = ItemHash.create({
      ...itemHash1.props,
      updated_at: '2021-03-19T17:17:13.241Z',
    }).getValue()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000001',
      itemHash: itemHash1,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(domainEventFactory.createItemRevisionCreationRequested).toHaveBeenCalled()
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('returns a failure if the item cannot be saved', async () => {
    const mock = jest.spyOn(Item, 'create')
    mock.mockImplementation(() => {
      return Result.fail('Oops')
    })

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000001',
      itemHash: itemHash1,
    })

    expect(result.isFailed()).toBeTruthy()

    mock.mockRestore()
  })

  it('returns a failure if the user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-00000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000001',
      itemHash: itemHash1,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('returns a failure if the session uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-00000000000',
      itemHash: itemHash1,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('returns a failure if the content type is invalid', async () => {
    const useCase = createUseCase()

    itemHash1 = ItemHash.create({
      ...itemHash1.props,
      content_type: 'invalid',
    }).getValue()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000001',
      itemHash: itemHash1,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('returns a failure if the duplicate uuid is invalid', async () => {
    const useCase = createUseCase()

    itemHash1 = ItemHash.create({
      ...itemHash1.props,
      duplicate_of: 'invalid',
    }).getValue()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000001',
      itemHash: itemHash1,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('returns a failure if it fails to create dates', async () => {
    const mock = jest.spyOn(Dates, 'create')
    mock.mockImplementation(() => {
      return Result.fail('Oops')
    })

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000001',
      itemHash: itemHash1,
    })

    expect(result.isFailed()).toBeTruthy()

    mock.mockRestore()
  })

  it('return a failure if it fails to create timestamps', async () => {
    const mock = jest.spyOn(Timestamps, 'create')
    mock.mockImplementation(() => {
      return Result.fail('Oops')
    })

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000001',
      itemHash: itemHash1,
    })

    expect(result.isFailed()).toBeTruthy()

    mock.mockRestore()
  })

  it('returns a failure if the item hash has an invalid uuid', async () => {
    const useCase = createUseCase()

    itemHash1 = ItemHash.create({
      ...itemHash1.props,
      uuid: '1-2-3',
    }).getValue()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-00000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000001',
      itemHash: itemHash1,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  describe('when item hash represents a shared vault item', () => {
    it('returns a failure if the shared vault uuid is invalid', async () => {
      const useCase = createUseCase()

      itemHash1 = ItemHash.create({
        ...itemHash1.props,
        shared_vault_uuid: '1-2-3',
      }).getValue()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sessionUuid: '00000000-0000-0000-0000-000000000001',
        itemHash: itemHash1,
      })

      expect(result.isFailed()).toBeTruthy()
    })

    it('should create a shared vault association between the item and the shared vault', async () => {
      const useCase = createUseCase()

      itemHash1 = ItemHash.create({
        ...itemHash1.props,
        shared_vault_uuid: '00000000-0000-0000-0000-000000000001',
      }).getValue()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sessionUuid: '00000000-0000-0000-0000-000000000001',
        itemHash: itemHash1,
      })

      expect(result.isFailed()).toBeFalsy()
      expect(result.getValue().props.sharedVaultAssociation?.props.lastEditedBy.value).toEqual(
        '00000000-0000-0000-0000-000000000000',
      )
      expect(itemRepository.save).toHaveBeenCalled()
    })

    it('should return a failure if it fails to create a shared vault association', async () => {
      const mock = jest.spyOn(SharedVaultAssociation, 'create')
      mock.mockImplementation(() => {
        return Result.fail('Oops')
      })

      const useCase = createUseCase()

      itemHash1 = ItemHash.create({
        ...itemHash1.props,
        shared_vault_uuid: '00000000-0000-0000-0000-000000000001',
      }).getValue()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sessionUuid: '00000000-0000-0000-0000-000000000001',
        itemHash: itemHash1,
      })

      expect(result.isFailed()).toBeTruthy()

      mock.mockRestore()
    })
  })

  describe('when item hash has a dedicated key system', () => {
    it('should create a key system for the item if the item hash has information about a key system used for encryption', async () => {
      const useCase = createUseCase()

      itemHash1 = ItemHash.create({
        ...itemHash1.props,
        key_system_identifier: '00000000-0000-0000-0000-000000000001',
      }).getValue()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sessionUuid: '00000000-0000-0000-0000-000000000001',
        itemHash: itemHash1,
      })

      expect(result.isFailed()).toBeFalsy()
      expect(result.getValue().props.keySystemAssociation?.props.itemUuid.value).toEqual(
        '00000000-0000-0000-0000-000000000000',
      )
      expect(itemRepository.save).toHaveBeenCalled()
    })

    it('should return a failure if the item hash has an invalid key system identifier', async () => {
      const useCase = createUseCase()

      itemHash1 = ItemHash.create({
        ...itemHash1.props,
        key_system_identifier: 123 as unknown as string,
      }).getValue()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sessionUuid: '00000000-0000-0000-0000-000000000001',
        itemHash: itemHash1,
      })

      expect(result.isFailed()).toBeTruthy()
    })

    it('should return a failure if it fails to create a key system', async () => {
      const mock = jest.spyOn(KeySystemAssociation, 'create')
      mock.mockImplementation(() => {
        return Result.fail('Oops')
      })

      const useCase = createUseCase()

      itemHash1 = ItemHash.create({
        ...itemHash1.props,
        key_system_identifier: '00000000-0000-0000-0000-000000000001',
      }).getValue()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sessionUuid: '00000000-0000-0000-0000-000000000001',
        itemHash: itemHash1,
      })

      expect(result.isFailed()).toBeTruthy()

      mock.mockRestore()
    })
  })
})
