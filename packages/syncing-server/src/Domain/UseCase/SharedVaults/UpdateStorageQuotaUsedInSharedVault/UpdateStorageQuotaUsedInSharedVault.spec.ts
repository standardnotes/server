import { Timestamps, Uuid } from '@standardnotes/domain-core'
import { SharedVault } from '../../../SharedVault/SharedVault'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { UpdateStorageQuotaUsedInSharedVault } from './UpdateStorageQuotaUsedInSharedVault'

describe('UpdateStorageQuotaUsedInSharedVault', () => {
  let sharedVaultRepository: SharedVaultRepositoryInterface
  let sharedVault: SharedVault

  const createUseCase = () => new UpdateStorageQuotaUsedInSharedVault(sharedVaultRepository)

  beforeEach(() => {
    sharedVault = SharedVault.create({
      fileUploadBytesUsed: 2,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    sharedVaultRepository = {} as jest.Mocked<SharedVaultRepositoryInterface>
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(sharedVault)
    sharedVaultRepository.save = jest.fn()
  })

  it('should update storage quota used in shared vault', async () => {
    const useCase = createUseCase()

    await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      bytesUsed: 10,
    })

    expect(sharedVaultRepository.save).toBeCalledWith(sharedVault)
    expect(sharedVault.props.fileUploadBytesUsed).toEqual(12)
  })

  it('should return error when shared vault is not found', async () => {
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      bytesUsed: 10,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Shared vault not found for UUID 00000000-0000-0000-0000-000000000000')
  })

  it('should return error when shared vault UUID is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: 'invalid-uuid',
      bytesUsed: 10,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Given value is not a valid uuid: invalid-uuid')
  })

  it('should update storage quota with a negative value', async () => {
    const useCase = createUseCase()

    await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      bytesUsed: -1,
    })

    expect(sharedVaultRepository.save).toBeCalledWith(sharedVault)
    expect(sharedVault.props.fileUploadBytesUsed).toEqual(1)
  })
})
