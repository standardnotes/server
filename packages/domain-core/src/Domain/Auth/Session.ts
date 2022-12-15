import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'
import { SessionProps } from './SessionProps'
import { SessionToken } from './SessionToken'

export class Session extends ValueObject<SessionProps> {
  get accessToken(): SessionToken {
    return this.props.accessToken
  }

  get refreshToken(): SessionToken {
    return this.props.refreshToken
  }

  isReadOnly(): boolean {
    return this.props.readonlyAccess || false
  }

  private constructor(props: SessionProps) {
    super(props)
  }

  static create(accessToken: SessionToken, refreshToken: SessionToken, readonlyAccess?: boolean): Result<Session> {
    return Result.ok<Session>(new Session({ accessToken, refreshToken, readonlyAccess }))
  }
}
