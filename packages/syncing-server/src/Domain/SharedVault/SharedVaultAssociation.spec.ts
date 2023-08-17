import { Uuid } from '@standardnotes/domain-core'

import { SharedVaultAssociation } from './SharedVaultAssociation'

describe('SharedVaultAssociation', () => {
  it('should create an entity', () => {
    const entityOrError = SharedVaultAssociation.create({
      lastEditedBy: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
