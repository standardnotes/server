import { Timestamps, Uuid } from '@standardnotes/domain-core'

import { SharedVaultAssociation } from './SharedVaultAssociation'

describe('SharedVaultAssociation', () => {
  it('should create an entity', () => {
    const entityOrError = SharedVaultAssociation.create({
      timestamps: Timestamps.create(123456789, 123456789).getValue(),
      itemUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
