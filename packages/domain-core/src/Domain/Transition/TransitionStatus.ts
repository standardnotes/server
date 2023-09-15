import { Result } from '../Core/Result'
import { ValueObject } from '../Core/ValueObject'
import { TransitionStatusProps } from './TransitionStatusProps'

export class TransitionStatus extends ValueObject<TransitionStatusProps> {
  static readonly STATUSES = {
    InProgress: 'IN_PROGRESS',
    Failed: 'FAILED',
    Verified: 'VERIFIED',
  }

  get value(): string {
    return this.props.value
  }

  private constructor(props: TransitionStatusProps) {
    super(props)
  }

  static create(name: string): Result<TransitionStatus> {
    const isValidName = Object.values(this.STATUSES).includes(name)
    if (!isValidName) {
      return Result.fail<TransitionStatus>('Invalid transition status name.')
    } else {
      return Result.ok<TransitionStatus>(new TransitionStatus({ value: name }))
    }
  }
}
