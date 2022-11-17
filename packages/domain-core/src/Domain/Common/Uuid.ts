import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'
import { UuidProps } from './UuidProps'
import { Validator } from '../Core/Validator'

export class Uuid extends ValueObject<UuidProps> {
  get value(): string {
    return this.props.value
  }

  private constructor(props: UuidProps) {
    super(props)
  }

  static create(uuid: string): Result<Uuid> {
    const validUuidOrError = Validator.isValidUuid(uuid)
    if (validUuidOrError.isFailed()) {
      return Result.fail<Uuid>(validUuidOrError.getError())
    } else {
      return Result.ok<Uuid>(new Uuid({ value: uuid }))
    }
  }
}
