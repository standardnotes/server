import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'
import { EmailProps } from './EmailProps'

export class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value
  }

  private constructor(props: EmailProps) {
    super(props)
  }

  static create(email: string): Result<Email> {
    if (!!email === false || email.length === 0) {
      return Result.fail<Email>('Email cannot be empty')
    } else {
      return Result.ok<Email>(new Email({ value: email }))
    }
  }
}
