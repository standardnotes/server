import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { UniqueEntityId } from '../../Core/UniqueEntityId'
import { MonthlyRevenue } from '../../Revenue/MonthlyRevenue'
import { RevenueModification } from '../../Revenue/RevenueModification'
import { RevenueModificationRepositoryInterface } from '../../Revenue/RevenueModificationRepositoryInterface'
import { Subscription } from '../../Subscription/Subscription'
import { User } from '../../User/User'
import { Result } from '../../Core/Result'
import { DomainUseCaseInterface } from '../DomainUseCaseInterface'
import { SaveRevenueModificationDTO } from './SaveRevenueModificationDTO'
import { TimerInterface } from '@standardnotes/time'

@injectable()
export class SaveRevenueModification implements DomainUseCaseInterface<RevenueModification> {
  constructor(
    @inject(TYPES.RevenueModificationRepository)
    private revenueModificationRepository: RevenueModificationRepositoryInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: SaveRevenueModificationDTO): Promise<Result<RevenueModification>> {
    const user = User.create(
      {
        email: dto.userEmail,
      },
      new UniqueEntityId(dto.userUuid.value),
    )
    const subscription = Subscription.create(
      {
        isFirstSubscriptionForUser: dto.newSubscriber,
        payedAmount: dto.payedAmount,
        planName: dto.planName,
        billingFrequency: dto.billingFrequency,
      },
      new UniqueEntityId(dto.subscriptionId),
    )

    let previousMonthlyRevenue = MonthlyRevenue.create(0).getValue()
    const previousRevenueModification = await this.revenueModificationRepository.findLastByUserUuid(dto.userUuid)
    if (previousRevenueModification !== null) {
      previousMonthlyRevenue = previousRevenueModification.newMonthlyRevenue
    }

    const revenueModification = RevenueModification.create({
      eventType: dto.eventType,
      subscription,
      user,
      previousMonthlyRevenue,
      createdAt: this.timer.getTimestampInMicroseconds(),
    })

    await this.revenueModificationRepository.save(revenueModification)

    return Result.ok<RevenueModification>(revenueModification)
  }
}
