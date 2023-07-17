import { Timestamps, Uuid } from '@standardnotes/domain-core'

import { SharedVault } from './SharedVault'

describe('SharedVault', () => {
  it('should create an aggregate', () => {
    const entityOrError = SharedVault.create({
      fileUploadBytesLimit: 1_000_000,
      fileUploadBytesUsed: 0,
      timestamps: Timestamps.create(123456789, 123456789).getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sharedVaultItems: [],
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
