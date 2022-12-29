import { MapperInterface } from '@standardnotes/domain-core'

import { Authenticator } from '../Domain/Authenticator/Authenticator'
import { AuthenticatorHttpProjection } from '../Infra/Http/Projection/AuthenticatorHttpProjection'

export class AuthenticatorHttpMapper implements MapperInterface<Authenticator, AuthenticatorHttpProjection> {
  toDomain(_projection: AuthenticatorHttpProjection): Authenticator {
    throw new Error('Not implemented yet.')
  }

  toProjection(domain: Authenticator): AuthenticatorHttpProjection {
    return {
      id: domain.id.toString(),
      name: domain.props.name,
    }
  }
}
