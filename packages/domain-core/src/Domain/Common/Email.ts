import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'
import { EmailProps } from './EmailProps'
import { Validator } from '../Core/Validator'

export class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value
  }

  private constructor(props: EmailProps) {
    super(props)
  }

  static create(email: string): Result<Email> {
    const emailValidation = Validator.isValidEmail(email)
    if (emailValidation.isFailed()) {
      return Result.fail<Email>(emailValidation.getError())
    }

    return Result.ok<Email>(new Email({ value: email }))
  }
}
