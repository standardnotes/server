import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'
import { Email, Result, Uuid } from '@standardnotes/domain-core'

import { MonthlyRevenue } from '../../Revenue/MonthlyRevenue'

import { RevenueModification } from '../../Revenue/RevenueModification'
import { RevenueModificationRepositoryInterface } from '../../Revenue/RevenueModificationRepositoryInterface'
import { SubscriptionEventType } from '../../Subscription/SubscriptionEventType'
import { SubscriptionPlanName } from '../../Subscription/SubscriptionPlanName'
import { SaveRevenueModification } from './SaveRevenueModification'
import { User } from '../../User/User'
import { Subscription } from '../../Subscription/Subscription'

describe('SaveRevenueModification', () => {
  let revenueModificationRepository: RevenueModificationRepositoryInterface
  let previousMonthlyRevenueModification: RevenueModification
  let timer: TimerInterface

  const createUseCase = () => new SaveRevenueModification(revenueModificationRepository, timer)

  beforeEach(() => {
    const previousMonthlyRevenue = {
      value: 2,
    } as jest.Mocked<MonthlyRevenue>
    previousMonthlyRevenueModification = {
      props: {},
    } as jest.Mocked<RevenueModification>
    previousMonthlyRevenueModification.props.newMonthlyRevenue = previousMonthlyRevenue

    revenueModificationRepository = {} as jest.Mocked<RevenueModificationRepositoryInterface>
    revenueModificationRepository.findLastByUserUuid = jest.fn().mockReturnValue(previousMonthlyRevenueModification)
    revenueModificationRepository.save = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)
  })

  it('should persist a revenue modification for subscription purchased event', async () => {
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

    expect(revenue.props.newMonthlyRevenue.value).toEqual(12.99)
  })

  it('should persist a revenue modification for subscription expired event', async () => {
    const revenueOrError = await createUseCase().execute({
      billingFrequency: 1,
      eventType: SubscriptionEventType.create('SUBSCRIPTION_EXPIRED').getValue(),
      newSubscriber: true,
      payedAmount: 12.99,
      planName: SubscriptionPlanName.create('PRO_PLAN').getValue(),
      subscriptionId: 1234,
      userEmail: Email.create('test@test.te').getValue(),
      userUuid: Uuid.create('1-2-3').getValue(),
    })

    expect(revenueOrError.isFailed()).toBeFalsy()
    const revenue = revenueOrError.getValue()

    expect(revenue.props.newMonthlyRevenue.value).toEqual(0)
  })

  it('should persist a revenue modification for subscription cancelled event', async () => {
    const revenueOrError = await createUseCase().execute({
      billingFrequency: 1,
      eventType: SubscriptionEventType.create('SUBSCRIPTION_CANCELLED').getValue(),
      newSubscriber: true,
      payedAmount: 2,
      planName: SubscriptionPlanName.create('PRO_PLAN').getValue(),
      subscriptionId: 1234,
      userEmail: Email.create('test@test.te').getValue(),
      userUuid: Uuid.create('1-2-3').getValue(),
    })

    expect(revenueOrError.isFailed()).toBeFalsy()
    const revenue = revenueOrError.getValue()

    expect(revenue.props.newMonthlyRevenue.value).toEqual(2)
  })

  it('should persist a revenue modification for subscription purchased event if previous revenue modification did not exist', async () => {
    revenueModificationRepository.findLastByUserUuid = jest.fn().mockReturnValue(null)

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

    expect(revenue.props.newMonthlyRevenue.value).toEqual(12.99)
  })

  it('should not persist a revenue modification if failed to create user', async () => {
    const mock = jest.spyOn(User, 'create')
    mock.mockReturnValue(Result.fail('Oops'))

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

    expect(revenueOrError.isFailed()).toBeTruthy()

    mock.mockRestore()
  })

  it('should not persist a revenue modification if failed to create a subscription', async () => {
    const mock = jest.spyOn(Subscription, 'create')
    mock.mockReturnValue(Result.fail('Oops'))

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

    expect(revenueOrError.isFailed()).toBeTruthy()

    mock.mockRestore()
  })

  it('should not persist a revenue modification if failed to create a previous monthly revenue', async () => {
    const mock = jest.spyOn(MonthlyRevenue, 'create')
    mock.mockReturnValue(Result.fail('Oops'))

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

    expect(revenueOrError.isFailed()).toBeTruthy()

    mock.mockRestore()
  })

  it('should not persist a revenue modification if failed to create a next monthly revenue', async () => {
    const mock = jest.spyOn(MonthlyRevenue, 'create')
    mock.mockReturnValueOnce(Result.ok()).mockReturnValueOnce(Result.fail('Oops'))

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

    expect(revenueOrError.isFailed()).toBeTruthy()

    mock.mockRestore()
  })

  it('should not persist a revenue modification if failed to create it', async () => {
    const mock = jest.spyOn(RevenueModification, 'create')
    mock.mockReturnValue(Result.fail('Oops'))

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

    expect(revenueOrError.isFailed()).toBeTruthy()

    mock.mockRestore()
  })
})
