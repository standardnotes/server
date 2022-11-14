/* istanbul ignore file */

import { Entity } from './Entity'
import { UniqueEntityId } from './UniqueEntityId'

export abstract class Aggregate<T> extends Entity<T> {
  get id(): UniqueEntityId {
    return this._id
  }
}
