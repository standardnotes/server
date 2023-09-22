import { SharedVaultUser, SharedVaultUserPermission, Timestamps, Uuid } from '@standardnotes/domain-core'

import { SharedVault } from '../../../SharedVault/SharedVault'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { GetSharedVaults } from './GetSharedVaults'

describe('GetSharedVaults', () => {
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  let sharedVaultRepository: SharedVaultRepositoryInterface
  let sharedVault: SharedVault
  let sharedVaultUser: SharedVaultUser

  const createUseCase = () => new GetSharedVaults(sharedVaultUserRepository, sharedVaultRepository)

  beforeEach(() => {
    sharedVaultUser = SharedVaultUser.create({
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Admin).getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
      isDesignatedSurvivor: false,
    }).getValue()
    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.findByUserUuid = jest.fn().mockResolvedValue([sharedVaultUser])

    sharedVault = SharedVault.create({
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
      fileUploadBytesUsed: 123,
    }).getValue()
    sharedVaultRepository = {} as jest.Mocked<SharedVaultRepositoryInterface>
    sharedVaultRepository.findByUuids = jest.fn().mockResolvedValue([sharedVault])
  })

  it('returns shared vaults', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.getValue().sharedVaults).toEqual([sharedVault])
  })

  it('returns empty array if no shared vaults found', async () => {
    sharedVaultUserRepository.findByUserUuid = jest.fn().mockResolvedValue([])

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.getValue().sharedVaults).toEqual([])
  })

  it('returns error if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fetch designated survivors if includeDesignatedSurvivors is true', async () => {
    sharedVaultUserRepository.findDesignatedSurvivorBySharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      includeDesignatedSurvivors: true,
    })

    expect(result.getValue().designatedSurvivors).toEqual([sharedVaultUser])
  })
})
