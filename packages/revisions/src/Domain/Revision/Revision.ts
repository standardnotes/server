import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { RevisionProps } from './RevisionProps'

export class Revision extends Entity<RevisionProps> {
  private constructor(props: RevisionProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: RevisionProps, id?: UniqueEntityId): Result<Revision> {
    return Result.ok<Revision>(new Revision(props, id))
  }

  isIdenticalTo(revision: Revision): boolean {
    if (this._id.toString().toLowerCase() !== revision._id.toString().toLowerCase()) {
      return false
    }

    const stringifiedThis = JSON.stringify(this.props)
    const stringifiedRevision = JSON.stringify(revision.props)

    const base64This = Buffer.from(stringifiedThis).toString('base64')
    const base64Item = Buffer.from(stringifiedRevision).toString('base64')

    return base64This === base64Item
  }
}
