import { Uuid, Timestamps, SharedVaultUserPermission } from '@standardnotes/domain-core'

import { SharedVaultInvite } from '../../../SharedVault/User/Invite/SharedVaultInvite'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'
import { GetSharedVaultInvitesSentByUser } from './GetSharedVaultInvitesSentByUser'

describe('GetSharedVaultInvitesSentByUser', () => {
  let sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface
  let invite: SharedVaultInvite

  const createUseCase = () => new GetSharedVaultInvitesSentByUser(sharedVaultInviteRepository)

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
    sharedVaultInviteRepository.findBySenderUuid = jest.fn().mockResolvedValue([invite])
  })

  it('should return invites sent by user', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      senderUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.getValue()).toEqual([invite])
  })

  it('should return empty array if no invites found', async () => {
    const useCase = createUseCase()

    sharedVaultInviteRepository.findBySenderUuid = jest.fn().mockResolvedValue([])

    const result = await useCase.execute({
      senderUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.getValue()).toEqual([])
  })

  it('should fail if sender uuid is not valid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      senderUuid: 'invalid-uuid',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return invites sent by user for specific shared vault', async () => {
    const useCase = createUseCase()

    sharedVaultInviteRepository.findBySenderUuidAndSharedVaultUuid = jest.fn().mockResolvedValue([invite])

    const result = await useCase.execute({
      senderUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.getValue()).toEqual([invite])
  })

  it('should fail if shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      senderUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: 'invalid-uuid',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
