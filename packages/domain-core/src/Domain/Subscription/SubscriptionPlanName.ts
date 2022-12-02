import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'
import { SubscriptionPlanNameProps } from './SubscriptionPlanNameProps'

export class SubscriptionPlanName extends ValueObject<SubscriptionPlanNameProps> {
  static readonly NAMES = {
    PlusPlan: 'PLUS_PLAN',
    ProPlan: 'PRO_PLAN',
  }

  get value(): string {
    return this.props.value
  }

  private constructor(props: SubscriptionPlanNameProps) {
    super(props)
  }

  static create(name: string): Result<SubscriptionPlanName> {
    const isValidName = Object.values(this.NAMES).includes(name)
    if (!isValidName) {
      return Result.fail<SubscriptionPlanName>(`Invalid subscription plan name: ${name}`)
    } else {
      return Result.ok<SubscriptionPlanName>(new SubscriptionPlanName({ value: name }))
    }
  }
}
