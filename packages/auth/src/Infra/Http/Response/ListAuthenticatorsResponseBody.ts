import { AuthenticatorHttpProjection } from '../Projection/AuthenticatorHttpProjection'

export interface ListAuthenticatorsResponseBody {
  authenticators: AuthenticatorHttpProjection[]
}
