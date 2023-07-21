import { Entity, Result, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { SharedVaultProps } from './SharedVaultProps'

export class SharedVault extends Entity<SharedVaultProps> {
  private constructor(props: SharedVaultProps, id?: UniqueEntityId) {
    super(props, id)
  }

  get uuid(): Uuid {
    const uuidOrError = Uuid.create(this._id.toString())
    if (uuidOrError.isFailed()) {
      throw new Error(uuidOrError.getError())
    }

    return uuidOrError.getValue()
  }

  static create(props: SharedVaultProps, id?: UniqueEntityId): Result<SharedVault> {
    return Result.ok<SharedVault>(new SharedVault(props, id))
  }
}
