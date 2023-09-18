import { TimerInterface } from '@standardnotes/time'
import { NotificationPayload, Result, SharedVaultUser } from '@standardnotes/domain-core'
import { DomainEventInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { AddUserToSharedVault } from './AddUserToSharedVault'
import { SharedVault } from '../../../SharedVault/SharedVault'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { AddNotificationsForUsers } from '../../Messaging/AddNotificationsForUsers/AddNotificationsForUsers'

describe('AddUserToSharedVault', () => {
  let sharedVaultRepository: SharedVaultRepositoryInterface
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  let timer: TimerInterface
  let sharedVault: SharedVault
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let addNotificationsForUsers: AddNotificationsForUsers

  const validUuid = '00000000-0000-0000-0000-000000000000'

  const createUseCase = () =>
    new AddUserToSharedVault(
      sharedVaultRepository,
      sharedVaultUserRepository,
      timer,
      domainEventFactory,
      domainEventPublisher,
      addNotificationsForUsers,
    )

  beforeEach(() => {
    sharedVault = {} as jest.Mocked<SharedVault>

    sharedVaultRepository = {} as jest.Mocked<SharedVaultRepositoryInterface>
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(sharedVault)

    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.save = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123456789)

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createUserAddedToSharedVaultEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<DomainEventInterface>)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    addNotificationsForUsers = {} as jest.Mocked<AddNotificationsForUsers>
    addNotificationsForUsers.execute = jest.fn().mockReturnValue(Result.ok())
  })

  it('should return a failure result if the shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: 'invalid-uuid',
      userUuid: validUuid,
      permission: 'read',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid-uuid')
  })

  it('should return a failure result if the user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: validUuid,
      userUuid: 'invalid-uuid',
      permission: 'read',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid-uuid')
  })

  it('should return a failure result if the permission is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: validUuid,
      userUuid: validUuid,
      permission: 'test',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid shared vault user permission test')
  })

  it('should return a failure result if the shared vault does not exist', async () => {
    const useCase = createUseCase()

    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValueOnce(null)

    const result = await useCase.execute({
      sharedVaultUuid: validUuid,
      userUuid: validUuid,
      permission: 'read',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Attempting to add a shared vault user to a non-existent shared vault')
  })

  it('should return a failure result if creating the shared vault user fails', async () => {
    const useCase = createUseCase()

    const mockSharedVaultUser = jest.spyOn(SharedVaultUser, 'create')
    mockSharedVaultUser.mockImplementation(() => {
      return Result.fail('Oops')
    })

    const result = await useCase.execute({
      sharedVaultUuid: validUuid,
      userUuid: validUuid,
      permission: 'read',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Oops')

    mockSharedVaultUser.mockRestore()
  })

  it('should return a failure if add notification for users fails', async () => {
    addNotificationsForUsers.execute = jest.fn().mockReturnValue(Result.fail('Oops'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: validUuid,
      userUuid: validUuid,
      permission: 'read',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Oops')
  })

  it('should return error if notification payload could not be created', async () => {
    const mock = jest.spyOn(NotificationPayload, 'create')
    mock.mockReturnValue(Result.fail('Oops'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: validUuid,
      userUuid: validUuid,
      permission: 'read',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Oops')

    mock.mockRestore()
  })

  it('should add a user to a shared vault', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: validUuid,
      userUuid: validUuid,
      permission: 'read',
    })

    expect(result.isFailed()).toBe(false)
    expect(sharedVaultUserRepository.save).toHaveBeenCalled()
  })

  it('should add a user to a shared vault and skip checking if shared vault exists to avoid race conditions', async () => {
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValueOnce(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: validUuid,
      userUuid: validUuid,
      permission: 'read',
      skipSharedVaultExistenceCheck: true,
    })

    expect(result.isFailed()).toBe(false)
    expect(sharedVaultUserRepository.save).toHaveBeenCalled()
  })
})
