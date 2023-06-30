import { Result } from '../Core/Result'
import { ValueObject } from '../Core/ValueObject'
import { DatesProps } from './DatesProps'

export class Dates extends ValueObject<DatesProps> {
  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  private constructor(props: DatesProps) {
    super(props)
  }

  static create(createdAt: Date, updatedAt: Date): Result<Dates> {
    if (!(createdAt instanceof Date)) {
      return Result.fail<Dates>(`Could not create Dates. Creation date should be a date object, given: ${createdAt}`)
    }
    if (!(updatedAt instanceof Date)) {
      return Result.fail<Dates>(`Could not create Dates. Update date should be a date object, given: ${updatedAt}`)
    }

    return Result.ok<Dates>(new Dates({ createdAt, updatedAt }))
  }
}
