/* eslint-disable no-inline-comments */
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

  static create(username: string, options: { skipValidation?: boolean } = {}): Result<Username> {
    if (Validator.isString(username).isFailed()) {
      return Result.fail<Username>('Username must be a string')
    }

    const trimmedAndLowerCasedUsername = username.trim().toLowerCase()

    if (Validator.isNotEmpty(trimmedAndLowerCasedUsername).isFailed()) {
      return Result.fail<Username>('Username cannot be empty')
    }

    if (!options.skipValidation) {
      // Username format validation
      // Allows: letters, numbers, underscore, period, hyphen, @, plus
      // More restrictive set of special characters for better security
      const usernameRegex = /^[a-zA-Z0-9._\-@+]+$/
      if (!usernameRegex.test(trimmedAndLowerCasedUsername)) {
        return Result.fail<Username>(
          'Username can only contain letters, numbers, and the following special characters: . _ - @ +',
        )
      }

      // Check minimum and maximum length
      if (trimmedAndLowerCasedUsername.length < 3) {
        return Result.fail<Username>('Username must be at least 3 characters long')
      }

      if (trimmedAndLowerCasedUsername.length > 100) {
        return Result.fail<Username>('Username cannot be longer than 100 characters')
      }

      // Additional security checks
      const dangerousPatterns = [
        /\s/, // Any whitespace
        /^[._\-@+]/, // Cannot start with special chars
        /[._\-@+]$/, // Cannot end with special chars
        /[._\-@+]{2,}/, // No consecutive special chars
      ]

      for (const pattern of dangerousPatterns) {
        if (pattern.test(trimmedAndLowerCasedUsername)) {
          return Result.fail<Username>(
            'Username cannot start or end with special characters, and cannot have consecutive special characters',
          )
        }
      }
    }

    return Result.ok<Username>(new Username({ value: trimmedAndLowerCasedUsername }))
  }

  isPotentiallyAPrivateUsernameAccount(): boolean {
    return this.value.length === 64 && !this.value.includes('@')
  }
}
