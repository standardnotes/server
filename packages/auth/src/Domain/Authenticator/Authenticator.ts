import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { AuthenticatorProps } from './AuthenticatorProps'

export class Authenticator extends Entity<AuthenticatorProps> {
  private constructor(props: AuthenticatorProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: AuthenticatorProps, id?: UniqueEntityId): Result<Authenticator> {
    return Result.ok<Authenticator>(new Authenticator(props, id))
  }
}
