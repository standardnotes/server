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
    if (Validator.isString(email).isFailed()) {
      return Result.fail<Email>('Email must be a string')
    }

    const trimmedAndLowerCasedEmail = email.trim().toLowerCase()

    const emailValidation = Validator.isValidEmail(trimmedAndLowerCasedEmail)
    if (emailValidation.isFailed()) {
      return Result.fail<Email>(emailValidation.getError())
    }

    return Result.ok<Email>(new Email({ value: trimmedAndLowerCasedEmail }))
  }
}
