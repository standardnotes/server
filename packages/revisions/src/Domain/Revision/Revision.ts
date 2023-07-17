import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { RevisionProps } from './RevisionProps'

export class Revision extends Entity<RevisionProps> {
  private constructor(props: RevisionProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: RevisionProps, id?: UniqueEntityId): Result<Revision> {
    return Result.ok<Revision>(new Revision(props, id))
  }
}
