import { Result, SharedVaultUserPermission, Timestamps, Uuid } from '@standardnotes/domain-core'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'
import { CancelInviteToSharedVault } from '../CancelInviteToSharedVault/CancelInviteToSharedVault'
import { DeleteSharedVaultInvitesToUser } from './DeleteSharedVaultInvitesToUser'
import { SharedVaultInvite } from '../../../SharedVault/User/Invite/SharedVaultInvite'

describe('DeleteSharedVaultInvitesToUser', () => {
  let sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface
  let cancelInviteToSharedVault: CancelInviteToSharedVault
  let sharedVaultInvite: SharedVaultInvite

  const createUseCase = () => new DeleteSharedVaultInvitesToUser(sharedVaultInviteRepository, cancelInviteToSharedVault)

  beforeEach(() => {
    sharedVaultInvite = SharedVaultInvite.create({
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      senderUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      encryptedMessage: 'encrypted-message',
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    sharedVaultInviteRepository = {} as jest.Mocked<SharedVaultInviteRepositoryInterface>
    sharedVaultInviteRepository.findByUserUuid = jest.fn().mockReturnValue([sharedVaultInvite])

    cancelInviteToSharedVault = {} as jest.Mocked<CancelInviteToSharedVault>
    cancelInviteToSharedVault.execute = jest.fn().mockReturnValue(Result.ok())
  })

  it('should decline all invites to user', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(cancelInviteToSharedVault.execute).toHaveBeenCalled()
  })

  it('should return error when user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid-uuid',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error when cancelInviteToSharedVault fails', async () => {
    cancelInviteToSharedVault.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
