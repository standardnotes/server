import { DomainEventInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { ItemBackupServiceInterface } from '../../../Item/ItemBackupServiceInterface'
import { ItemRepositoryResolverInterface } from '../../../Item/ItemRepositoryResolverInterface'
import { DumpItem } from './DumpItem'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { Item } from '../../../Item/Item'
import { Uuid, ContentType, Dates, Timestamps, UniqueEntityId, Result } from '@standardnotes/domain-core'

describe('DumpItem', () => {
  let itemRepositoryResolver: ItemRepositoryResolverInterface
  let itemRepository: ItemRepositoryInterface
  let item: Item
  let itemBackupService: ItemBackupServiceInterface
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface

  const createUseCase = () =>
    new DumpItem(itemRepositoryResolver, itemBackupService, domainEventFactory, domainEventPublisher)

  beforeEach(() => {
    item = Item.create(
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

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findByUuid = jest.fn().mockResolvedValue(item)

    itemRepositoryResolver = {} as jest.Mocked<ItemRepositoryResolverInterface>
    itemRepositoryResolver.resolve = jest.fn().mockReturnValue(itemRepository)

    itemBackupService = {} as jest.Mocked<ItemBackupServiceInterface>
    itemBackupService.dump = jest.fn().mockResolvedValue(Result.ok('dump-path'))

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createItemDumpedEvent = jest.fn().mockReturnValue({} as jest.Mocked<DomainEventInterface>)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()
  })

  it('should dump item', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      itemUuid: '00000000-0000-0000-0000-000000000000',
      roleNames: ['CORE_USER'],
    })

    expect(result.isFailed()).toBe(false)

    expect(itemBackupService.dump).toHaveBeenCalled()
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should fail if item cannot be found', async () => {
    itemRepository.findByUuid = jest.fn().mockResolvedValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      itemUuid: '00000000-0000-0000-0000-000000000000',
      roleNames: ['CORE_USER'],
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should fail if item cannot be dumped', async () => {
    itemBackupService.dump = jest.fn().mockResolvedValue(Result.fail('error'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      itemUuid: '00000000-0000-0000-0000-000000000000',
      roleNames: ['CORE_USER'],
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should fail if item uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      itemUuid: 'invalid-uuid',
      roleNames: ['CORE_USER'],
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should fail if role names are invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      itemUuid: '00000000-0000-0000-0000-000000000000',
      roleNames: ['invalid-role'],
    })

    expect(result.isFailed()).toBe(true)
  })
})
