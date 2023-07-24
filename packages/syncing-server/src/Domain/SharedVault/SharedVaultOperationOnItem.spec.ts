import { ContentType } from '@standardnotes/domain-core'

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
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      targetSharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      type: SharedVaultOperationOnItem.TYPES.AddToSharedVault,
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(valueOrError.isFailed()).toBeFalsy()
  })

  it('should return error if user uuid is not valid', () => {
    const valueOrError = SharedVaultOperationOnItem.create({
      incomingItemHash: itemHash,
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      targetSharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      type: SharedVaultOperationOnItem.TYPES.AddToSharedVault,
      userUuid: 'invalid',
    })

    expect(valueOrError.isFailed()).toBeTruthy()
  })

  it('should return error if shared vault uuid is not valid', () => {
    const valueOrError = SharedVaultOperationOnItem.create({
      incomingItemHash: itemHash,
      sharedVaultUuid: 'invalid',
      targetSharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      type: SharedVaultOperationOnItem.TYPES.AddToSharedVault,
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(valueOrError.isFailed()).toBeTruthy()
  })

  it('should return error if shared vault operation type is invalid', () => {
    const valueOrError = SharedVaultOperationOnItem.create({
      incomingItemHash: itemHash,
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      targetSharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      type: 'invalid',
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(valueOrError.isFailed()).toBeTruthy()
  })

  it('should return error if target shared vault uuid is not valid', () => {
    const valueOrError = SharedVaultOperationOnItem.create({
      incomingItemHash: itemHash,
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      targetSharedVaultUuid: 'invalid',
      type: SharedVaultOperationOnItem.TYPES.AddToSharedVault,
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(valueOrError.isFailed()).toBeTruthy()
  })

  it('should return error if operation type is move to other shared vault and target shared vault uuid is not provided', () => {
    const valueOrError = SharedVaultOperationOnItem.create({
      incomingItemHash: itemHash,
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      targetSharedVaultUuid: undefined,
      type: SharedVaultOperationOnItem.TYPES.MoveToOtherSharedVault,
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
