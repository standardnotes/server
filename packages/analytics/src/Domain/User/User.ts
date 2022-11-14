import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { UserProps } from './UserProps'

export class User extends Entity<UserProps> {
  get id(): UniqueEntityId {
    return this._id
  }

  private constructor(props: UserProps, id?: UniqueEntityId) {
    super(props, id)
  }

  public static create(props: UserProps, id?: UniqueEntityId): Result<User> {
    return Result.ok<User>(new User(props, id))
  }
}
