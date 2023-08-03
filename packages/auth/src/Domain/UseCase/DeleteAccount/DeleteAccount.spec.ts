import 'reflect-metadata'

import { AccountDeletionRequestedEvent, DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { DeleteAccount } from './DeleteAccount'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { UserSubscriptionServiceInterface } from '../../Subscription/UserSubscriptionServiceInterface'
import { TimerInterface } from '@standardnotes/time'

describe('DeleteAccount', () => {
  let userRepository: UserRepositoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let userSubscriptionService: UserSubscriptionServiceInterface
  let user: User
  let regularSubscription: UserSubscription
  let timer: TimerInterface

  const createUseCase = () =>
    new DeleteAccount(userRepository, userSubscriptionService, domainEventPublisher, domainEventFactory, timer)

  beforeEach(() => {
    user = {
      uuid: '1-2-3',
    } as jest.Mocked<User>

    regularSubscription = {
      uuid: '1-2-3',
      subscriptionType: UserSubscriptionType.Regular,
      user: Promise.resolve(user),
    } as jest.Mocked<UserSubscription>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)

    userSubscriptionService = {} as jest.Mocked<UserSubscriptionServiceInterface>
    userSubscriptionService.findRegularSubscriptionForUserUuid = jest
      .fn()
      .mockReturnValue({ regularSubscription, sharedSubscription: null })

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createAccountDeletionRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<AccountDeletionRequestedEvent>)

    timer = {} as jest.Mocked<TimerInterface>
    timer.convertDateToMicroseconds = jest.fn().mockReturnValue(1)
  })

  describe('when user uuid is provided', () => {
    it('should trigger account deletion - no subscription', async () => {
      userSubscriptionService.findRegularSubscriptionForUserUuid = jest
        .fn()
        .mockReturnValue({ regularSubscription: null, sharedSubscription: null })

      const result = await createUseCase().execute({ userUuid: '00000000-0000-0000-0000-000000000000' })

      expect(result.isFailed()).toBeFalsy()
      expect(domainEventPublisher.publish).toHaveBeenCalledTimes(1)
      expect(domainEventFactory.createAccountDeletionRequestedEvent).toHaveBeenLastCalledWith({
        userUuid: '1-2-3',
        userCreatedAtTimestamp: 1,
        regularSubscriptionUuid: undefined,
      })
    })

    it('should trigger account deletion - subscription present', async () => {
      userSubscriptionService.findRegularSubscriptionForUserUuid = jest
        .fn()
        .mockReturnValue({ regularSubscription, sharedSubscription: null })

      const result = await createUseCase().execute({ userUuid: '00000000-0000-0000-0000-000000000000' })

      expect(result.isFailed()).toBeFalsy()

      expect(domainEventPublisher.publish).toHaveBeenCalledTimes(1)
      expect(domainEventFactory.createAccountDeletionRequestedEvent).toHaveBeenLastCalledWith({
        userUuid: '1-2-3',
        userCreatedAtTimestamp: 1,
        regularSubscriptionUuid: '1-2-3',
      })
    })

    it('should not trigger account deletion if user is not found', async () => {
      userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

      const result = await createUseCase().execute({ userUuid: '00000000-0000-0000-0000-000000000000' })

      expect(result.isFailed()).toBeTruthy()

      expect(domainEventPublisher.publish).not.toHaveBeenCalled()
      expect(domainEventFactory.createAccountDeletionRequestedEvent).not.toHaveBeenCalled()
    })

    it('should not trigger account deletion if user uuid is invalid', async () => {
      const result = await createUseCase().execute({ userUuid: 'invalid' })

      expect(result.isFailed()).toBeTruthy()

      expect(domainEventPublisher.publish).not.toHaveBeenCalled()
      expect(domainEventFactory.createAccountDeletionRequestedEvent).not.toHaveBeenCalled()
    })
  })

  describe('when username is provided', () => {
    it('should trigger account deletion - no subscription', async () => {
      userSubscriptionService.findRegularSubscriptionForUserUuid = jest
        .fn()
        .mockReturnValue({ regularSubscription: null, sharedSubscription: null })

      const result = await createUseCase().execute({ username: 'test@test.te' })

      expect(result.isFailed()).toBeFalsy()
      expect(domainEventPublisher.publish).toHaveBeenCalledTimes(1)
      expect(domainEventFactory.createAccountDeletionRequestedEvent).toHaveBeenLastCalledWith({
        userUuid: '1-2-3',
        userCreatedAtTimestamp: 1,
        regularSubscriptionUuid: undefined,
      })
    })

    it('should trigger account deletion - subscription present', async () => {
      userSubscriptionService.findRegularSubscriptionForUserUuid = jest
        .fn()
        .mockReturnValue({ regularSubscription, sharedSubscription: null })

      const result = await createUseCase().execute({ username: 'test@test.te' })

      expect(result.isFailed()).toBeFalsy()

      expect(domainEventPublisher.publish).toHaveBeenCalledTimes(1)
      expect(domainEventFactory.createAccountDeletionRequestedEvent).toHaveBeenLastCalledWith({
        userUuid: '1-2-3',
        userCreatedAtTimestamp: 1,
        regularSubscriptionUuid: '1-2-3',
      })
    })

    it('should not trigger account deletion if user is not found', async () => {
      userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

      const result = await createUseCase().execute({ username: 'test@test.te' })

      expect(result.isFailed()).toBeTruthy()

      expect(domainEventPublisher.publish).not.toHaveBeenCalled()
      expect(domainEventFactory.createAccountDeletionRequestedEvent).not.toHaveBeenCalled()
    })

    it('should not trigger account deletion if username is invalid', async () => {
      const result = await createUseCase().execute({ username: '' })

      expect(result.isFailed()).toBeTruthy()

      expect(domainEventPublisher.publish).not.toHaveBeenCalled()
      expect(domainEventFactory.createAccountDeletionRequestedEvent).not.toHaveBeenCalled()
    })
  })

  describe('when neither user uuid nor username is provided', () => {
    it('should not trigger account deletion', async () => {
      const result = await createUseCase().execute({})

      expect(result.isFailed()).toBeTruthy()

      expect(domainEventPublisher.publish).not.toHaveBeenCalled()
      expect(domainEventFactory.createAccountDeletionRequestedEvent).not.toHaveBeenCalled()
    })
  })
})
