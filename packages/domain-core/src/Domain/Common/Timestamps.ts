import { Result } from '../Core/Result'
import { ValueObject } from '../Core/ValueObject'
import { TimestampsProps } from './TimestampsProps'

export class Timestamps extends ValueObject<TimestampsProps> {
  get createdAt(): number {
    return this.props.createdAt
  }

  get updatedAt(): number {
    return this.props.updatedAt
  }

  private constructor(props: TimestampsProps) {
    super(props)
  }

  static create(createdAt: number, updatedAt: number): Result<Timestamps> {
    if (isNaN(createdAt) || createdAt === null || createdAt === undefined) {
      return Result.fail<Timestamps>(
        `Could not create Timestamps. Creation date should be a number, given: ${createdAt}`,
      )
    }
    if (isNaN(updatedAt) || updatedAt === null || updatedAt === undefined) {
      return Result.fail<Timestamps>(`Could not create Timestamps. Update date should be a number, given: ${createdAt}`)
    }

    return Result.ok<Timestamps>(new Timestamps({ createdAt, updatedAt }))
  }
}
