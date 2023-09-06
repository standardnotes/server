import { Entity } from '../Core/Entity'
import { Result } from '../Core/Result'
import { UniqueEntityId } from '../Core/UniqueEntityId'
import { SharedVaultUserProps } from './SharedVaultUserProps'

export class SharedVaultUser extends Entity<SharedVaultUserProps> {
  private constructor(props: SharedVaultUserProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: SharedVaultUserProps, id?: UniqueEntityId): Result<SharedVaultUser> {
    return Result.ok<SharedVaultUser>(new SharedVaultUser(props, id))
  }
}
