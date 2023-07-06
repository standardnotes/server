import { Uuid, Timestamps } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface, NotificationRequestedEvent } from '@standardnotes/domain-events'

import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { SharedVault } from '../../SharedVault/SharedVault'
import { SharedVaultRepositoryInterface } from '../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultUser } from '../../SharedVault/User/SharedVaultUser'
import { SharedVaultUserPermission } from '../../SharedVault/User/SharedVaultUserPermission'
import { SharedVaultUserRepositoryInterface } from '../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { RemoveUserFromSharedVault } from './RemoveUserFromSharedVault'

describe('RemoveUserFromSharedVault', () => {
  let sharedVaultRepository: SharedVaultRepositoryInterface
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let sharedVault: SharedVault
  let sharedVaultUser: SharedVaultUser

  const createUseCase = () =>
    new RemoveUserFromSharedVault(
      sharedVaultUserRepository,
      sharedVaultRepository,
      domainEventFactory,
      domainEventPublisher,
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
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)
    sharedVaultUserRepository.remove = jest.fn()

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createNotificationRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<NotificationRequestedEvent>)
  })

  it('should remove user from shared vault', async () => {
    const useCase = createUseCase()
    await useCase.execute({
      originatorUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000001',
    })

    expect(sharedVaultUserRepository.remove).toHaveBeenCalledWith(sharedVaultUser)
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should return error when shared vault is not found', async () => {
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(null)

    const useCase = createUseCase()
    const result = await useCase.execute({
      originatorUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000001',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Shared vault not found')
  })

  it('should return error when shared vault user is not found', async () => {
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(null)

    const useCase = createUseCase()
    const result = await useCase.execute({
      originatorUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000001',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('User is not a member of the shared vault')
  })

  it('should return error when user is not owner of shared vault', async () => {
    sharedVault = SharedVault.create({
      fileUploadBytesLimit: 100,
      fileUploadBytesUsed: 2,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000002').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(sharedVault)

    const useCase = createUseCase()
    const result = await useCase.execute({
      originatorUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000001',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Only owner can remove users from shared vault')
  })

  it('should return error when user is owner of shared vault', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      originatorUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Owner cannot be removed from shared vault')
  })

  it('should return error if shared vault uuid is invalid', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      originatorUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: 'invalid',
      userUuid: '00000000-0000-0000-0000-000000000001',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })

  it('should return error if user uuid is invalid', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      originatorUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: 'invalid',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })

  it('should return error if originator uuid is invalid', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      originatorUuid: 'invalid',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000001',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })
})
