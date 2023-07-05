import { DomainEventPublisherInterface, NotificationRequestedEvent } from '@standardnotes/domain-events'
import { Uuid, Timestamps } from '@standardnotes/domain-core'

import { SharedVaultRepositoryInterface } from '../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultInviteRepositoryInterface } from '../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { DeleteSharedVault } from './DeleteSharedVault'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { SharedVault } from '../../SharedVault/SharedVault'
import { SharedVaultUser } from '../../SharedVault/User/SharedVaultUser'
import { SharedVaultUserPermission } from '../../SharedVault/User/SharedVaultUserPermission'

describe('DeleteSharedVault', () => {
  let sharedVaultRepository: SharedVaultRepositoryInterface
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  let sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let sharedVault: SharedVault
  let sharedVaultUser: SharedVaultUser

  const createUseCase = () =>
    new DeleteSharedVault(
      sharedVaultRepository,
      sharedVaultUserRepository,
      sharedVaultInviteRepository,
      domainEventPublisher,
      domainEventFactory,
    )

  beforeEach(() => {
    sharedVault = SharedVault.create({
      fileUploadBytesLimit: 100,
      fileUploadBytesUsed: 2,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    sharedVaultRepository = {} as jest.Mocked<SharedVaultRepositoryInterface>
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(sharedVault)
    sharedVaultRepository.remove = jest.fn()

    sharedVaultUser = SharedVaultUser.create({
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.findBySharedVaultUuid = jest.fn().mockResolvedValue([sharedVaultUser])
    sharedVaultUserRepository.removeBySharedVaultUuid = jest.fn()

    sharedVaultInviteRepository = {} as jest.Mocked<SharedVaultInviteRepositoryInterface>
    sharedVaultInviteRepository.removeBySharedVaultUuid = jest.fn()

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createNotificationRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<NotificationRequestedEvent>)
  })

  it('should remove shared vault', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(sharedVaultRepository.remove).toHaveBeenCalled()
    expect(sharedVaultUserRepository.removeBySharedVaultUuid).toHaveBeenCalled()
    expect(sharedVaultInviteRepository.removeBySharedVaultUuid).toHaveBeenCalled()
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should return error when shared vault does not exist', async () => {
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(null)
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(sharedVaultRepository.remove).not.toHaveBeenCalled()
    expect(sharedVaultUserRepository.removeBySharedVaultUuid).not.toHaveBeenCalled()
    expect(sharedVaultInviteRepository.removeBySharedVaultUuid).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should return error when shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: 'invalid',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(sharedVaultRepository.remove).not.toHaveBeenCalled()
    expect(sharedVaultUserRepository.removeBySharedVaultUuid).not.toHaveBeenCalled()
    expect(sharedVaultInviteRepository.removeBySharedVaultUuid).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should return error when originator uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: 'invalid',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(sharedVaultRepository.remove).not.toHaveBeenCalled()
    expect(sharedVaultUserRepository.removeBySharedVaultUuid).not.toHaveBeenCalled()
    expect(sharedVaultInviteRepository.removeBySharedVaultUuid).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should return error when originator of the delete request is not the owner of the shared vault', async () => {
    sharedVault = SharedVault.create({
      fileUploadBytesLimit: 100,
      fileUploadBytesUsed: 2,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000001').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(sharedVault)
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(sharedVaultRepository.remove).not.toHaveBeenCalled()
    expect(sharedVaultUserRepository.removeBySharedVaultUuid).not.toHaveBeenCalled()
    expect(sharedVaultInviteRepository.removeBySharedVaultUuid).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })
})
