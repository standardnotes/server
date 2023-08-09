import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { UpdateStorageQuotaUsedInSharedVaultDTO } from './UpdateStorageQuotaUsedInSharedVaultDTO'

export class UpdateStorageQuotaUsedInSharedVault implements UseCaseInterface<void> {
  constructor(private sharedVaultRepository: SharedVaultRepositoryInterface) {}

  async execute(dto: UpdateStorageQuotaUsedInSharedVaultDTO): Promise<Result<void>> {
    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const sharedVault = await this.sharedVaultRepository.findByUuid(sharedVaultUuid)
    if (!sharedVault) {
      return Result.fail(`Shared vault not found for UUID ${sharedVaultUuid.value}`)
    }

    sharedVault.props.fileUploadBytesUsed += dto.bytesUsed

    await this.sharedVaultRepository.save(sharedVault)

    return Result.ok()
  }
}
