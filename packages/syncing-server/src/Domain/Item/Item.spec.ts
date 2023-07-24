import { ContentType, Dates, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { Item } from './Item'
import { SharedVaultAssociation } from '../SharedVault/SharedVaultAssociation'

describe('Item', () => {
  it('should create an aggregate', () => {
    const entityOrError = Item.create({
      duplicateOf: null,
      itemsKeyId: 'items-key-id',
      content: 'content',
      contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
      encItemKey: 'enc-item-key',
      authHash: 'auth-hash',
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      deleted: false,
      updatedWithSession: null,
      dates: Dates.create(new Date(123), new Date(123)).getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
    expect(entityOrError.getValue().uuid.value).toEqual(entityOrError.getValue().id.toString())
  })

  it('should throw an error if id cannot be cast to uuid', () => {
    const entityOrError = Item.create(
      {
        duplicateOf: null,
        itemsKeyId: 'items-key-id',
        content: 'content',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: 'enc-item-key',
        authHash: 'auth-hash',
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        deleted: false,
        updatedWithSession: null,
        dates: Dates.create(new Date(123), new Date(123)).getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      },
      new UniqueEntityId(1),
    )

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(() => entityOrError.getValue().uuid).toThrow()
  })

  it('should tell if an item is associated with a shared vault', () => {
    const entityOrError = Item.create({
      duplicateOf: null,
      itemsKeyId: 'items-key-id',
      content: 'content',
      contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
      encItemKey: 'enc-item-key',
      authHash: 'auth-hash',
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      deleted: false,
      updatedWithSession: null,
      dates: Dates.create(new Date(123), new Date(123)).getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
      sharedVaultAssociation: SharedVaultAssociation.create({
        itemUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(
      entityOrError
        .getValue()
        .isAssociatedWithSharedVault(Uuid.create('00000000-0000-0000-0000-000000000000').getValue()),
    ).toBeTruthy()
  })

  it('should tell that an item is not associated with a shared vault', () => {
    const entityOrError = Item.create({
      duplicateOf: null,
      itemsKeyId: 'items-key-id',
      content: 'content',
      contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
      encItemKey: 'enc-item-key',
      authHash: 'auth-hash',
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      deleted: false,
      updatedWithSession: null,
      dates: Dates.create(new Date(123), new Date(123)).getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(
      entityOrError
        .getValue()
        .isAssociatedWithSharedVault(Uuid.create('00000000-0000-0000-0000-000000000000').getValue()),
    ).toBeFalsy()
  })
})
