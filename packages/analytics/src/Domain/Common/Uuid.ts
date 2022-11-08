import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'
import { UuidProps } from './UuidProps'

export class Uuid extends ValueObject<UuidProps> {
  get value(): string {
    return this.props.value
  }

  private constructor(props: UuidProps) {
    super(props)
  }

  static create(uuid: string): Result<Uuid> {
    if (!!uuid === false || uuid.length === 0) {
      return Result.fail<Uuid>('Uuid cannot be empty')
    } else {
      return Result.ok<Uuid>(new Uuid({ value: uuid }))
    }
  }
}
