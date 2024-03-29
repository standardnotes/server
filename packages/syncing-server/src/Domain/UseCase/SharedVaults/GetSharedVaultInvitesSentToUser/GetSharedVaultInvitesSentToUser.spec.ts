import { Uuid, Timestamps, SharedVaultUserPermission } from '@standardnotes/domain-core'

import { SharedVaultInvite } from '../../../SharedVault/User/Invite/SharedVaultInvite'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'
import { GetSharedVaultInvitesSentToUser } from './GetSharedVaultInvitesSentToUser'

describe('GetSharedVaultInvitesSentToUser', () => {
  let sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface
  let invite: SharedVaultInvite

  const createUseCase = () => new GetSharedVaultInvitesSentToUser(sharedVaultInviteRepository)

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
    sharedVaultInviteRepository.findByUserUuid = jest.fn().mockResolvedValue([invite])
    sharedVaultInviteRepository.findByUserUuidUpdatedAfter = jest.fn().mockResolvedValue([invite])
  })

  it('should return invites sent to user', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.getValue()).toEqual([invite])
  })

  it('should return invites sent to user updated after given time', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      lastSyncTime: 123,
    })

    expect(result.getValue()).toEqual([invite])
  })

  it('should return empty array if no invites found', async () => {
    const useCase = createUseCase()

    sharedVaultInviteRepository.findByUserUuid = jest.fn().mockReturnValue([])

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.getValue()).toEqual([])
  })

  it('should fail if sender uuid is not valid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid-uuid',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
