import { inject, injectable } from 'inversify'
import { Result, UniqueEntityId } from '@standardnotes/domain-core'

import TYPES from '../../../Bootstrap/Types'
import { MonthlyRevenue } from '../../Revenue/MonthlyRevenue'
import { RevenueModification } from '../../Revenue/RevenueModification'
import { RevenueModificationRepositoryInterface } from '../../Revenue/RevenueModificationRepositoryInterface'
import { Subscription } from '../../Subscription/Subscription'
import { User } from '../../User/User'
import { DomainUseCaseInterface } from '../DomainUseCaseInterface'
import { SaveRevenueModificationDTO } from './SaveRevenueModificationDTO'
import { TimerInterface } from '@standardnotes/time'
import { SubscriptionEventType } from '../../Subscription/SubscriptionEventType'

@injectable()
export class SaveRevenueModification implements DomainUseCaseInterface<RevenueModification> {
  constructor(
    @inject(TYPES.RevenueModificationRepository)
    private revenueModificationRepository: RevenueModificationRepositoryInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: SaveRevenueModificationDTO): Promise<Result<RevenueModification>> {
    const userOrError = User.create(
      {
        username: dto.username,
      },
      new UniqueEntityId(dto.userUuid.value),
    )
    if (userOrError.isFailed()) {
      return Result.fail<RevenueModification>(userOrError.getError())
    }
    const user = userOrError.getValue()

    const subscriptionOrError = Subscription.create(
      {
        isFirstSubscriptionForUser: dto.newSubscriber,
        payedAmount: dto.payedAmount,
        planName: dto.planName,
        billingFrequency: dto.billingFrequency,
      },
      new UniqueEntityId(dto.subscriptionId),
    )
    if (subscriptionOrError.isFailed()) {
      return Result.fail<RevenueModification>(subscriptionOrError.getError())
    }
    const subscription = subscriptionOrError.getValue()

    const previousMonthlyRevenueOrError = MonthlyRevenue.create(0)
    if (previousMonthlyRevenueOrError.isFailed()) {
      return Result.fail<RevenueModification>(previousMonthlyRevenueOrError.getError())
    }
    let previousMonthlyRevenue = previousMonthlyRevenueOrError.getValue()

    const previousRevenueModification = await this.revenueModificationRepository.findLastByUserUuid(dto.userUuid)
    if (previousRevenueModification !== null) {
      previousMonthlyRevenue = previousRevenueModification.props.newMonthlyRevenue
    }
    const newMonthlyRevenueOrError = this.calculateNewMonthlyRevenue(
      subscription,
      previousMonthlyRevenue,
      dto.eventType,
    )
    if (newMonthlyRevenueOrError.isFailed()) {
      return Result.fail<RevenueModification>(newMonthlyRevenueOrError.getError())
    }
    const newMonthlyRevenue = newMonthlyRevenueOrError.getValue()

    const revenueModificationOrError = RevenueModification.create({
      eventType: dto.eventType,
      subscription,
      user,
      previousMonthlyRevenue,
      newMonthlyRevenue,
      createdAt: this.timer.getTimestampInMicroseconds(),
    })

    if (revenueModificationOrError.isFailed()) {
      return Result.fail<RevenueModification>(revenueModificationOrError.getError())
    }
    const revenueModification = revenueModificationOrError.getValue()

    await this.revenueModificationRepository.save(revenueModification)

    return Result.ok<RevenueModification>(revenueModification)
  }

  private calculateNewMonthlyRevenue(
    subscription: Subscription,
    previousMonthlyRevenue: MonthlyRevenue,
    eventType: SubscriptionEventType,
  ): Result<MonthlyRevenue> {
    let revenue = 0
    switch (eventType.value) {
      case 'SUBSCRIPTION_PURCHASED':
      case 'SUBSCRIPTION_RENEWED':
      case 'SUBSCRIPTION_DATA_MIGRATED':
        revenue = subscription.props.payedAmount / subscription.props.billingFrequency
        break
      case 'SUBSCRIPTION_EXPIRED':
      case 'SUBSCRIPTION_REFUNDED':
        revenue = 0
        break
      case 'SUBSCRIPTION_CANCELLED':
        revenue = previousMonthlyRevenue.value
        break
    }

    const monthlyRevenueOrError = MonthlyRevenue.create(revenue)

    if (monthlyRevenueOrError.isFailed()) {
      return Result.fail<MonthlyRevenue>(monthlyRevenueOrError.getError())
    }

    return Result.ok<MonthlyRevenue>(monthlyRevenueOrError.getValue())
  }
}
