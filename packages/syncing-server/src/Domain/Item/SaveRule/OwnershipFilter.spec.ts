import 'reflect-metadata'

import { ApiVersion } from '../../Api/ApiVersion'
import { Item } from '../Item'

import { OwnershipFilter } from './OwnershipFilter'
import { Uuid, ContentType, Dates, Timestamps, UniqueEntityId } from '@standardnotes/domain-core'
import { ItemHash } from '../ItemHash'

describe('OwnershipFilter', () => {
  let existingItem: Item
  const createFilter = () => new OwnershipFilter()

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
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()
  })

  it('should filter out items belonging to a different user', async () => {
    const itemHash = ItemHash.create({
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
    const result = await createFilter().check({
      userUuid: '00000000-0000-0000-0000-000000000001',
      apiVersion: ApiVersion.v20200115,
      itemHash,
      existingItem,
      snjsVersion: '2.200.0',
    })

    expect(result).toEqual({
      passed: false,
      conflict: {
        unsavedItem: itemHash,
        type: 'uuid_conflict',
      },
    })
  })

  it('should deffer to the shared vault filter if the item hash represents a shared vault item or existing item is a shared vault item', async () => {
    const itemHash = ItemHash.create({
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
    const result = await createFilter().check({
      userUuid: '00000000-0000-0000-0000-000000000001',
      apiVersion: ApiVersion.v20200115,
      itemHash,
      existingItem,
      snjsVersion: '2.200.0',
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should leave items belonging to the same user', async () => {
    const result = await createFilter().check({
      userUuid: '00000000-0000-0000-0000-000000000000',
      apiVersion: ApiVersion.v20200115,
      itemHash: ItemHash.create({
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
      }).getValue(),
      existingItem,
      snjsVersion: '2.200.0',
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should leave non existing items', async () => {
    const result = await createFilter().check({
      userUuid: '00000000-0000-0000-0000-000000000000',
      apiVersion: ApiVersion.v20200115,
      itemHash: ItemHash.create({
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
      }).getValue(),
      existingItem: null,
      snjsVersion: '2.200.0',
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should return an error if the user uuid is invalid', async () => {
    const itemHash = ItemHash.create({
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
    const result = await createFilter().check({
      userUuid: 'invalid',
      apiVersion: ApiVersion.v20200115,
      itemHash,
      existingItem,
      snjsVersion: '2.200.0',
    })

    expect(result).toEqual({
      passed: false,
      conflict: {
        unsavedItem: itemHash,
        type: 'uuid_error',
      },
    })
  })
})
