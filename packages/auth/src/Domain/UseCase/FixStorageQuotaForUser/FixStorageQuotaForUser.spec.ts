import { DomainEventPublisherInterface, FileQuotaRecalculationRequestedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GetRegularSubscriptionForUser } from '../GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'
import { GetSharedSubscriptionForUser } from '../GetSharedSubscriptionForUser/GetSharedSubscriptionForUser'
import { ListSharedSubscriptionInvitations } from '../ListSharedSubscriptionInvitations/ListSharedSubscriptionInvitations'
import { SetSubscriptionSettingValue } from '../SetSubscriptionSettingValue/SetSubscriptionSettingValue'
import { FixStorageQuotaForUser } from './FixStorageQuotaForUser'
import { User } from '../../User/User'
import { Result } from '@standardnotes/domain-core'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { InvitationStatus } from '../../SharedSubscription/InvitationStatus'
import { SharedSubscriptionInvitation } from '../../SharedSubscription/SharedSubscriptionInvitation'

describe('FixStorageQuotaForUser', () => {
  let userRepository: UserRepositoryInterface
  let getRegularSubscription: GetRegularSubscriptionForUser
  let getSharedSubscriptionForUser: GetSharedSubscriptionForUser
  let setSubscriptonSettingValue: SetSubscriptionSettingValue
  let listSharedSubscriptionInvitations: ListSharedSubscriptionInvitations
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let logger: Logger

  const createUseCase = () =>
    new FixStorageQuotaForUser(
      userRepository,
      getRegularSubscription,
      getSharedSubscriptionForUser,
      setSubscriptonSettingValue,
      listSharedSubscriptionInvitations,
      domainEventFactory,
      domainEventPublisher,
      logger,
    )

  beforeEach(() => {
    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue({
      uuid: '00000000-0000-0000-0000-000000000000',
    } as jest.Mocked<User>)

    getRegularSubscription = {} as jest.Mocked<GetRegularSubscriptionForUser>
    getRegularSubscription.execute = jest.fn().mockReturnValue(
      Result.ok({
        uuid: '00000000-0000-0000-0000-000000000000',
      } as jest.Mocked<UserSubscription>),
    )

    getSharedSubscriptionForUser = {} as jest.Mocked<GetSharedSubscriptionForUser>
    getSharedSubscriptionForUser.execute = jest.fn().mockReturnValue(
      Result.ok({
        uuid: '00000000-0000-0000-0000-000000000000',
      } as jest.Mocked<UserSubscription>),
    )

    setSubscriptonSettingValue = {} as jest.Mocked<SetSubscriptionSettingValue>
    setSubscriptonSettingValue.execute = jest.fn().mockReturnValue(Result.ok(Result.ok()))

    listSharedSubscriptionInvitations = {} as jest.Mocked<ListSharedSubscriptionInvitations>
    listSharedSubscriptionInvitations.execute = jest.fn().mockReturnValue({
      invitations: [
        {
          uuid: '00000000-0000-0000-0000-000000000000',
          status: InvitationStatus.Accepted,
          inviteeIdentifier: 'test2@test.te',
        } as jest.Mocked<SharedSubscriptionInvitation>,
      ],
    })

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createFileQuotaRecalculationRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<FileQuotaRecalculationRequestedEvent>)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()
  })

  it('should return error result if user cannot be found', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error result if regular subscription cannot be found', async () => {
    getRegularSubscription.execute = jest.fn().mockReturnValue(Result.fail('test'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error result if shared subscription cannot be found', async () => {
    getSharedSubscriptionForUser.execute = jest.fn().mockReturnValue(Result.fail('test'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error result if setting value cannot be set', async () => {
    setSubscriptonSettingValue.execute = jest.fn().mockReturnValue(Result.fail('test'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should reset storage quota and ask for recalculation for user and all its shared subscriptions', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(domainEventPublisher.publish).toHaveBeenCalledTimes(2)
  })

  it('should return error if the username is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: '',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if the invitee username is invalid', async () => {
    listSharedSubscriptionInvitations.execute = jest.fn().mockReturnValue({
      invitations: [
        {
          uuid: '00000000-0000-0000-0000-000000000000',
          status: InvitationStatus.Accepted,
          inviteeIdentifier: '',
        } as jest.Mocked<SharedSubscriptionInvitation>,
      ],
    })

    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if the invitee cannot be found', async () => {
    userRepository.findOneByUsernameOrEmail = jest
      .fn()
      .mockReturnValueOnce({
        uuid: '00000000-0000-0000-0000-000000000000',
      } as jest.Mocked<User>)
      .mockReturnValueOnce(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if fails to reset storage quota for the invitee', async () => {
    setSubscriptonSettingValue.execute = jest
      .fn()
      .mockReturnValueOnce(Result.ok())
      .mockReturnValueOnce(Result.fail('test'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
