import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'
import { SessionTokenProps } from './SessionTokenProps'
import { Validator } from '../Core/Validator'

export class SessionToken extends ValueObject<SessionTokenProps> {
  get value(): string {
    return this.props.value
  }

  get expiresAt(): number {
    return this.props.expiresAt
  }

  private constructor(props: SessionTokenProps) {
    super(props)
  }

  static create(value: string, expiresAt: number): Result<SessionToken> {
    if (Validator.isNotEmpty(value).isFailed()) {
      return Result.fail<SessionToken>('Could not create session token. Token value is empty')
    }
    if (Validator.isNotEmpty(expiresAt).isFailed()) {
      return Result.fail<SessionToken>('Could not create session token. Token expiration is empty')
    }

    return Result.ok<SessionToken>(new SessionToken({ value, expiresAt }))
  }
}
