import { Result } from './Result'

export class Validator {
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  private static readonly EMAIL_REGEX =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  static isValidUuid(value: string): Result<string> {
    const matchesUuidRegex = String(value).toLowerCase().match(Validator.UUID_REGEX) !== null
    if (matchesUuidRegex) {
      return Result.ok()
    }

    return Result.fail(`Given value is not a valid uuid: ${value}`)
  }

  static isValidEmail(value: string): Result<string> {
    const matchesUuidRegex = String(value).toLowerCase().match(Validator.EMAIL_REGEX) !== null
    if (matchesUuidRegex) {
      return Result.ok()
    }

    return Result.fail(`Given value is not a valid email address: ${value}`)
  }

  static isString(value: unknown): Result<string> {
    if (typeof value === 'string') {
      return Result.ok()
    }

    return Result.fail(`Given value is not a string: ${typeof value}`)
  }

  static isNotEmpty(value: unknown): Result<string> {
    if (value instanceof Array && value.length === 0) {
      return Result.fail(`Given value is empty: ${value}`)
    }

    if (value === null || value === undefined || value === '') {
      return Result.fail(`Given value is empty: ${value}`)
    }

    return Result.ok()
  }

  static isNotEmptyString(value: unknown): Result<string> {
    const isStringResult = Validator.isString(value)
    if (isStringResult.isFailed()) {
      return isStringResult
    }

    const isNotEmptyResult = Validator.isNotEmpty(value)
    if (isNotEmptyResult.isFailed()) {
      return isNotEmptyResult
    }

    return Result.ok()
  }
}
