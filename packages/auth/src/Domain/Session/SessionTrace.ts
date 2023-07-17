import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { SessionTraceProps } from './SessionTraceProps'

export class SessionTrace extends Entity<SessionTraceProps> {
  private constructor(props: SessionTraceProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: SessionTraceProps, id?: UniqueEntityId): Result<SessionTrace> {
    return Result.ok<SessionTrace>(new SessionTrace(props, id))
  }
}
