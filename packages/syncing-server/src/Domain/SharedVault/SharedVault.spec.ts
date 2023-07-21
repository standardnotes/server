import { Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { SharedVault } from './SharedVault'

describe('SharedVault', () => {
  it('should create an entity', () => {
    const entityOrError = SharedVault.create({
      fileUploadBytesLimit: 1_000_000,
      fileUploadBytesUsed: 0,
      timestamps: Timestamps.create(123456789, 123456789).getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
    expect(entityOrError.getValue().uuid.value).toEqual(entityOrError.getValue().id.toString())
  })

  it('should throw an error if id cannot be cast to uuid', () => {
    const entityOrError = SharedVault.create(
      {
        fileUploadBytesLimit: 1_000_000,
        fileUploadBytesUsed: 0,
        timestamps: Timestamps.create(123456789, 123456789).getValue(),
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      },
      new UniqueEntityId(1),
    )

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(() => entityOrError.getValue().uuid).toThrow()
  })
})
