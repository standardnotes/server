import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { ConnectionProps } from './ConnectionProps'

export class Connection extends Entity<ConnectionProps> {
  private constructor(props: ConnectionProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: ConnectionProps, id?: UniqueEntityId): Result<Connection> {
    return Result.ok<Connection>(new Connection(props, id))
  }
}
