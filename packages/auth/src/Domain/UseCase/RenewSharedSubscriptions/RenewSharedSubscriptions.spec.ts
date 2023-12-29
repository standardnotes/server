import { Logger } from 'winston'
import { SharedSubscriptionInvitationRepositoryInterface } from '../../SharedSubscription/SharedSubscriptionInvitationRepositoryInterface'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { ListSharedSubscriptionInvitations } from '../ListSharedSubscriptionInvitations/ListSharedSubscriptionInvitations'
import { RenewSharedSubscriptions } from './RenewSharedSubscriptions'
import { SharedSubscriptionInvitation } from '../../SharedSubscription/SharedSubscriptionInvitation'
import { InviteeIdentifierType } from '../../SharedSubscription/InviteeIdentifierType'
import { User } from '../../User/User'
import { InvitationStatus } from '../../SharedSubscription/InvitationStatus'
import { RoleServiceInterface } from '../../Role/RoleServiceInterface'

describe('RenewSharedSubscriptions', () => {
  let listSharedSubscriptionInvitations: ListSharedSubscriptionInvitations
  let sharedSubscriptionInvitationRepository: SharedSubscriptionInvitationRepositoryInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let userRepository: UserRepositoryInterface
  let logger: Logger
  let sharedSubscriptionInvitation: SharedSubscriptionInvitation
  let user: User
  let roleService: RoleServiceInterface

  const createUseCase = () =>
    new RenewSharedSubscriptions(
      listSharedSubscriptionInvitations,
      sharedSubscriptionInvitationRepository,
      userSubscriptionRepository,
      userRepository,
      roleService,
      logger,
    )

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.uuid = '00000000-0000-0000-0000-000000000000'

    sharedSubscriptionInvitation = {} as jest.Mocked<SharedSubscriptionInvitation>
    sharedSubscriptionInvitation.uuid = '00000000-0000-0000-0000-000000000000'
    sharedSubscriptionInvitation.inviteeIdentifier = 'test@test.te'
    sharedSubscriptionInvitation.inviteeIdentifierType = InviteeIdentifierType.Email
    sharedSubscriptionInvitation.status = InvitationStatus.Accepted

    listSharedSubscriptionInvitations = {} as jest.Mocked<ListSharedSubscriptionInvitations>
    listSharedSubscriptionInvitations.execute = jest.fn().mockReturnValue({
      invitations: [sharedSubscriptionInvitation],
    })

    sharedSubscriptionInvitationRepository = {} as jest.Mocked<SharedSubscriptionInvitationRepositoryInterface>
    sharedSubscriptionInvitationRepository.save = jest.fn()

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.save = jest.fn()

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.addUserRoleBasedOnSubscription = jest.fn()

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
  })

  it('should renew shared subscriptions', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      inviterEmail: 'inviter@test.te',
      newSubscriptionId: 123,
      newSubscriptionName: 'test',
      newSubscriptionExpiresAt: 123,
      timestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(sharedSubscriptionInvitationRepository.save).toBeCalledTimes(1)
    expect(userSubscriptionRepository.save).toBeCalledTimes(1)
  })

  it('should log error if user not found by email', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      inviterEmail: 'inviter@test.te',
      newSubscriptionId: 123,
      newSubscriptionName: 'test',
      newSubscriptionExpiresAt: 123,
      timestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(logger.error).toBeCalledTimes(1)
  })

  it('should log error if user not found by uuid', async () => {
    sharedSubscriptionInvitation.inviteeIdentifierType = InviteeIdentifierType.Uuid
    sharedSubscriptionInvitation.inviteeIdentifier = '00000000-0000-0000-0000-000000000000'
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      inviterEmail: 'inviter@test.te',
      newSubscriptionId: 123,
      newSubscriptionName: 'test',
      newSubscriptionExpiresAt: 123,
      timestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(logger.error).toBeCalledTimes(1)
  })

  it('should log error if user not found by unknown identifier type', async () => {
    sharedSubscriptionInvitation.inviteeIdentifierType = 'unknown' as InviteeIdentifierType

    const useCase = createUseCase()

    const result = await useCase.execute({
      inviterEmail: 'inviter@test.te',
      newSubscriptionId: 123,
      newSubscriptionName: 'test',
      newSubscriptionExpiresAt: 123,
      timestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(logger.error).toBeCalledTimes(1)
  })

  it('should log error if error occurs', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockImplementation(() => {
      throw new Error('test')
    })

    const useCase = createUseCase()

    const result = await useCase.execute({
      inviterEmail: 'inviter@test.te',
      newSubscriptionId: 123,
      newSubscriptionName: 'test',
      newSubscriptionExpiresAt: 123,
      timestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(logger.error).toBeCalledTimes(1)
  })

  it('should log error if username is invalid', async () => {
    sharedSubscriptionInvitation.inviteeIdentifierType = InviteeIdentifierType.Email
    sharedSubscriptionInvitation.inviteeIdentifier = ''

    const useCase = createUseCase()

    const result = await useCase.execute({
      inviterEmail: 'inviter@test.te',
      newSubscriptionId: 123,
      newSubscriptionName: 'test',
      newSubscriptionExpiresAt: 123,
      timestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(logger.error).toBeCalledTimes(1)
  })

  it('should log error if uuid is invalid', async () => {
    sharedSubscriptionInvitation.inviteeIdentifierType = InviteeIdentifierType.Uuid
    sharedSubscriptionInvitation.inviteeIdentifier = 'invalid'

    const useCase = createUseCase()

    const result = await useCase.execute({
      inviterEmail: 'inviter@test.te',
      newSubscriptionId: 123,
      newSubscriptionName: 'test',
      newSubscriptionExpiresAt: 123,
      timestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(logger.error).toBeCalledTimes(1)
  })

  it('should renew shared subscription for invitations by user uuid', async () => {
    sharedSubscriptionInvitation.inviteeIdentifierType = InviteeIdentifierType.Uuid
    sharedSubscriptionInvitation.inviteeIdentifier = '00000000-0000-0000-0000-000000000000'

    const useCase = createUseCase()

    const result = await useCase.execute({
      inviterEmail: 'inviter@test.te',
      newSubscriptionId: 123,
      newSubscriptionName: 'test',
      newSubscriptionExpiresAt: 123,
      timestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(sharedSubscriptionInvitationRepository.save).toBeCalledTimes(1)
    expect(userSubscriptionRepository.save).toBeCalledTimes(1)
  })
})
