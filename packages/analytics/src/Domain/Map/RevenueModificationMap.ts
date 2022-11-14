import { injectable } from 'inversify'
import { Email, UniqueEntityId } from '@standardnotes/domain-core'

import { TypeORMRevenueModification } from '../../Infra/TypeORM/TypeORMRevenueModification'
import { MonthlyRevenue } from '../Revenue/MonthlyRevenue'
import { RevenueModification } from '../Revenue/RevenueModification'
import { Subscription } from '../Subscription/Subscription'
import { User } from '../User/User'
import { MapInterface } from './MapInterface'
import { SubscriptionPlanName } from '../Subscription/SubscriptionPlanName'
import { SubscriptionEventType } from '../Subscription/SubscriptionEventType'

@injectable()
export class RevenueModificationMap implements MapInterface<RevenueModification, TypeORMRevenueModification> {
  toDomain(persistence: TypeORMRevenueModification): RevenueModification {
    const userOrError = User.create(
      {
        email: Email.create(persistence.userEmail).getValue(),
      },
      new UniqueEntityId(persistence.userUuid),
    )
    if (userOrError.isFailed()) {
      throw new Error(`Could not create user: ${userOrError.getError()}`)
    }
    const user = userOrError.getValue()

    const subscriptionOrError = Subscription.create(
      {
        billingFrequency: persistence.billingFrequency,
        isFirstSubscriptionForUser: persistence.isNewCustomer,
        payedAmount: persistence.billingFrequency * persistence.newMonthlyRevenue,
        planName: SubscriptionPlanName.create(persistence.subscriptionPlan).getValue(),
      },
      new UniqueEntityId(persistence.subscriptionId),
    )
    if (subscriptionOrError.isFailed()) {
      throw new Error(`Could not create subscription: ${subscriptionOrError.getError()}`)
    }
    const subscription = subscriptionOrError.getValue()

    const previousMonthlyRevenueOrError = MonthlyRevenue.create(persistence.previousMonthlyRevenue)
    const newMonthlyRevenueOrError = MonthlyRevenue.create(persistence.newMonthlyRevenue)

    const revenuModificationOrError = RevenueModification.create(
      {
        user,
        subscription,
        eventType: SubscriptionEventType.create(persistence.eventType).getValue(),
        previousMonthlyRevenue: previousMonthlyRevenueOrError.getValue(),
        newMonthlyRevenue: newMonthlyRevenueOrError.getValue(),
        createdAt: persistence.createdAt,
      },
      new UniqueEntityId(persistence.uuid),
    )

    if (revenuModificationOrError.isFailed()) {
      throw new Error(`Could not map revenue modification to domain: ${revenuModificationOrError.getError()}`)
    }

    return revenuModificationOrError.getValue()
  }

  toPersistence(domain: RevenueModification): TypeORMRevenueModification {
    const { subscription, user } = domain.props
    const persistence = new TypeORMRevenueModification()
    persistence.uuid = domain.id.toString()
    persistence.billingFrequency = subscription.props.billingFrequency
    persistence.eventType = domain.props.eventType.value
    persistence.isNewCustomer = subscription.props.isFirstSubscriptionForUser
    persistence.newMonthlyRevenue = domain.props.newMonthlyRevenue.value
    persistence.previousMonthlyRevenue = domain.props.previousMonthlyRevenue.value
    persistence.subscriptionId = subscription.id.toValue() as number
    persistence.subscriptionPlan = subscription.props.planName.value
    persistence.userEmail = user.props.email.value
    persistence.userUuid = user.id.toString()
    persistence.createdAt = domain.props.createdAt

    return persistence
  }
}
