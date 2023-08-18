import { ContentType, Dates, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { Item } from './Item'
import { SharedVaultAssociation } from '../SharedVault/SharedVaultAssociation'
import { KeySystemAssociation } from '../KeySystem/KeySystemAssociation'

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
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
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

  it('should tell if an item is associated with a key system', () => {
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
      keySystemAssociation: KeySystemAssociation.create({
        keySystemIdentifier: 'key-system-identifier',
      }).getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().isAssociatedWithKeySystem('key-system-identifier')).toBeTruthy()
  })

  it('should tell that an item is not associated with a key system', () => {
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
    expect(entityOrError.getValue().isAssociatedWithKeySystem('key-system-identifier')).toBeFalsy()
  })

  it('should set shared vault association', () => {
    const sharedVaultAssociation = SharedVaultAssociation.create({
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
    }).getValue()

    const entity = Item.create({
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
    }).getValue()

    entity.setSharedVaultAssociation(sharedVaultAssociation)

    expect(entity.props.sharedVaultAssociation).toEqual(sharedVaultAssociation)
    expect(entity.getChanges()).toHaveLength(1)
  })

  it('should unset a shared vault association', () => {
    const entity = Item.create({
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
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      }).getValue(),
    }).getValue()

    entity.unsetSharedVaultAssociation()

    expect(entity.props.sharedVaultAssociation).toBeUndefined()
    expect(entity.getChanges()).toHaveLength(1)
  })

  it('should set key system association', () => {
    const keySystemAssociation = KeySystemAssociation.create({
      keySystemIdentifier: 'key-system-identifier',
    }).getValue()

    const entity = Item.create({
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
    }).getValue()

    entity.setKeySystemAssociation(keySystemAssociation)

    expect(entity.props.keySystemAssociation).toEqual(keySystemAssociation)
    expect(entity.getChanges()).toHaveLength(1)
  })

  it('should unset a key system association', () => {
    const entity = Item.create({
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
      keySystemAssociation: KeySystemAssociation.create({
        keySystemIdentifier: 'key-system-identifier',
      }).getValue(),
    }).getValue()

    entity.unsetKeySystemAssociation()

    expect(entity.props.keySystemAssociation).toBeUndefined()
    expect(entity.getChanges()).toHaveLength(1)
  })

  it('should tell if an item is identical to another item', () => {
    const entity = Item.create(
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
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    const otherEntity = Item.create(
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
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    expect(entity.isIdenticalTo(otherEntity)).toBeTruthy()
  })

  it('should tell that an item is not identical to another item', () => {
    const entity = Item.create(
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
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    const otherEntity = Item.create(
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
        dates: Dates.create(new Date(123), new Date(124)).getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    expect(entity.isIdenticalTo(otherEntity)).toBeFalsy()
  })

  it('should tell that an item is not identical to another item if their ids are different', () => {
    const entity = Item.create(
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
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    const otherEntity = Item.create(
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
        dates: Dates.create(new Date(123), new Date(124)).getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000001'),
    ).getValue()

    expect(entity.isIdenticalTo(otherEntity)).toBeFalsy()
  })
})
