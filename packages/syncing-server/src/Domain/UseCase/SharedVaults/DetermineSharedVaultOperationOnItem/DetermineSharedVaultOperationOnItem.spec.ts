import { ContentType, Uuid, Dates, Timestamps, UniqueEntityId, Result } from '@standardnotes/domain-core'
import { Item } from '../../../Item/Item'
import { ItemHash } from '../../../Item/ItemHash'
import { DetermineSharedVaultOperationOnItem } from './DetermineSharedVaultOperationOnItem'
import { SharedVaultOperationOnItem } from '../../../SharedVault/SharedVaultOperationOnItem'
import { SharedVaultAssociation } from '../../../SharedVault/SharedVaultAssociation'

describe('DetermineSharedVaultOperationOnItem', () => {
  let itemHash: ItemHash
  let existingItem: Item

  const createUseCase = () => new DetermineSharedVaultOperationOnItem()

  beforeEach(() => {
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
      shared_vault_uuid: null,
    }).getValue()

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
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()
  })

  it('should return an error if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      existingItem,
      itemHash,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Given value is not a valid uuid: invalid')
  })

  it('should return an operation representing moving to another shared vault', async () => {
    existingItem = Item.create({
      ...existingItem.props,
      sharedVaultAssociation: SharedVaultAssociation.create({
        itemUuid: existingItem.uuid,
        lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue(),
    }).getValue()

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      existingItem,
      itemHash: ItemHash.create({
        ...itemHash.props,
        shared_vault_uuid: '00000000-0000-0000-0000-000000000001',
      }).getValue(),
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().props.type).toEqual(SharedVaultOperationOnItem.TYPES.MoveToOtherSharedVault)
    expect(result.getValue().props.sharedVaultUuid).toEqual('00000000-0000-0000-0000-000000000000')
    expect(result.getValue().props.targetSharedVaultUuid).toEqual('00000000-0000-0000-0000-000000000001')
  })

  it('should return an operation representing removing from shared vault', async () => {
    existingItem = Item.create({
      ...existingItem.props,
      sharedVaultAssociation: SharedVaultAssociation.create({
        itemUuid: existingItem.uuid,
        lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue(),
    }).getValue()

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      existingItem,
      itemHash: ItemHash.create({
        ...itemHash.props,
        shared_vault_uuid: null,
      }).getValue(),
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().props.type).toEqual(SharedVaultOperationOnItem.TYPES.RemoveFromSharedVault)
    expect(result.getValue().props.sharedVaultUuid).toEqual('00000000-0000-0000-0000-000000000000')
  })

  it('should return an operation representing adding to shared vault', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      existingItem,
      itemHash: ItemHash.create({
        ...itemHash.props,
        shared_vault_uuid: '00000000-0000-0000-0000-000000000001',
      }).getValue(),
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().props.type).toEqual(SharedVaultOperationOnItem.TYPES.AddToSharedVault)
    expect(result.getValue().props.sharedVaultUuid).toEqual('00000000-0000-0000-0000-000000000001')
  })

  it('should return an operation representing saving to shared vault', async () => {
    existingItem = Item.create({
      ...existingItem.props,
      sharedVaultAssociation: SharedVaultAssociation.create({
        itemUuid: existingItem.uuid,
        lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue(),
    }).getValue()

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      existingItem,
      itemHash: ItemHash.create({
        ...itemHash.props,
        shared_vault_uuid: '00000000-0000-0000-0000-000000000000',
      }).getValue(),
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().props.type).toEqual(SharedVaultOperationOnItem.TYPES.SaveToSharedVault)
    expect(result.getValue().props.sharedVaultUuid).toEqual('00000000-0000-0000-0000-000000000000')
  })

  it('should return an operation representing creating to shared vault', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      existingItem: null,
      itemHash: ItemHash.create({
        ...itemHash.props,
        shared_vault_uuid: '00000000-0000-0000-0000-000000000001',
      }).getValue(),
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().props.type).toEqual(SharedVaultOperationOnItem.TYPES.CreateToSharedVault)
    expect(result.getValue().props.sharedVaultUuid).toEqual('00000000-0000-0000-0000-000000000001')
  })

  it('should return an error if both existing and incoming item hash do not have shared vault uuid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      existingItem: null,
      itemHash: ItemHash.create({
        ...itemHash.props,
        shared_vault_uuid: null,
      }).getValue(),
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Invalid save operation')
  })

  it('should return error if operation could not be determined based on input values', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      existingItem: null,
      itemHash,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Invalid save operation')
  })

  it('should return error if shared vault operation on item could not be created', async () => {
    const mock = jest.spyOn(SharedVaultOperationOnItem, 'create')
    mock.mockImplementationOnce(() => Result.fail('error'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      existingItem: null,
      itemHash: ItemHash.create({
        ...itemHash.props,
        shared_vault_uuid: '00000000-0000-0000-0000-000000000001',
      }).getValue(),
    })

    expect(result.isFailed()).toBeTruthy()

    mock.mockRestore()
  })
})
