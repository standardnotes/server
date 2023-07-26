import { SharedVaultUserPermission, Timestamps, Uuid } from '@standardnotes/domain-core'

import { SharedVaultInvite } from './SharedVaultInvite'

describe('SharedVaultInvite', () => {
  it('should create an entity', () => {
    const entityOrError = SharedVaultInvite.create({
      permission: SharedVaultUserPermission.create('read').getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      senderUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      encryptedMessage: 'encryptedMessage',
      timestamps: Timestamps.create(123456789, 123456789).getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
