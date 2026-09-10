import { TimerInterface } from '@standardnotes/time'

import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { SelectValidUserSubscription } from './SelectValidUserSubscription'

describe('SelectValidUserSubscription', () => {
  const now = 1_700_000_000_000_000

  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let timer: TimerInterface

  const createUseCase = () => new SelectValidUserSubscription(userSubscriptionRepository, timer)

  const createSubscription = (props: {
    endsAt: number
    cancelled: boolean
    subscriptionType?: UserSubscriptionType
  }): UserSubscription => {
    const subscription = new UserSubscription()
    subscription.endsAt = props.endsAt
    subscription.cancelled = props.cancelled
    subscription.subscriptionType = props.subscriptionType ?? UserSubscriptionType.Regular

    return subscription
  }

  beforeEach(() => {
    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findByUserUuid = jest.fn().mockResolvedValue([])
    userSubscriptionRepository.findByUserUuidAndType = jest.fn().mockResolvedValue([])

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(now)
  })

  it('should return null when there are no subscriptions', async () => {
    expect(await createUseCase().execute({ userUuid: 'user-uuid' })).toBeNull()
  })

  it('should prefer unexpired cancelled over expired uncancelled', async () => {
    const unexpiredCancelled = createSubscription({ endsAt: now + 1, cancelled: true })
    const expiredUncancelled = createSubscription({ endsAt: now - 1, cancelled: false })
    userSubscriptionRepository.findByUserUuid = jest
      .fn()
      .mockResolvedValue([unexpiredCancelled, expiredUncancelled])

    const selected = await createUseCase().execute({ userUuid: 'user-uuid' })

    expect(selected).toBe(unexpiredCancelled)
  })

  it('should prefer unexpired uncancelled over unexpired cancelled', async () => {
    const unexpiredCancelled = createSubscription({ endsAt: now + 2, cancelled: true })
    const unexpiredUncancelled = createSubscription({ endsAt: now + 1, cancelled: false })
    userSubscriptionRepository.findByUserUuid = jest
      .fn()
      .mockResolvedValue([unexpiredCancelled, unexpiredUncancelled])

    const selected = await createUseCase().execute({ userUuid: 'user-uuid' })

    expect(selected).toBe(unexpiredUncancelled)
  })

  it('should prefer the highest ends_at among unexpired uncancelled subscriptions regardless of input order', async () => {
    const unexpiredUncancelledLater = createSubscription({ endsAt: now + 2, cancelled: false })
    const unexpiredUncancelledSooner = createSubscription({ endsAt: now + 1, cancelled: false })
    userSubscriptionRepository.findByUserUuid = jest
      .fn()
      .mockResolvedValue([unexpiredUncancelledSooner, unexpiredUncancelledLater])

    const selected = await createUseCase().execute({ userUuid: 'user-uuid' })

    expect(selected).toBe(unexpiredUncancelledLater)
  })

  it('should prefer the highest ends_at among unexpired cancelled subscriptions when no unexpired uncancelled exists', async () => {
    const unexpiredCancelledSooner = createSubscription({ endsAt: now + 1, cancelled: true })
    const unexpiredCancelledLater = createSubscription({ endsAt: now + 2, cancelled: true })
    userSubscriptionRepository.findByUserUuid = jest
      .fn()
      .mockResolvedValue([unexpiredCancelledSooner, unexpiredCancelledLater])

    const selected = await createUseCase().execute({ userUuid: 'user-uuid' })

    expect(selected).toBe(unexpiredCancelledLater)
  })

  it('should prefer expired uncancelled over expired cancelled when no unexpired subscriptions exist', async () => {
    const expiredCancelled = createSubscription({ endsAt: now - 1, cancelled: true })
    const expiredUncancelled = createSubscription({ endsAt: now - 2, cancelled: false })
    userSubscriptionRepository.findByUserUuid = jest
      .fn()
      .mockResolvedValue([expiredCancelled, expiredUncancelled])

    const selected = await createUseCase().execute({ userUuid: 'user-uuid' })

    expect(selected).toBe(expiredUncancelled)
  })

  it('should fall back to the highest ends_at expired cancelled subscription when all subscriptions are expired and cancelled', async () => {
    const expiredCancelledLater = createSubscription({ endsAt: now - 1, cancelled: true })
    const expiredCancelledSooner = createSubscription({ endsAt: now - 2, cancelled: true })
    userSubscriptionRepository.findByUserUuid = jest
      .fn()
      .mockResolvedValue([expiredCancelledSooner, expiredCancelledLater])

    const selected = await createUseCase().execute({ userUuid: 'user-uuid' })

    expect(selected).toBe(expiredCancelledLater)
  })

  it('should sort subscriptions by ends_at when values are returned as strings from the database', async () => {
    const unexpiredCancelledLater = createSubscription({ endsAt: now + 2, cancelled: true })
    const unexpiredCancelledSooner = createSubscription({ endsAt: now + 1, cancelled: true })
    unexpiredCancelledLater.endsAt = String(now + 2) as unknown as number
    unexpiredCancelledSooner.endsAt = String(now + 1) as unknown as number
    userSubscriptionRepository.findByUserUuid = jest
      .fn()
      .mockResolvedValue([unexpiredCancelledSooner, unexpiredCancelledLater])

    const selected = await createUseCase().execute({ userUuid: 'user-uuid' })

    expect(selected).toBe(unexpiredCancelledLater)
  })

  it('should query subscriptions by type when subscriptionType is provided', async () => {
    const regularSubscription = createSubscription({ endsAt: now + 1, cancelled: false })
    userSubscriptionRepository.findByUserUuidAndType = jest.fn().mockResolvedValue([regularSubscription])

    const selected = await createUseCase().execute({
      userUuid: 'user-uuid',
      subscriptionType: UserSubscriptionType.Regular,
    })

    expect(userSubscriptionRepository.findByUserUuidAndType).toHaveBeenCalledWith(
      'user-uuid',
      UserSubscriptionType.Regular,
    )
    expect(userSubscriptionRepository.findByUserUuid).not.toHaveBeenCalled()
    expect(selected).toBe(regularSubscription)
  })
})
