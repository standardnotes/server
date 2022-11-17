import { Result } from './Result'

export class Validator {
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  static isValidUuid(value: string): Result<string> {
    const matchesUuidRegex = String(value).toLowerCase().match(Validator.UUID_REGEX) !== null
    if (matchesUuidRegex) {
      return Result.ok()
    }

    return Result.fail(`Given value is not a valid uuid: ${value}`)
  }
}
