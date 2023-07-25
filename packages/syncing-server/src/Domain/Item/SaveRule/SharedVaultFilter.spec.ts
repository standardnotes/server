import { ContentType, Dates, Result, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'
import { SharedVaultUser } from '../../SharedVault/User/SharedVaultUser'
import { SharedVaultUserPermission } from '../../SharedVault/User/SharedVaultUserPermission'
import { SharedVaultUserRepositoryInterface } from '../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { DetermineSharedVaultOperationOnItem } from '../../UseCase/SharedVaults/DetermineSharedVaultOperationOnItem/DetermineSharedVaultOperationOnItem'
import { SharedVaultFilter } from './SharedVaultFilter'
import { ItemHash } from '../ItemHash'
import { Item } from '../Item'
import { SharedVaultOperationOnItem } from '../../SharedVault/SharedVaultOperationOnItem'
import { SharedVaultAssociation } from '../../SharedVault/SharedVaultAssociation'

describe('SharedVaultFilter', () => {
  let determineSharedVaultOperationOnItem: DetermineSharedVaultOperationOnItem
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  let sharedVaultUser: SharedVaultUser
  let itemHash: ItemHash
  let existingItem: Item

  const createFilter = () => new SharedVaultFilter(determineSharedVaultOperationOnItem, sharedVaultUserRepository)

  beforeEach(() => {
    existingItem = Item.create(
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
        sharedVaultAssociation: SharedVaultAssociation.create({
          itemUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
          lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
          sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
          timestamps: Timestamps.create(123, 123).getValue(),
        }).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    itemHash = ItemHash.create({
      uuid: '2-3-4',
      content_type: ContentType.TYPES.Note,
      user_uuid: '00000000-0000-0000-0000-000000000000',
      content: 'foobar',
      created_at: '2020-01-01T00:00:00.000Z',
      updated_at: '2020-01-01T00:00:00.000Z',
      created_at_timestamp: 123,
      updated_at_timestamp: 123,
      key_system_identifier: 'key-system-identifier',
      shared_vault_uuid: '00000000-0000-0000-0000-000000000000',
    }).getValue()

    sharedVaultUser = SharedVaultUser.create({
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    determineSharedVaultOperationOnItem = {} as jest.Mocked<DetermineSharedVaultOperationOnItem>
    determineSharedVaultOperationOnItem.execute = jest.fn()

    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest
      .fn()
      .mockResolvedValueOnce(sharedVaultUser)
      .mockResolvedValueOnce(null)
  })

  it('should return as passed if the item hash does not represent a shared vault item', async () => {
    itemHash = ItemHash.create({
      ...itemHash.props,
      shared_vault_uuid: null,
    }).getValue()

    const filter = createFilter()
    const result = await filter.check({
      apiVersion: '001',
      existingItem: existingItem,
      itemHash: itemHash,
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.passed).toBe(true)
  })

  it('should return as passed if the item is not a shared vault item', async () => {
    existingItem = Item.create({
      ...existingItem.props,
      sharedVaultAssociation: undefined,
    }).getValue()

    const filter = createFilter()
    const result = await filter.check({
      apiVersion: '001',
      existingItem: existingItem,
      itemHash: itemHash,
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.passed).toBe(true)
  })

  it('should return as not passed if the operation could not be determined', async () => {
    determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const filter = createFilter()
    const result = await filter.check({
      apiVersion: '001',
      existingItem: existingItem,
      itemHash: itemHash,
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.passed).toBe(false)
  })

  it('should return as not passed if the item is a shared vault item without a dedicated key system association', async () => {
    determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
      Result.ok(
        SharedVaultOperationOnItem.create({
          userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
          sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
          type: SharedVaultOperationOnItem.TYPES.AddToSharedVault,
          incomingItemHash: itemHash,
        }).getValue(),
      ),
    )

    itemHash = ItemHash.create({
      uuid: '2-3-4',
      content_type: ContentType.TYPES.Note,
      user_uuid: '00000000-0000-0000-0000-000000000000',
      content: 'foobar',
      created_at: '2020-01-01T00:00:00.000Z',
      updated_at: '2020-01-01T00:00:00.000Z',
      created_at_timestamp: 123,
      updated_at_timestamp: 123,
      key_system_identifier: null,
      shared_vault_uuid: '00000000-0000-0000-0000-000000000000',
    }).getValue()

    const filter = createFilter()
    const result = await filter.check({
      apiVersion: '001',
      existingItem: existingItem,
      itemHash: itemHash,
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.passed).toBe(false)
  })

  describe('when the shared vault operation on item is: move to other shared vault', () => {
    beforeEach(() => {
      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            targetSharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000001').getValue(),
            type: SharedVaultOperationOnItem.TYPES.MoveToOtherSharedVault,
            incomingItemHash: itemHash,
          }).getValue(),
        ),
      )

      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest
        .fn()
        .mockResolvedValueOnce(sharedVaultUser)
        .mockResolvedValueOnce(sharedVaultUser)
    })

    it('should return as not passed if the user is not a member of the shared vault', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(null)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })

    it('should return as not passed if the user is not a member of the target shared vault', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest
        .fn()
        .mockResolvedValue(sharedVaultUser)
        .mockResolvedValue(null)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })

    it('should return as passed if the user is a member of both shared vaults', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(true)
    })

    it('should return as not passed if the user is not a member of the target shared vault', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest
        .fn()
        .mockReturnValueOnce(sharedVaultUser)
        .mockReturnValueOnce(null)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })

    it('should return as not passed if the item is deleted', async () => {
      existingItem = Item.create(
        {
          userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
          updatedWithSession: null,
          content: 'foobar',
          contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
          encItemKey: null,
          authHash: null,
          itemsKeyId: null,
          duplicateOf: null,
          deleted: true,
          dates: Dates.create(new Date(1616164633241311), new Date(1616164633241311)).getValue(),
          timestamps: Timestamps.create(1616164633241311, 1616164633241311).getValue(),
          sharedVaultAssociation: SharedVaultAssociation.create({
            itemUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            timestamps: Timestamps.create(123, 123).getValue(),
          }).getValue(),
        },
        new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
      ).getValue()
      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            targetSharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000001').getValue(),
            type: SharedVaultOperationOnItem.TYPES.MoveToOtherSharedVault,
            incomingItemHash: itemHash,
            existingItem,
          }).getValue(),
        ),
      )

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })

    it('should return as not passed if the item is being deleted', async () => {
      itemHash = ItemHash.create({
        uuid: '2-3-4',
        content_type: ContentType.TYPES.Note,
        user_uuid: '00000000-0000-0000-0000-000000000000',
        content: 'foobar',
        created_at: '2020-01-01T00:00:00.000Z',
        updated_at: '2020-01-01T00:00:00.000Z',
        created_at_timestamp: 123,
        updated_at_timestamp: 123,
        key_system_identifier: null,
        shared_vault_uuid: '00000000-0000-0000-0000-000000000000',
        deleted: true,
      }).getValue()

      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            targetSharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000001').getValue(),
            type: SharedVaultOperationOnItem.TYPES.MoveToOtherSharedVault,
            incomingItemHash: itemHash,
            existingItem,
          }).getValue(),
        ),
      )

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })

    it('should return as not passed if the user has insufficient permissions to write key system items key', async () => {
      sharedVaultUser = SharedVaultUser.create({
        permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      itemHash = ItemHash.create({
        ...itemHash.props,
        content_type: ContentType.TYPES.KeySystemItemsKey,
      }).getValue()

      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            targetSharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000001').getValue(),
            type: SharedVaultOperationOnItem.TYPES.MoveToOtherSharedVault,
            incomingItemHash: itemHash,
          }).getValue(),
        ),
      )

      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })
  })

  describe('when the shared vault operation on item is: add to shared vault', () => {
    beforeEach(() => {
      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            type: SharedVaultOperationOnItem.TYPES.AddToSharedVault,
            incomingItemHash: itemHash,
            existingItem,
          }).getValue(),
        ),
      )
    })

    it('should return as not passed if the user is not a member of the shared vault', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(null)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })

    it('should return as passed if the user is a member of the shared vault', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(true)
    })

    it('should return as not passed if the item is deleted', async () => {
      existingItem = Item.create(
        {
          userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
          updatedWithSession: null,
          content: 'foobar',
          contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
          encItemKey: null,
          authHash: null,
          itemsKeyId: null,
          duplicateOf: null,
          deleted: true,
          dates: Dates.create(new Date(1616164633241311), new Date(1616164633241311)).getValue(),
          timestamps: Timestamps.create(1616164633241311, 1616164633241311).getValue(),
          sharedVaultAssociation: SharedVaultAssociation.create({
            itemUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            timestamps: Timestamps.create(123, 123).getValue(),
          }).getValue(),
        },
        new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
      ).getValue()
      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            type: SharedVaultOperationOnItem.TYPES.AddToSharedVault,
            incomingItemHash: itemHash,
            existingItem,
          }).getValue(),
        ),
      )

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })

    it('should return as not passed if the user is not the owner of the item', async () => {
      existingItem = Item.create({
        ...existingItem.props,
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000001').getValue(),
      }).getValue()

      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000002').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            type: SharedVaultOperationOnItem.TYPES.AddToSharedVault,
            incomingItemHash: itemHash,
            existingItem,
          }).getValue(),
        ),
      )

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000001',
      })

      expect(result.passed).toBe(false)
    })

    it('should return as not passed if the user has insufficient permissions to write key system items key', async () => {
      sharedVaultUser = SharedVaultUser.create({
        permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      itemHash = ItemHash.create({
        ...itemHash.props,
        content_type: ContentType.TYPES.KeySystemItemsKey,
      }).getValue()

      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            type: SharedVaultOperationOnItem.TYPES.AddToSharedVault,
            incomingItemHash: itemHash,
            existingItem,
          }).getValue(),
        ),
      )

      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })
  })

  describe('when the shared vault operation on item is: remove from shared vault', () => {
    beforeEach(() => {
      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            type: SharedVaultOperationOnItem.TYPES.RemoveFromSharedVault,
            incomingItemHash: itemHash,
            existingItem,
          }).getValue(),
        ),
      )
    })

    it('should return as not passed if the user is not a member of the shared vault', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(null)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })

    it('should return as passed if the user is a member of the shared vault', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(true)
    })

    it('should return as not passed if the item is deleted', async () => {
      existingItem = Item.create(
        {
          userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
          updatedWithSession: null,
          content: 'foobar',
          contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
          encItemKey: null,
          authHash: null,
          itemsKeyId: null,
          duplicateOf: null,
          deleted: true,
          dates: Dates.create(new Date(1616164633241311), new Date(1616164633241311)).getValue(),
          timestamps: Timestamps.create(1616164633241311, 1616164633241311).getValue(),
          sharedVaultAssociation: SharedVaultAssociation.create({
            itemUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            timestamps: Timestamps.create(123, 123).getValue(),
          }).getValue(),
        },
        new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
      ).getValue()
      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            type: SharedVaultOperationOnItem.TYPES.RemoveFromSharedVault,
            incomingItemHash: itemHash,
            existingItem,
          }).getValue(),
        ),
      )

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })

    it('should return as not passed if the user is not the owner of the item', async () => {
      existingItem = Item.create({
        ...existingItem.props,
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000001').getValue(),
      }).getValue()

      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000002').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            type: SharedVaultOperationOnItem.TYPES.RemoveFromSharedVault,
            incomingItemHash: itemHash,
            existingItem,
          }).getValue(),
        ),
      )

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000001',
      })

      expect(result.passed).toBe(false)
    })

    it('should return as not passed if the user has insufficient permissions to write key system items key', async () => {
      sharedVaultUser = SharedVaultUser.create({
        permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      itemHash = ItemHash.create({
        ...itemHash.props,
        content_type: ContentType.TYPES.KeySystemItemsKey,
      }).getValue()

      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            type: SharedVaultOperationOnItem.TYPES.RemoveFromSharedVault,
            incomingItemHash: itemHash,
            existingItem,
          }).getValue(),
        ),
      )

      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })
  })

  describe('when the shared vault operation on item is: save to shared vault', () => {
    beforeEach(() => {
      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            type: SharedVaultOperationOnItem.TYPES.SaveToSharedVault,
            incomingItemHash: itemHash,
            existingItem,
          }).getValue(),
        ),
      )
    })

    it('should return as not passed if the user is not a member of the shared vault', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(null)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })

    it('should return as passed if the user is a member of the shared vault', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(true)
    })

    it('should return as not passed if the user has insufficient permissions', async () => {
      sharedVaultUser = SharedVaultUser.create({
        permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })
  })

  describe('when the shared vault operation on item is: create to shared vault', () => {
    beforeEach(() => {
      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            type: SharedVaultOperationOnItem.TYPES.CreateToSharedVault,
            incomingItemHash: itemHash,
            existingItem,
          }).getValue(),
        ),
      )
    })

    it('should return as not passed if the user is not a member of the shared vault', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(null)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })

    it('should return as passed if the user is a member of the shared vault', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(true)
    })

    it('should return as not passed if the user has insufficient permissions to write key system items key', async () => {
      sharedVaultUser = SharedVaultUser.create({
        permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      itemHash = ItemHash.create({
        ...itemHash.props,
        content_type: ContentType.TYPES.KeySystemItemsKey,
      }).getValue()

      determineSharedVaultOperationOnItem.execute = jest.fn().mockReturnValue(
        Result.ok(
          SharedVaultOperationOnItem.create({
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            type: SharedVaultOperationOnItem.TYPES.CreateToSharedVault,
            incomingItemHash: itemHash,
          }).getValue(),
        ),
      )

      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)

      const filter = createFilter()
      const result = await filter.check({
        apiVersion: '001',
        existingItem: existingItem,
        itemHash: itemHash,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.passed).toBe(false)
    })
  })
})
