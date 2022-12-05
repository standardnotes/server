import { Username } from '@standardnotes/domain-core'

import { Subscription } from '../Subscription/Subscription'
import { SubscriptionEventType } from '../Subscription/SubscriptionEventType'
import { SubscriptionPlanName } from '../Subscription/SubscriptionPlanName'
import { User } from '../User/User'
import { MonthlyRevenue } from './MonthlyRevenue'
import { RevenueModification } from './RevenueModification'

describe('RevenueModification', () => {
  let user: User
  let subscription: Subscription

  beforeEach(() => {
    subscription = Subscription.create({
      billingFrequency: 12,
      isFirstSubscriptionForUser: true,
      payedAmount: 123,
      planName: SubscriptionPlanName.create('PRO_PLAN').getValue(),
    }).getValue()
    user = User.create({
      username: Username.create('test@test.te').getValue(),
    }).getValue()
  })

  it('should create an aggregate for purchased subscription', () => {
    const revenueModification = RevenueModification.create({
      createdAt: 2,
      eventType: SubscriptionEventType.create('SUBSCRIPTION_PURCHASED').getValue(),
      previousMonthlyRevenue: MonthlyRevenue.create(123).getValue(),
      newMonthlyRevenue: MonthlyRevenue.create(45).getValue(),
      subscription,
      user,
    }).getValue()

    expect(revenueModification.id.toString()).toHaveLength(36)
    expect(revenueModification.props.newMonthlyRevenue.value).toEqual(45)
  })
})
