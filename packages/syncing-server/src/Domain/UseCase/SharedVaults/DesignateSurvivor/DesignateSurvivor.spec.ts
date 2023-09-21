import { SharedVaultUser, SharedVaultUserPermission, Timestamps, Uuid } from '@standardnotes/domain-core'

import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { DesignateSurvivor } from './DesignateSurvivor'
import { TimerInterface } from '@standardnotes/time'
import { DomainEventInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'

describe('DesignateSurvivor', () => {
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  let sharedVaultUser: SharedVaultUser
  let sharedVaultOwner: SharedVaultUser
  let timer: TimerInterface
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface

  const createUseCase = () =>
    new DesignateSurvivor(sharedVaultUserRepository, timer, domainEventFactory, domainEventPublisher)

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)

    sharedVaultOwner = SharedVaultUser.create({
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Admin).getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000002').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
      isDesignatedSurvivor: false,
    }).getValue()

    sharedVaultUser = SharedVaultUser.create({
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
      isDesignatedSurvivor: false,
    }).getValue()

    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.findBySharedVaultUuid = jest.fn().mockReturnValue([])
    sharedVaultUserRepository.save = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createUserDesignatedAsSurvivorInSharedVaultEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<DomainEventInterface>)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()
  })

  it('should fail if shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: 'invalid',
      userUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000002',
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should fail if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: 'invalid',
      originatorUuid: '00000000-0000-0000-0000-000000000002',
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should fail if originator uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: 'invalid',
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should fail if shared vault user is not found', async () => {
    sharedVaultUserRepository.findBySharedVaultUuid = jest.fn().mockReturnValue([sharedVaultOwner])

    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000002',
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should fail if the originator is not the admin of the shared vault', async () => {
    sharedVaultUserRepository.findBySharedVaultUuid = jest.fn().mockReturnValue([sharedVaultOwner, sharedVaultUser])

    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000003',
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should designate a survivor if the user is a member', async () => {
    sharedVaultUserRepository.findBySharedVaultUuid = jest.fn().mockReturnValue([sharedVaultOwner, sharedVaultUser])

    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000002',
    })

    expect(result.isFailed()).toBe(false)
    expect(sharedVaultUser.props.isDesignatedSurvivor).toBe(true)
    expect(sharedVaultUserRepository.save).toBeCalledTimes(1)
  })

  it('should designate a survivor if the user is a member and there is already a survivor', async () => {
    sharedVaultUserRepository.findBySharedVaultUuid = jest.fn().mockReturnValue([
      sharedVaultOwner,
      sharedVaultUser,
      SharedVaultUser.create({
        permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000001').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
        isDesignatedSurvivor: true,
      }).getValue(),
    ])

    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000002',
    })

    expect(result.isFailed()).toBe(false)
    expect(sharedVaultUser.props.isDesignatedSurvivor).toBe(true)
    expect(sharedVaultUserRepository.save).toBeCalledTimes(2)
  })
})
