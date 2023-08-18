import { Logger } from 'winston'

import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { TransitionItemsFromPrimaryToSecondaryDatabaseForUser } from './TransitionItemsFromPrimaryToSecondaryDatabaseForUser'
import { Item } from '../../../Item/Item'
import { ContentType, Dates, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

describe('TransitionItemsFromPrimaryToSecondaryDatabaseForUser', () => {
  let primaryItemRepository: ItemRepositoryInterface
  let secondaryItemRepository: ItemRepositoryInterface | null
  let logger: Logger
  let primaryItem1: Item
  let primaryItem2: Item
  let secondaryItem1: Item
  let secondaryItem2: Item

  const createUseCase = () =>
    new TransitionItemsFromPrimaryToSecondaryDatabaseForUser(primaryItemRepository, secondaryItemRepository, logger)

  beforeEach(() => {
    primaryItem1 = Item.create(
      {
        duplicateOf: null,
        itemsKeyId: 'items-key-id=1',
        content: 'content-1',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: 'enc-item-key-1',
        authHash: 'auth-hash-1',
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        deleted: false,
        updatedWithSession: null,
        dates: Dates.create(new Date(123), new Date(123)).getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    primaryItem2 = Item.create(
      {
        duplicateOf: null,
        itemsKeyId: 'items-key-id=2',
        content: 'content-2',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: 'enc-item-key-2',
        authHash: 'auth-hash-2',
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        deleted: true,
        updatedWithSession: null,
        dates: Dates.create(new Date(123), new Date(123)).getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000001'),
    ).getValue()

    secondaryItem1 = Item.create(
      {
        duplicateOf: null,
        itemsKeyId: 'items-key-id=1',
        content: 'content-1',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: 'enc-item-key-1',
        authHash: 'auth-hash-1',
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        deleted: false,
        updatedWithSession: null,
        dates: Dates.create(new Date(123), new Date(123)).getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    secondaryItem2 = Item.create(
      {
        duplicateOf: null,
        itemsKeyId: 'items-key-id=2',
        content: 'content-2',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: 'enc-item-key-2',
        authHash: 'auth-hash-2',
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        deleted: true,
        updatedWithSession: null,
        dates: Dates.create(new Date(123), new Date(123)).getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000001'),
    ).getValue()

    primaryItemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    primaryItemRepository.countAll = jest.fn().mockResolvedValue(2)
    primaryItemRepository.findAll = jest
      .fn()
      .mockResolvedValueOnce([primaryItem1])
      .mockResolvedValueOnce([primaryItem2])
      .mockResolvedValueOnce([primaryItem1])
      .mockResolvedValueOnce([primaryItem2])
    primaryItemRepository.deleteByUserUuid = jest.fn().mockResolvedValue(undefined)

    secondaryItemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    secondaryItemRepository.save = jest.fn().mockResolvedValue(undefined)
    secondaryItemRepository.deleteByUserUuid = jest.fn().mockResolvedValue(undefined)
    secondaryItemRepository.countAll = jest.fn().mockResolvedValue(2)
    secondaryItemRepository.findByUuid = jest
      .fn()
      .mockResolvedValueOnce(secondaryItem1)
      .mockResolvedValueOnce(secondaryItem2)

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
  })

  describe('successfull transition', () => {
    it('should transition items from primary to secondary database', async () => {
      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeFalsy()

      expect(primaryItemRepository.countAll).toHaveBeenCalledTimes(2)
      expect(primaryItemRepository.countAll).toHaveBeenCalledWith({ userUuid: '00000000-0000-0000-0000-000000000000' })
      expect(primaryItemRepository.findAll).toHaveBeenCalledTimes(4)
      expect(primaryItemRepository.findAll).toHaveBeenNthCalledWith(1, {
        userUuid: '00000000-0000-0000-0000-000000000000',
        limit: 1,
        offset: 0,
      })
      expect(primaryItemRepository.findAll).toHaveBeenNthCalledWith(2, {
        userUuid: '00000000-0000-0000-0000-000000000000',
        limit: 1,
        offset: 1,
      })
      expect(primaryItemRepository.findAll).toHaveBeenNthCalledWith(3, {
        userUuid: '00000000-0000-0000-0000-000000000000',
        limit: 1,
        offset: 0,
      })
      expect(primaryItemRepository.findAll).toHaveBeenNthCalledWith(4, {
        userUuid: '00000000-0000-0000-0000-000000000000',
        limit: 1,
        offset: 1,
      })
      expect((secondaryItemRepository as ItemRepositoryInterface).save).toHaveBeenCalledTimes(2)
      expect((secondaryItemRepository as ItemRepositoryInterface).save).toHaveBeenCalledWith(primaryItem1)
      expect((secondaryItemRepository as ItemRepositoryInterface).save).toHaveBeenCalledWith(primaryItem2)
      expect((secondaryItemRepository as ItemRepositoryInterface).deleteByUserUuid).not.toHaveBeenCalled()
      expect(primaryItemRepository.deleteByUserUuid).toHaveBeenCalledTimes(1)
    })

    it('should log an error if deleting items from primary database fails', async () => {
      primaryItemRepository.deleteByUserUuid = jest.fn().mockRejectedValue(new Error('error'))

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeFalsy()

      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to clean up primary database items for user 00000000-0000-0000-0000-000000000000: error',
      )
    })
  })

  describe('failed transition', () => {
    it('should remove items from secondary database if integrity check fails', async () => {
      const secondaryItem2WithDifferentContent = Item.create({
        ...secondaryItem2.props,
        content: 'different-content',
      }).getValue()

      ;(secondaryItemRepository as ItemRepositoryInterface).findByUuid = jest
        .fn()
        .mockResolvedValueOnce(secondaryItem1)
        .mockResolvedValueOnce(secondaryItem2WithDifferentContent)

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual(
        'Item 00000000-0000-0000-0000-000000000001 is not identical in primary and secondary database',
      )

      expect((secondaryItemRepository as ItemRepositoryInterface).deleteByUserUuid).toHaveBeenCalledTimes(1)
      expect(primaryItemRepository.deleteByUserUuid).not.toHaveBeenCalled()
    })

    it('should remove items from secondary database if migrating items fails', async () => {
      primaryItemRepository.findAll = jest
        .fn()
        .mockResolvedValueOnce([primaryItem1])
        .mockRejectedValueOnce(new Error('error'))

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('error')

      expect((secondaryItemRepository as ItemRepositoryInterface).deleteByUserUuid).toHaveBeenCalledTimes(1)
      expect(primaryItemRepository.deleteByUserUuid).not.toHaveBeenCalled()
    })

    it('should log an error if deleting items from secondary database fails upon migration failure', async () => {
      primaryItemRepository.findAll = jest
        .fn()
        .mockResolvedValueOnce([primaryItem1])
        .mockRejectedValueOnce(new Error('error'))
      ;(secondaryItemRepository as ItemRepositoryInterface).deleteByUserUuid = jest
        .fn()
        .mockRejectedValue(new Error('error'))

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()

      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to clean up secondary database items for user 00000000-0000-0000-0000-000000000000: error',
      )
    })

    it('should log an error if deleting items from secondary database fails upon integrity check failure', async () => {
      const secondaryItem2WithDifferentContent = Item.create({
        ...secondaryItem2.props,
        content: 'different-content',
      }).getValue()

      ;(secondaryItemRepository as ItemRepositoryInterface).findByUuid = jest
        .fn()
        .mockResolvedValueOnce(secondaryItem1)
        .mockResolvedValueOnce(secondaryItem2WithDifferentContent)
      ;(secondaryItemRepository as ItemRepositoryInterface).deleteByUserUuid = jest
        .fn()
        .mockRejectedValue(new Error('error'))

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()

      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to clean up secondary database items for user 00000000-0000-0000-0000-000000000000: error',
      )
    })

    it('should not perform the transition if secondary item repository is not set', async () => {
      secondaryItemRepository = null

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('Secondary item repository is not set')

      expect(primaryItemRepository.countAll).not.toHaveBeenCalled()
      expect(primaryItemRepository.findAll).not.toHaveBeenCalled()
      expect(primaryItemRepository.deleteByUserUuid).not.toHaveBeenCalled()
    })

    it('should not perform the transition if the user uuid is invalid', async () => {
      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: 'invalid-uuid',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('Given value is not a valid uuid: invalid-uuid')

      expect(primaryItemRepository.countAll).not.toHaveBeenCalled()
      expect(primaryItemRepository.findAll).not.toHaveBeenCalled()
      expect(primaryItemRepository.deleteByUserUuid).not.toHaveBeenCalled()
    })

    it('should fail integrity check if the item count is not the same in both databases', async () => {
      ;(secondaryItemRepository as ItemRepositoryInterface).countAll = jest.fn().mockResolvedValue(1)

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual(
        'Total items count for user 00000000-0000-0000-0000-000000000000 in primary database (2) does not match total items count in secondary database (1)',
      )

      expect(primaryItemRepository.countAll).toHaveBeenCalledTimes(2)
      expect(primaryItemRepository.countAll).toHaveBeenCalledWith({ userUuid: '00000000-0000-0000-0000-000000000000' })
      expect((secondaryItemRepository as ItemRepositoryInterface).countAll).toHaveBeenCalledTimes(1)
      expect(primaryItemRepository.deleteByUserUuid).not.toHaveBeenCalled()
      expect((secondaryItemRepository as ItemRepositoryInterface).deleteByUserUuid).toHaveBeenCalledTimes(1)
    })

    it('should fail if one item is not found in the secondary database', async () => {
      ;(secondaryItemRepository as ItemRepositoryInterface).findByUuid = jest
        .fn()
        .mockResolvedValueOnce(secondaryItem1)
        .mockResolvedValueOnce(null)

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('Item 00000000-0000-0000-0000-000000000001 not found in secondary database')

      expect(primaryItemRepository.countAll).toHaveBeenCalledTimes(2)
      expect(primaryItemRepository.countAll).toHaveBeenCalledWith({ userUuid: '00000000-0000-0000-0000-000000000000' })
      expect((secondaryItemRepository as ItemRepositoryInterface).countAll).toHaveBeenCalledTimes(1)
      expect(primaryItemRepository.deleteByUserUuid).not.toHaveBeenCalled()
      expect((secondaryItemRepository as ItemRepositoryInterface).deleteByUserUuid).toHaveBeenCalledTimes(1)
    })

    it('should fail if an error is thrown during integrity check between primary and secondary database', async () => {
      ;(secondaryItemRepository as ItemRepositoryInterface).countAll = jest.fn().mockRejectedValue(new Error('error'))

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('error')

      expect(primaryItemRepository.deleteByUserUuid).not.toHaveBeenCalled()
      expect((secondaryItemRepository as ItemRepositoryInterface).deleteByUserUuid).toHaveBeenCalledTimes(1)
    })
  })
})
