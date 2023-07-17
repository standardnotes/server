import { Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { SharedVaultItem } from './SharedVaultItem'

describe('SharedVaultItem', () => {
  it('should create an entity', () => {
    const entityOrError = SharedVaultItem.create({
      itemId: new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
      sharedVaultId: new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
      keySystemIdentifier: 'key-system-identifier',
      lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123456789, 123456789).getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
