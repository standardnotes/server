import { Result, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'
import { SharedVault } from '../../../SharedVault/SharedVault'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { DeleteSharedVault } from '../DeleteSharedVault/DeleteSharedVault'
import { DeleteSharedVaults } from './DeleteSharedVaults'

describe('DeleteSharedVaults', () => {
  let sharedVaultRepository: SharedVaultRepositoryInterface
  let deleteSharedVaultUseCase: DeleteSharedVault
  let sharedVault: SharedVault

  const createUseCase = () => new DeleteSharedVaults(sharedVaultRepository, deleteSharedVaultUseCase)

  beforeEach(() => {
    sharedVault = SharedVault.create(
      {
        fileUploadBytesUsed: 2,
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()
    sharedVaultRepository = {} as jest.Mocked<SharedVaultRepositoryInterface>
    sharedVaultRepository.findByUserUuid = jest.fn().mockResolvedValue([sharedVault])

    deleteSharedVaultUseCase = {} as jest.Mocked<DeleteSharedVault>
    deleteSharedVaultUseCase.execute = jest.fn().mockResolvedValue(Result.ok({ status: 'deleted' }))
  })

  it('should delete all shared vaults for a user', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      ownerUuid: '00000000-0000-0000-0000-000000000000',
      allowSurviving: true,
    })

    expect(result.isFailed()).toBe(false)
    expect(sharedVaultRepository.findByUserUuid).toHaveBeenCalled()
    expect(deleteSharedVaultUseCase.execute).toHaveBeenCalledWith({
      originatorUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      allowSurviving: true,
    })
  })

  it('should return error if delete shared vault fails', async () => {
    deleteSharedVaultUseCase.execute = jest.fn().mockResolvedValue(Result.fail('error'))
    const useCase = createUseCase()

    const result = await useCase.execute({
      ownerUuid: '00000000-0000-0000-0000-000000000000',
      allowSurviving: true,
    })

    expect(result.isFailed()).toBe(true)
    expect(sharedVaultRepository.findByUserUuid).toHaveBeenCalled()
    expect(deleteSharedVaultUseCase.execute).toHaveBeenCalledWith({
      originatorUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      allowSurviving: true,
    })
  })

  it('should return error if owner uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      ownerUuid: 'invalid',
      allowSurviving: true,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(sharedVaultRepository.findByUserUuid).not.toHaveBeenCalled()
    expect(deleteSharedVaultUseCase.execute).not.toHaveBeenCalled()
  })
})
