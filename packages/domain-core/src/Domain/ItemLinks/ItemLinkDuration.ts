import { Result } from '../Core/Result'
import { ValueObject } from '../Core/ValueObject'

interface DurationProps {
  value: string
}

export class ItemLinkDuration extends ValueObject<DurationProps> {
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
      ItemLinkDuration.DURATIONS.OneDay,
      ItemLinkDuration.DURATIONS.ThreeDays,
      ItemLinkDuration.DURATIONS.FiveDays,
    ].includes(this.value)
  }

  get asSeconds(): number {
    switch (this.value) {
      case ItemLinkDuration.DURATIONS.OneDay:
        return 86_400
      case ItemLinkDuration.DURATIONS.ThreeDays:
        return 259_200
      case ItemLinkDuration.DURATIONS.FiveDays:
        return 432_000
      default:
        throw new Error('Cannot convert non-date duration to seconds')
    }
  }

  private constructor(props: DurationProps) {
    super(props)
  }

  static create(name: string): Result<ItemLinkDuration> {
    const isValidName = Object.values(this.DURATIONS).includes(name)
    if (!isValidName) {
      return Result.fail<ItemLinkDuration>(`Invalid item share duration: ${name}`)
    } else {
      return Result.ok<ItemLinkDuration>(new ItemLinkDuration({ value: name }))
    }
  }
}
