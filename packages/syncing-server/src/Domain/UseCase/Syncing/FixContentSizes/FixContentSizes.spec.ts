import { Logger } from 'winston'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { FixContentSizes } from './FixContentSizes'
import { Uuid, ContentType, Dates, Timestamps, UniqueEntityId } from '@standardnotes/domain-core'
import { Item } from '../../../Item/Item'

describe('FixContentSizes', () => {
  let itemRepository: ItemRepositoryInterface
  let logger: Logger

  const createUseCase = () => new FixContentSizes(itemRepository, logger)

  beforeEach(() => {
    const existingItem = Item.create(
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
    itemRepository.findAll = jest.fn().mockReturnValue([existingItem])
    itemRepository.countAll = jest.fn().mockReturnValue(1)
    itemRepository.updateContentSize = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()
  })

  it('should fix content sizes', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(itemRepository.updateContentSize).toHaveBeenCalledTimes(1)
    expect(itemRepository.updateContentSize).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000000', 947)
  })

  it('should return an error if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Given value is not a valid uuid: invalid')
  })

  it('should do nothing if the content size is correct', async () => {
    const existingItem = Item.create(
      {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        updatedWithSession: null,
        content: 'foobar',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        contentSize: 947,
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
    itemRepository.findAll = jest.fn().mockReturnValue([existingItem])

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(itemRepository.updateContentSize).toHaveBeenCalledTimes(0)
  })
})
