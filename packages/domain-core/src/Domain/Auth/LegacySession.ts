import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'
import { LegacySessionProps } from './LegacySessionProps'
import { Validator } from '../Core/Validator'

export class LegacySession extends ValueObject<LegacySessionProps> {
  get accessToken(): string {
    return this.props.token
  }

  private constructor(props: LegacySessionProps) {
    super(props)
  }

  static create(token: string): Result<LegacySession> {
    if (Validator.isNotEmpty(token).isFailed()) {
      return Result.fail<LegacySession>('Could not create legacy session. Token value is empty')
    }

    return Result.ok<LegacySession>(new LegacySession({ token }))
  }
}
