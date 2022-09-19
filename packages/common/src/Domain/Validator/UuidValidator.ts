import { Uuid } from '../DataType/Uuid'
import { ValidatorInterface } from './ValidatorInterface'

export class UuidValidator implements ValidatorInterface<Uuid> {
  private readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  validate(data: Uuid): boolean {
    return String(data).toLowerCase().match(this.UUID_REGEX) !== null
  }
}
