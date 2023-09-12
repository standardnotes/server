import { Uuid, Timestamps, SharedVaultUserPermission, SharedVaultUser } from '@standardnotes/domain-core'

import { SharedVault } from '../../../SharedVault/SharedVault'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { GetSharedVaultUsers } from './GetSharedVaultUsers'

describe('GetSharedVaultUsers', () => {
  let sharedVault: SharedVault
  let sharedVaultUser: SharedVaultUser
  let sharedVaultUsersRepository: SharedVaultUserRepositoryInterface
  let sharedVaultRepository: SharedVaultRepositoryInterface

  const createUseCase = () => new GetSharedVaultUsers(sharedVaultUsersRepository, sharedVaultRepository)

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
    }).getValue()

    sharedVaultRepository = {} as jest.Mocked<SharedVaultRepositoryInterface>
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(sharedVault)

    sharedVaultUsersRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUsersRepository.findBySharedVaultUuid = jest.fn().mockResolvedValue([sharedVaultUser])
  })

  it('returns shared vault users', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(false)
    expect(result.getValue()).toEqual([sharedVaultUser])
  })

  it('returns error when shared vault is not found', async () => {
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(null)

    const useCase = createUseCase()
    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Shared vault not found')
  })

  it('returns error when originator is not a member of the shared vault', async () => {
    sharedVaultUsersRepository.findBySharedVaultUuid = jest.fn().mockResolvedValue([])

    const useCase = createUseCase()
    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Originator is not a member of the shared vault')
  })

  it('returns error when shared vault uuid is invalid', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      sharedVaultUuid: 'invalid',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })

  it('returns error when originator uuid is invalid', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: 'invalid',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })
})
