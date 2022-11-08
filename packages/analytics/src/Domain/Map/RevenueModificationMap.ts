import { TypeORMRevenueModification } from '../../Infra/TypeORM/TypeORMRevenueModification'
import { UniqueEntityId } from '../Core/UniqueEntityId'
import { MonthlyRevenue } from '../Revenue/MonthlyRevenue'
import { RevenueModification } from '../Revenue/RevenueModification'
import { Subscription } from '../Subscription/Subscription'
import { User } from '../User/User'
import { MapInterface } from './MapInterface'
import { Email } from '../Common/Email'
import { SubscriptionPlanName } from '../Subscription/SubscriptionPlanName'
import { SubscriptionEventType } from '../Subscription/SubscriptionEventType'

export class RevenueModificationMap implements MapInterface<RevenueModification, TypeORMRevenueModification> {
  toDomain(persistence: TypeORMRevenueModification): RevenueModification {
    const user = User.create(
      {
        email: Email.create(persistence.userEmail).getValue(),
      },
      new UniqueEntityId(persistence.userUuid),
    )
    const subscription = Subscription.create(
      {
        billingFrequency: persistence.billingFrequency,
        isFirstSubscriptionForUser: persistence.isNewCustomer,
        payedAmount: persistence.billingFrequency * persistence.newMonthlyRevenue,
        planName: SubscriptionPlanName.create(persistence.subscriptionPlan).getValue(),
      },
      new UniqueEntityId(persistence.subscriptionId),
    )
    const previousMonthlyRevenueOrError = MonthlyRevenue.create(persistence.previousMonthlyRevenue)

    return RevenueModification.create(
      {
        user,
        subscription,
        eventType: SubscriptionEventType.create(persistence.eventType).getValue(),
        previousMonthlyRevenue: previousMonthlyRevenueOrError.getValue(),
      },
      new UniqueEntityId(persistence.uuid),
    )
  }

  toPersistence(domain: RevenueModification): TypeORMRevenueModification {
    const { subscription, user } = domain.props
    const persistence = new TypeORMRevenueModification()
    persistence.uuid = domain.id.toString()
    persistence.billingFrequency = subscription.props.billingFrequency
    persistence.eventType = domain.props.eventType.value
    persistence.isNewCustomer = subscription.props.isFirstSubscriptionForUser
    persistence.newMonthlyRevenue = domain.newMonthlyRevenue.value
    persistence.previousMonthlyRevenue = domain.props.previousMonthlyRevenue.value
    persistence.subscriptionId = subscription.id.toValue() as number
    persistence.subscriptionPlan = subscription.props.planName.value
    persistence.userEmail = user.props.email.value
    persistence.userUuid = user.id.toString()

    return persistence
  }
}
