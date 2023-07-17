import { TimerInterface } from '@standardnotes/time'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'
import { InviteUserToSharedVault } from './InviteUserToSharedVault'
import { SharedVault } from '../../../SharedVault/SharedVault'
import { SharedVaultInvite } from '../../../SharedVault/User/Invite/SharedVaultInvite'
import { Uuid, Timestamps, Result } from '@standardnotes/domain-core'
import { SharedVaultUserPermission } from '../../../SharedVault/User/SharedVaultUserPermission'

describe('InviteUserToSharedVault', () => {
  let sharedVaultRepository: SharedVaultRepositoryInterface
  let sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface
  let timer: TimerInterface
  let sharedVault: SharedVault

  const createUseCase = () => new InviteUserToSharedVault(sharedVaultRepository, sharedVaultInviteRepository, timer)

  beforeEach(() => {
    sharedVault = SharedVault.create({
      fileUploadBytesLimit: 100,
      fileUploadBytesUsed: 2,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
      sharedVaultItems: [],
    }).getValue()
    sharedVaultRepository = {} as jest.Mocked<SharedVaultRepositoryInterface>
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(sharedVault)

    sharedVaultInviteRepository = {} as jest.Mocked<SharedVaultInviteRepositoryInterface>
    sharedVaultInviteRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(null)
    sharedVaultInviteRepository.save = jest.fn()
    sharedVaultInviteRepository.remove = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)
  })

  it('should return a failure result if the shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: 'invalid',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      permission: SharedVaultUserPermission.PERMISSIONS.Read,
      encryptedMessage: 'encryptedMessage',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })

  it('should return a failure result if the shared vault does not exist', async () => {
    const useCase = createUseCase()
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(undefined)

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      permission: SharedVaultUserPermission.PERMISSIONS.Read,
      encryptedMessage: 'encryptedMessage',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Attempting to invite a user to a non-existent shared vault')
  })

  it('should return a failure result if the sender uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: 'invalid',
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      permission: SharedVaultUserPermission.PERMISSIONS.Read,
      encryptedMessage: 'encryptedMessage',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })

  it('should return a failure result if the recipient uuid is invalid', async () => {
    const useCase = createUseCase()
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(sharedVault)

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      recipientUuid: 'invalid',
      permission: SharedVaultUserPermission.PERMISSIONS.Read,
      encryptedMessage: 'encryptedMessage',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })

  it('should remove an already existing invite', async () => {
    const useCase = createUseCase()
    sharedVaultInviteRepository.findByUserUuidAndSharedVaultUuid = jest
      .fn()
      .mockResolvedValue({} as jest.Mocked<SharedVaultInvite>)

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      permission: SharedVaultUserPermission.PERMISSIONS.Read,
      encryptedMessage: 'encryptedMessage',
    })

    expect(result.isFailed()).toBe(false)
    expect(sharedVaultInviteRepository.remove).toHaveBeenCalled()
  })

  it('should create a shared vault invite', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      permission: SharedVaultUserPermission.PERMISSIONS.Read,
      encryptedMessage: 'encryptedMessage',
    })

    expect(result.isFailed()).toBe(false)
    expect(result.getValue().props.sharedVaultUuid.value).toBe('00000000-0000-0000-0000-000000000000')
  })

  it('should return a failure if the permission is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      permission: 'invalid',
      encryptedMessage: 'encryptedMessage',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid shared vault user permission invalid')
  })

  it('should return a failure if the sender is not the owner of the shared vault', async () => {
    const useCase = createUseCase()

    sharedVault = SharedVault.create({
      fileUploadBytesLimit: 100,
      fileUploadBytesUsed: 2,
      userUuid: Uuid.create('10000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
      sharedVaultItems: [],
    }).getValue()
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(sharedVault)

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000001',
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      permission: SharedVaultUserPermission.PERMISSIONS.Read,
      encryptedMessage: 'encryptedMessage',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Only the owner of a shared vault can invite users to it')
  })

  it('should return a failure if the shared vault invite could not be created', async () => {
    const useCase = createUseCase()

    const mockSharedVaultInvite = jest.spyOn(SharedVaultInvite, 'create')
    mockSharedVaultInvite.mockImplementation(() => {
      return Result.fail('Oops')
    })

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      permission: SharedVaultUserPermission.PERMISSIONS.Read,
      encryptedMessage: 'encryptedMessage',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Oops')

    mockSharedVaultInvite.mockRestore()
  })
})
