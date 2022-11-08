import { Entity } from '../Core/Entity'
import { UniqueEntityId } from '../Core/UniqueEntityId'
import { UserProps } from './UserProps'

export class User extends Entity<UserProps> {
  get id(): UniqueEntityId {
    return this._id
  }

  private constructor(props: UserProps, id?: UniqueEntityId) {
    super(props, id)
  }

  public static create(props: UserProps, id?: UniqueEntityId): User {
    return new User(props, id)
  }
}
