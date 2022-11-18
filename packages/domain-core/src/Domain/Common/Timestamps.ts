import { Result } from '../Core/Result'
import { ValueObject } from '../Core/ValueObject'
import { TimestampsProps } from './TimestampsProps'

export class Timestamps extends ValueObject<TimestampsProps> {
  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  private constructor(props: TimestampsProps) {
    super(props)
  }

  static create(createdAt: Date, updatedAt: Date): Result<Timestamps> {
    if (!(createdAt instanceof Date)) {
      return Result.fail<Timestamps>(
        `Could not create Timestamps. Creation date should be a date object, given: ${createdAt}`,
      )
    }
    if (!(updatedAt instanceof Date)) {
      return Result.fail<Timestamps>(
        `Could not create Timestamps. Update date should be a date object, given: ${createdAt}`,
      )
    }

    return Result.ok<Timestamps>(new Timestamps({ createdAt, updatedAt }))
  }
}
