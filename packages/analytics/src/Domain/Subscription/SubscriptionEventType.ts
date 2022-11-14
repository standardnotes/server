import { ValueObject, Result } from '@standardnotes/domain-core'

import { SubscriptionEventTypeProps } from './SubscriptionEventTypeProps'

export class SubscriptionEventType extends ValueObject<SubscriptionEventTypeProps> {
  get value(): string {
    return this.props.value
  }

  private constructor(props: SubscriptionEventTypeProps) {
    super(props)
  }

  static create(subscriptionEventType: string): Result<SubscriptionEventType> {
    if (
      ![
        'SUBSCRIPTION_PURCHASED',
        'SUBSCRIPTION_RENEWED',
        'SUBSCRIPTION_EXPIRED',
        'SUBSCRIPTION_REFUNDED',
        'SUBSCRIPTION_CANCELLED',
        'SUBSCRIPTION_DATA_MIGRATED',
      ].includes(subscriptionEventType)
    ) {
      return Result.fail<SubscriptionEventType>(`Invalid subscription event type ${subscriptionEventType}`)
    } else {
      return Result.ok<SubscriptionEventType>(new SubscriptionEventType({ value: subscriptionEventType }))
    }
  }
}
