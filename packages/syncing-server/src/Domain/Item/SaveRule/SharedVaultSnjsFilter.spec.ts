import { Uuid, ContentType, Dates, Timestamps, UniqueEntityId } from '@standardnotes/domain-core'

import { SharedVaultAssociation } from '../../SharedVault/SharedVaultAssociation'
import { Item } from '../Item'
import { ItemHash } from '../ItemHash'
import { SharedVaultSnjsFilter } from './SharedVaultSnjsFilter'

describe('SharedVaultSnjsFilter', () => {
  const createFilter = () => new SharedVaultSnjsFilter()

  let itemHash: ItemHash
  let existingItem: Item

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
  })

  it('should filter out items with invalid snjs version', async () => {
    const result = await createFilter().check({
      userUuid: '00000000-0000-0000-0000-000000000001',
      apiVersion: '20200115',
      itemHash,
      existingItem,
      snjsVersion: '2.100.0',
    })

    expect(result).toEqual({
      passed: false,
      conflict: {
        unsavedItem: itemHash,
        serverItem: existingItem,
        type: 'shared_vault_snjs_version_error',
      },
    })
  })

  it('should filter out item hashes with invalid snjs version', async () => {
    const result = await createFilter().check({
      userUuid: '00000000-0000-0000-0000-000000000001',
      apiVersion: '20200115',
      itemHash,
      existingItem: null,
      snjsVersion: '2.100.0',
    })

    expect(result).toEqual({
      passed: false,
      conflict: {
        unsavedItem: itemHash,
        type: 'shared_vault_snjs_version_error',
      },
    })
  })

  it('should leave items with valid snjs version', async () => {
    const result = await createFilter().check({
      userUuid: '00000000-0000-0000-0000-000000000001',
      apiVersion: '20200115',
      itemHash,
      existingItem,
      snjsVersion: '2.200.0',
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should leave items that are not associated with a shared vault and not hashed with a key system', async () => {
    existingItem = Item.create(
      {
        ...existingItem.props,
        sharedVaultAssociation: undefined,
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    itemHash = ItemHash.create({
      ...itemHash.props,
      key_system_identifier: null,
    }).getValue()

    const result = await createFilter().check({
      userUuid: '00000000-0000-0000-0000-000000000001',
      apiVersion: '20200115',
      itemHash,
      existingItem,
      snjsVersion: '2.200.0',
    })

    expect(result).toEqual({
      passed: true,
    })
  })
})
