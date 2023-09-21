import { SharedVaultUser, SharedVaultUserPermission, Timestamps, Uuid } from '@standardnotes/domain-core'

import { DesignateSurvivor } from './DesignateSurvivor'
import { TimerInterface } from '@standardnotes/time'
import { SharedVaultUserRepositoryInterface } from '../../SharedVault/SharedVaultUserRepositoryInterface'

describe('DesignateSurvivor', () => {
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  let sharedVaultUser: SharedVaultUser
  let timer: TimerInterface

  const createUseCase = () => new DesignateSurvivor(sharedVaultUserRepository, timer)

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)

    sharedVaultUser = SharedVaultUser.create({
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
      isDesignatedSurvivor: false,
    }).getValue()

    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.findDesignatedSurvivorBySharedVaultUuid = jest.fn().mockReturnValue(null)
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockReturnValue(sharedVaultUser)
    sharedVaultUserRepository.save = jest.fn()
  })

  it('should fail if shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: 'invalid',
      userUuid: '00000000-0000-0000-0000-000000000000',
      timestamp: 123,
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should fail if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: 'invalid',
      timestamp: 123,
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should fail if shared vault user is not found', async () => {
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockReturnValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
      timestamp: 123,
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should designate a survivor if the user is a member', async () => {
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockReturnValue(sharedVaultUser)

    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
      timestamp: 123,
    })

    expect(result.isFailed()).toBe(false)
    expect(sharedVaultUser.props.isDesignatedSurvivor).toBe(true)
    expect(sharedVaultUserRepository.save).toBeCalledTimes(1)
  })

  it('should designate a survivor if the user is a member and there is already a survivor', async () => {
    sharedVaultUserRepository.findDesignatedSurvivorBySharedVaultUuid = jest.fn().mockReturnValue(
      SharedVaultUser.create({
        permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000001').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
        isDesignatedSurvivor: true,
      }).getValue(),
    )
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockReturnValue(sharedVaultUser)

    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
      timestamp: 123,
    })

    expect(result.isFailed()).toBe(false)
    expect(sharedVaultUser.props.isDesignatedSurvivor).toBe(true)
    expect(sharedVaultUserRepository.save).toBeCalledTimes(2)
  })

  it('should fail if the timestamp is older than the existing survivor', async () => {
    sharedVaultUserRepository.findDesignatedSurvivorBySharedVaultUuid = jest.fn().mockReturnValue(
      SharedVaultUser.create({
        permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000001').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
        isDesignatedSurvivor: true,
      }).getValue(),
    )
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockReturnValue(sharedVaultUser)

    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
      timestamp: 122,
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should do nothing if the user is already a survivor', async () => {
    sharedVaultUserRepository.findDesignatedSurvivorBySharedVaultUuid = jest.fn().mockReturnValue(
      SharedVaultUser.create({
        permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
        isDesignatedSurvivor: true,
      }).getValue(),
    )
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockReturnValue(sharedVaultUser)

    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
      timestamp: 200,
    })

    expect(result.isFailed()).toBe(false)
  })
})
