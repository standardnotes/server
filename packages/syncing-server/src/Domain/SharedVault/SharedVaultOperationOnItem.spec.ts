import { ContentType, Uuid } from '@standardnotes/domain-core'

import { ItemHash } from '../Item/ItemHash'
import { SharedVaultOperationOnItem } from './SharedVaultOperationOnItem'

describe('SharedVaultOperationOnItem', () => {
  let itemHash: ItemHash

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
  })

  it('should create a value object', () => {
    const valueOrError = SharedVaultOperationOnItem.create({
      incomingItemHash: itemHash,
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      targetSharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      type: SharedVaultOperationOnItem.TYPES.AddToSharedVault,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
    })

    expect(valueOrError.isFailed()).toBeFalsy()
  })

  it('should return error if shared vault operation type is invalid', () => {
    const valueOrError = SharedVaultOperationOnItem.create({
      incomingItemHash: itemHash,
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      targetSharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      type: 'invalid',
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
    })

    expect(valueOrError.isFailed()).toBeTruthy()
  })

  it('should return error if operation type is move to other shared vault and target shared vault uuid is not provided', () => {
    const valueOrError = SharedVaultOperationOnItem.create({
      incomingItemHash: itemHash,
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      targetSharedVaultUuid: undefined,
      type: SharedVaultOperationOnItem.TYPES.MoveToOtherSharedVault,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
    })

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
