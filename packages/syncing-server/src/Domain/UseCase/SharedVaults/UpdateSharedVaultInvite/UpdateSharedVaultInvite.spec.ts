import { TimerInterface } from '@standardnotes/time'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'
import { UpdateSharedVaultInvite } from './UpdateSharedVaultInvite'
import { SharedVaultInvite } from '../../../SharedVault/User/Invite/SharedVaultInvite'
import { Timestamps, Uuid } from '@standardnotes/domain-core'
import { SharedVaultUserPermission } from '../../../SharedVault/User/SharedVaultUserPermission'

describe('UpdateSharedVaultInvite', () => {
  let sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface
  let timer: TimerInterface
  let invite: SharedVaultInvite

  const createUseCase = () => new UpdateSharedVaultInvite(sharedVaultInviteRepository, timer)

  beforeEach(() => {
    invite = SharedVaultInvite.create({
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      senderUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      encryptedMessage: 'encrypted message',
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    sharedVaultInviteRepository = {} as jest.Mocked<SharedVaultInviteRepositoryInterface>
    sharedVaultInviteRepository.findByUuid = jest.fn().mockResolvedValue(invite)
    sharedVaultInviteRepository.save = jest.fn().mockResolvedValue(null)

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)
  })

  it('should update the invite', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      encryptedMessage: 'new encrypted message',
    })

    expect(result.isFailed()).toBe(false)
    expect(sharedVaultInviteRepository.save).toHaveBeenCalled()
  })

  it('should update the invite with new permission', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      encryptedMessage: 'new encrypted message',
      permission: SharedVaultUserPermission.PERMISSIONS.Write,
    })

    expect(result.isFailed()).toBe(false)
    expect(sharedVaultInviteRepository.save).toHaveBeenCalled()
  })

  it('should fail if invite is not found', async () => {
    sharedVaultInviteRepository.findByUuid = jest.fn().mockResolvedValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      encryptedMessage: 'new encrypted message',
    })

    expect(result.isFailed()).toBe(true)
    expect(sharedVaultInviteRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if sender is not the same as the invite sender', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000001',
      encryptedMessage: 'new encrypted message',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Only the sender can update the invite')
    expect(sharedVaultInviteRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if the invite uuid is not valid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: 'invalid-uuid',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      encryptedMessage: 'new encrypted message',
    })

    expect(result.isFailed()).toBe(true)
    expect(sharedVaultInviteRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if the sender uuid is not valid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: 'invalid-uuid',
      encryptedMessage: 'new encrypted message',
    })

    expect(result.isFailed()).toBe(true)
    expect(sharedVaultInviteRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if the encrypted message is not valid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      encryptedMessage: '',
    })

    expect(result.isFailed()).toBe(true)
    expect(sharedVaultInviteRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if the permission is not valid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      encryptedMessage: 'new encrypted message',
      permission: 'invalid-permission',
    })

    expect(result.isFailed()).toBe(true)
    expect(sharedVaultInviteRepository.save).not.toHaveBeenCalled()
  })
})
