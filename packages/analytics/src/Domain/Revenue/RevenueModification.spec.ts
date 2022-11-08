import { Email } from '../Common/Email'
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
    })
    user = User.create({
      email: Email.create('test@test.te').getValue(),
    })
  })

  it('should create an aggregate for purchased subscription', () => {
    const revenueModification = RevenueModification.create({
      eventType: SubscriptionEventType.create('SUBSCRIPTION_PURCHASED').getValue(),
      previousMonthlyRevenue: MonthlyRevenue.create(123).getValue(),
      subscription,
      user,
    })

    expect(revenueModification.id.toString()).toHaveLength(36)
    expect(revenueModification.newMonthlyRevenue.value).toEqual(123 / 12)
  })

  it('should create an aggregate for subscription expired', () => {
    const revenueModification = RevenueModification.create({
      createdAt: new Date(1),
      eventType: SubscriptionEventType.create('SUBSCRIPTION_EXPIRED').getValue(),
      previousMonthlyRevenue: MonthlyRevenue.create(123).getValue(),
      subscription,
      user,
    })

    expect(revenueModification.id.toString()).toHaveLength(36)
    expect(revenueModification.newMonthlyRevenue.value).toEqual(0)
  })

  it('should create an aggregate for subscription cancelled', () => {
    const revenueModification = RevenueModification.create({
      eventType: SubscriptionEventType.create('SUBSCRIPTION_CANCELLED').getValue(),
      previousMonthlyRevenue: MonthlyRevenue.create(123).getValue(),
      subscription,
      user,
    })

    expect(revenueModification.id.toString()).toHaveLength(36)
    expect(revenueModification.newMonthlyRevenue.value).toEqual(123)
  })
})
