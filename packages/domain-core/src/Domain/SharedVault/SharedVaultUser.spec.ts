import { SharedVaultUserPermission } from './SharedVaultUserPermission'
import { SharedVaultUser } from './SharedVaultUser'
import { Uuid } from '../Common/Uuid'
import { Timestamps } from '../Common/Timestamps'

describe('SharedVaultUser', () => {
  it('should create an entity', () => {
    const entityOrError = SharedVaultUser.create({
      permission: SharedVaultUserPermission.create('read').getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123456789, 123456789).getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
