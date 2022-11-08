import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'
import { SubscriptionPlanNameProps } from './SubscriptionPlanNameProps'

export class SubscriptionPlanName extends ValueObject<SubscriptionPlanNameProps> {
  get value(): string {
    return this.props.value
  }

  private constructor(props: SubscriptionPlanNameProps) {
    super(props)
  }

  static create(subscriptionPlanName: string): Result<SubscriptionPlanName> {
    if (!['PRO_PLAN', 'PLUS_PLAN'].includes(subscriptionPlanName)) {
      return Result.fail<SubscriptionPlanName>(`Invalid subscription plan name ${subscriptionPlanName}`)
    } else {
      return Result.ok<SubscriptionPlanName>(new SubscriptionPlanName({ value: subscriptionPlanName }))
    }
  }
}
