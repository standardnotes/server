import { NotificationPayload, Result, SharedVaultUserPermission, Timestamps, Uuid } from '@standardnotes/domain-core'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'
import { CancelInviteToSharedVault } from './CancelInviteToSharedVault'
import { SharedVaultInvite } from '../../../SharedVault/User/Invite/SharedVaultInvite'
import { AddNotificationForUser } from '../../Messaging/AddNotificationForUser/AddNotificationForUser'

describe('CancelInviteToSharedVault', () => {
  let sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface
  let invite: SharedVaultInvite
  let addNotificationForUser: AddNotificationForUser

  const createUseCase = () => new CancelInviteToSharedVault(sharedVaultInviteRepository, addNotificationForUser)

  beforeEach(() => {
    invite = SharedVaultInvite.create({
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      senderUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      encryptedMessage: 'encrypted-message',
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    sharedVaultInviteRepository = {} as jest.Mocked<SharedVaultInviteRepositoryInterface>
    sharedVaultInviteRepository.findByUuid = jest.fn().mockResolvedValue(invite)
    sharedVaultInviteRepository.remove = jest.fn()

    addNotificationForUser = {} as jest.Mocked<AddNotificationForUser>
    addNotificationForUser.execute = jest.fn().mockReturnValue(Result.ok())
  })

  it('should fail if invite uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: 'invalid',
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })

  it('should fail if adding a notification for user fails', async () => {
    addNotificationForUser.execute = jest.fn().mockReturnValue(Result.fail('Error'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Error')
  })

  it('should return error if notification payload could not be created', async () => {
    const mock = jest.spyOn(NotificationPayload, 'create')
    mock.mockReturnValue(Result.fail('Oops'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Oops')

    mock.mockRestore()
  })

  it('should fail if originator uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: 'invalid',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })

  it('should fail if invite is not found', async () => {
    sharedVaultInviteRepository.findByUuid = jest.fn().mockResolvedValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invite not found')
  })

  it('should fail if originator is not the recipient of the invite', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000001',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Only the recipient or the sender can decline the invite')
  })

  it('should delete invite', async () => {
    const useCase = createUseCase()

    await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(sharedVaultInviteRepository.remove).toHaveBeenCalled()
  })
})
