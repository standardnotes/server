import { TimerInterface } from '@standardnotes/time'
import { Result, SharedVaultUser, SharedVaultUserPermission, Timestamps, Uuid } from '@standardnotes/domain-core'

import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { TransferSharedVault } from './TransferSharedVault'
import { SharedVault } from '../../../SharedVault/SharedVault'
import { TransferSharedVaultItems } from '../TransferSharedVaultItems/TransferSharedVaultItems'

describe('TransferSharedVault', () => {
  let sharedVault: SharedVault
  let sharedVaultUser: SharedVaultUser
  let sharedVaultRepository: SharedVaultRepositoryInterface
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  let timer: TimerInterface
  let transferSharedVaultItems: TransferSharedVaultItems

  const createUseCase = () =>
    new TransferSharedVault(sharedVaultRepository, sharedVaultUserRepository, transferSharedVaultItems, timer)

  beforeEach(() => {
    sharedVault = SharedVault.create({
      fileUploadBytesUsed: 2,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    sharedVaultUser = SharedVaultUser.create({
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
      isDesignatedSurvivor: false,
    }).getValue()

    sharedVaultRepository = {} as jest.Mocked<SharedVaultRepositoryInterface>
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(sharedVault)
    sharedVaultRepository.save = jest.fn()

    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)
    sharedVaultUserRepository.save = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)

    transferSharedVaultItems = {} as jest.Mocked<TransferSharedVaultItems>
    transferSharedVaultItems.execute = jest.fn().mockResolvedValue(Result.ok())
  })

  it('should transfer shared vault to another user', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUid: '00000000-0000-0000-0000-000000000000',
      fromUserUuid: '00000000-0000-0000-0000-000000000000',
      toUserUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(false)
    expect(sharedVaultRepository.save).toHaveBeenCalled()
    expect(sharedVaultUserRepository.save).toHaveBeenCalled()
  })

  it('should fail if shared vault does not exist', async () => {
    const useCase = createUseCase()

    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(null)

    const result = await useCase.execute({
      sharedVaultUid: '00000000-0000-0000-0000-000000000000',
      fromUserUuid: '00000000-0000-0000-0000-000000000000',
      toUserUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(sharedVaultRepository.save).not.toHaveBeenCalled()
    expect(sharedVaultUserRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if shared vault does not belong to user', async () => {
    const useCase = createUseCase()

    sharedVault.props.userUuid = Uuid.create('00000000-0000-0000-0000-000000000001').getValue()

    const result = await useCase.execute({
      sharedVaultUid: '00000000-0000-0000-0000-000000000000',
      fromUserUuid: '00000000-0000-0000-0000-000000000000',
      toUserUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(sharedVaultRepository.save).not.toHaveBeenCalled()
    expect(sharedVaultUserRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if new owner is not a member of shared vault', async () => {
    const useCase = createUseCase()

    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(null)

    const result = await useCase.execute({
      sharedVaultUid: '00000000-0000-0000-0000-000000000000',
      fromUserUuid: '00000000-0000-0000-0000-000000000000',
      toUserUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(sharedVaultRepository.save).not.toHaveBeenCalled()
    expect(sharedVaultUserRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUid: 'invalid',
      fromUserUuid: '00000000-0000-0000-0000-000000000000',
      toUserUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(sharedVaultRepository.save).not.toHaveBeenCalled()
    expect(sharedVaultUserRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if from user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUid: '00000000-0000-0000-0000-000000000000',
      fromUserUuid: 'invalid',
      toUserUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(sharedVaultRepository.save).not.toHaveBeenCalled()
    expect(sharedVaultUserRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if to user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUid: '00000000-0000-0000-0000-000000000000',
      fromUserUuid: '00000000-0000-0000-0000-000000000000',
      toUserUuid: 'invalid',
    })

    expect(result.isFailed()).toBe(true)
    expect(sharedVaultRepository.save).not.toHaveBeenCalled()
    expect(sharedVaultUserRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if transfering items fails', async () => {
    const useCase = createUseCase()

    transferSharedVaultItems.execute = jest.fn().mockResolvedValue(Result.fail('error'))

    const result = await useCase.execute({
      sharedVaultUid: '00000000-0000-0000-0000-000000000000',
      fromUserUuid: '00000000-0000-0000-0000-000000000000',
      toUserUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(sharedVaultRepository.save).not.toHaveBeenCalled()
    expect(sharedVaultUserRepository.save).not.toHaveBeenCalled()
  })
})
