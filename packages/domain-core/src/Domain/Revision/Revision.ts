import { Entity } from '../Core/Entity'
import { Result } from '../Core/Result'
import { UniqueEntityId } from '../Core/UniqueEntityId'

import { RevisionProps } from './RevisionProps'

export class Revision extends Entity<RevisionProps> {
  get id(): UniqueEntityId {
    return this._id
  }

  private constructor(props: RevisionProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: RevisionProps, id?: UniqueEntityId): Result<Revision> {
    return Result.ok<Revision>(new Revision(props, id))
  }
}
