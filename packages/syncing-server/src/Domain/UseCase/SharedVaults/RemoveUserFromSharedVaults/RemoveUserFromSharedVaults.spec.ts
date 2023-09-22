import { Result, SharedVaultUser, SharedVaultUserPermission, Timestamps, Uuid } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { RemoveUserFromSharedVault } from '../RemoveUserFromSharedVault/RemoveUserFromSharedVault'
import { RemoveUserFromSharedVaults } from './RemoveUserFromSharedVaults'

describe('RemoveUserFromSharedVaults', () => {
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  let sharedVaultUser: SharedVaultUser
  let removeUserFromSharedVault: RemoveUserFromSharedVault
  let logger: Logger

  const createUseCase = () =>
    new RemoveUserFromSharedVaults(sharedVaultUserRepository, removeUserFromSharedVault, logger)

  beforeEach(() => {
    sharedVaultUser = SharedVaultUser.create({
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
      isDesignatedSurvivor: false,
    }).getValue()

    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.findByUserUuid = jest.fn().mockResolvedValue([sharedVaultUser])

    removeUserFromSharedVault = {} as jest.Mocked<RemoveUserFromSharedVault>
    removeUserFromSharedVault.execute = jest.fn().mockResolvedValue(Result.ok())

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
  })

  it('should remove user from shared vaults', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(removeUserFromSharedVault.execute).toHaveBeenCalledTimes(1)
    expect(removeUserFromSharedVault.execute).toHaveBeenCalledWith({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
      userUuid: '00000000-0000-0000-0000-000000000000',
      forceRemoveOwner: true,
    })
  })

  it('should log error if removing user from shared vault fails', async () => {
    removeUserFromSharedVault.execute = jest.fn().mockResolvedValue(Result.fail('error'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to remove user: 00000000-0000-0000-0000-000000000000 from shared vault: 00000000-0000-0000-0000-000000000000: error',
    )
  })

  it('should fail if the user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(removeUserFromSharedVault.execute).not.toHaveBeenCalled()
  })
})
