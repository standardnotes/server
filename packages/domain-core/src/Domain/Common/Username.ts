import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'
import { UsernameProps } from './UsernameProps'
import { Validator } from '../Core/Validator'

export class Username extends ValueObject<UsernameProps> {
  get value(): string {
    return this.props.value
  }

  private constructor(props: UsernameProps) {
    super(props)
  }

  static create(username: string): Result<Username> {
    if (Validator.isString(username).isFailed()) {
      return Result.fail<Username>('Username must be a string')
    }

    const trimmedAndLowerCasedUsername = username.trim().toLowerCase()

    if (Validator.isNotEmpty(trimmedAndLowerCasedUsername).isFailed()) {
      return Result.fail<Username>('Username cannot be empty')
    }

    return Result.ok<Username>(new Username({ value: trimmedAndLowerCasedUsername }))
  }
}
