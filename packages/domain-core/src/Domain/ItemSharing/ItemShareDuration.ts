import { Result } from '../Core/Result'
import { ValueObject } from '../Core/ValueObject'

interface DurationProps {
  value: string
}

export class ItemShareDuration extends ValueObject<DurationProps> {
  static readonly DURATIONS = {
    AfterConsume: 'after-consume',
    OneDay: 'one-day',
    ThreeDays: 'three-days',
    FiveDays: 'five-days',
    Indefinite: 'indefinite',
  }

  get value(): string {
    return this.props.value
  }

  get isDateDuration(): boolean {
    return [
      ItemShareDuration.DURATIONS.OneDay,
      ItemShareDuration.DURATIONS.ThreeDays,
      ItemShareDuration.DURATIONS.FiveDays,
    ].includes(this.value)
  }

  get asSeconds(): number {
    switch (this.value) {
      case ItemShareDuration.DURATIONS.OneDay:
        return 86_400
      case ItemShareDuration.DURATIONS.ThreeDays:
        return 259_200
      case ItemShareDuration.DURATIONS.FiveDays:
        return 432_000
      default:
        throw new Error('Cannot convert non-date duration to seconds')
    }
  }

  private constructor(props: DurationProps) {
    super(props)
  }

  static create(name: string): Result<ItemShareDuration> {
    const isValidName = Object.values(this.DURATIONS).includes(name)
    if (!isValidName) {
      return Result.fail<ItemShareDuration>(`Invalid item share duration: ${name}`)
    } else {
      return Result.ok<ItemShareDuration>(new ItemShareDuration({ value: name }))
    }
  }
}
