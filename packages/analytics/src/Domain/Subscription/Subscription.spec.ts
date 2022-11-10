import { Subscription } from './Subscription'
import { SubscriptionPlanName } from './SubscriptionPlanName'

describe('Subscription', () => {
  it('should create an entity', () => {
    const subscription = Subscription.create({
      billingFrequency: 1,
      isFirstSubscriptionForUser: true,
      payedAmount: 12.99,
      planName: SubscriptionPlanName.create('PRO_PLAN').getValue(),
    }).getValue()

    expect(subscription.id.toString()).toHaveLength(36)
  })
})
