import { Result, Timestamps, Uuid } from '@standardnotes/domain-core'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'
import { AddUserToSharedVault } from '../AddUserToSharedVault/AddUserToSharedVault'
import { AcceptInviteToSharedVault } from './AcceptInviteToSharedVault'
import { SharedVaultInvite } from '../../../SharedVault/User/Invite/SharedVaultInvite'
import { SharedVaultUserPermission } from '../../../SharedVault/User/SharedVaultUserPermission'

describe('AcceptInviteToSharedVault', () => {
  let addUserToSharedVault: AddUserToSharedVault
  let sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface
  let invite: SharedVaultInvite

  const createUseCase = () => new AcceptInviteToSharedVault(addUserToSharedVault, sharedVaultInviteRepository)

  beforeEach(() => {
    invite = SharedVaultInvite.create({
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      senderUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      encryptedMessage: 'encrypted-message',
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    addUserToSharedVault = {} as jest.Mocked<AddUserToSharedVault>
    addUserToSharedVault.execute = jest.fn().mockReturnValue(Result.ok())

    sharedVaultInviteRepository = {} as jest.Mocked<SharedVaultInviteRepositoryInterface>
    sharedVaultInviteRepository.findByUuid = jest.fn().mockResolvedValue(invite)
    sharedVaultInviteRepository.remove = jest.fn()
  })

  it('should fail if invite uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: 'invalid',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })

  it('should fail if originator uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: 'invalid',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })

  it('should fail if invite is not found', async () => {
    sharedVaultInviteRepository.findByUuid = jest.fn().mockResolvedValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invite not found')
  })

  it('should fail if originator is not the recipient of the invite', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000001',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Only the recipient of the invite can accept it')
  })

  it('should fail if adding user to shared vault fails', async () => {
    addUserToSharedVault.execute = jest.fn().mockReturnValue(Result.fail('Failed to add user to shared vault'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Failed to add user to shared vault')
  })

  it('should delete invite after adding user to shared vault', async () => {
    const useCase = createUseCase()

    await useCase.execute({
      inviteUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(sharedVaultInviteRepository.remove).toHaveBeenCalled()
  })
})
