/* istanbul ignore file */

import { UniqueEntityId } from './UniqueEntityId'

export abstract class Entity<T> {
  protected readonly _id: UniqueEntityId

  constructor(
    public readonly props: T,
    id?: UniqueEntityId,
  ) {
    this._id = id ? id : new UniqueEntityId()
  }

  get id(): UniqueEntityId {
    return this._id
  }

  public equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) {
      return false
    }

    if (this === object) {
      return true
    }

    if (!(object instanceof Entity)) {
      return false
    }

    return this._id.equals(object._id)
  }
}
