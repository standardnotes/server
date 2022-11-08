import 'reflect-metadata'

import { Email } from '../../Common/Email'
import { Uuid } from '../../Common/Uuid'
import { MonthlyRevenue } from '../../Revenue/MonthlyRevenue'

import { RevenueModification } from '../../Revenue/RevenueModification'
import { RevenueModificationRepositoryInterface } from '../../Revenue/RevenueModificationRepositoryInterface'
import { SubscriptionEventType } from '../../Subscription/SubscriptionEventType'
import { SubscriptionPlanName } from '../../Subscription/SubscriptionPlanName'
import { SaveRevenueModification } from './SaveRevenueModification'

describe('SaveRevenueModification', () => {
  let revenueModificationRepository: RevenueModificationRepositoryInterface
  let previousMonthlyRevenue: RevenueModification

  const createUseCase = () => new SaveRevenueModification(revenueModificationRepository)

  beforeEach(() => {
    previousMonthlyRevenue = {
      newMonthlyRevenue: MonthlyRevenue.create(2).getValue(),
    } as jest.Mocked<RevenueModification>

    revenueModificationRepository = {} as jest.Mocked<RevenueModificationRepositoryInterface>
    revenueModificationRepository.findLastByUserUuid = jest.fn().mockReturnValue(previousMonthlyRevenue)
    revenueModificationRepository.save = jest.fn()
  })

  it('should persist a revenue modification', async () => {
    const revenueOrError = await createUseCase().execute({
      billingFrequency: 1,
      eventType: SubscriptionEventType.create('SUBSCRIPTION_PURCHASED').getValue(),
      newSubscriber: true,
      payedAmount: 12.99,
      planName: SubscriptionPlanName.create('PRO_PLAN').getValue(),
      subscriptionId: 1234,
      userEmail: Email.create('test@test.te').getValue(),
      userUuid: Uuid.create('1-2-3').getValue(),
    })
    expect(revenueOrError.isFailed()).toBeFalsy()
    const revenue = revenueOrError.getValue()
    expect(revenue.newMonthlyRevenue.value).toEqual(12.99)
  })
})
