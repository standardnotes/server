import { ContentType } from '@standardnotes/domain-core'
import { ItemContentSizeDescriptor } from '../../../Item/ItemContentSizeDescriptor'
import { ItemHash } from '../../../Item/ItemHash'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { CheckForContentLimit } from './CheckForContentLimit'

describe('CheckForContentLimit', () => {
  let itemRepository: ItemRepositoryInterface
  let freeUserContentLimitInBytes: number
  let itemHash: ItemHash

  const createUseCase = () => new CheckForContentLimit(itemRepository, freeUserContentLimitInBytes)

  beforeEach(() => {
    itemRepository = {} as ItemRepositoryInterface

    itemHash = ItemHash.create({
      uuid: '00000000-0000-0000-0000-000000000000',
      content: 'test content',
      content_type: ContentType.TYPES.Note,
      user_uuid: '00000000-0000-0000-0000-000000000000',
      key_system_identifier: null,
      shared_vault_uuid: null,
    }).getValue()

    freeUserContentLimitInBytes = 100
  })

  it('should return a failure result if user uuid is invalid', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({ userUuid: 'invalid-uuid', itemsBeingModified: [itemHash] })

    expect(result.isFailed()).toBe(true)
  })

  it('should return a failure result if user has exceeded their content limit', async () => {
    itemRepository.findContentSizeForComputingTransferLimit = jest
      .fn()
      .mockResolvedValue([ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000000', 101).getValue()])

    const useCase = createUseCase()
    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      itemsBeingModified: [itemHash],
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should return a success result if user has not exceeded their content limit', async () => {
    itemRepository.findContentSizeForComputingTransferLimit = jest
      .fn()
      .mockResolvedValue([ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000000', 99).getValue()])

    const useCase = createUseCase()
    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      itemsBeingModified: [itemHash],
    })

    expect(result.isFailed()).toBe(false)
  })

  it('should return a success result if user has exceeded their content limit but user modifications are not increasing content size', async () => {
    itemHash.calculateContentSize = jest.fn().mockReturnValue(99)

    itemRepository.findContentSizeForComputingTransferLimit = jest
      .fn()
      .mockResolvedValue([ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000000', 101).getValue()])

    const useCase = createUseCase()
    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      itemsBeingModified: [itemHash],
    })

    expect(result.isFailed()).toBe(false)
  })

  it('should treat items with no content size defined as 0', async () => {
    itemHash.calculateContentSize = jest.fn().mockReturnValue(99)

    itemRepository.findContentSizeForComputingTransferLimit = jest
      .fn()
      .mockResolvedValue([ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000000', null).getValue()])

    const useCase = createUseCase()
    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      itemsBeingModified: [itemHash],
    })

    expect(result.isFailed()).toBe(false)
  })
})
