import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { FinishUploadSessionDTO } from './FinishUploadSessionDTO'
import { FileUploaderInterface } from '../../Services/FileUploaderInterface'
import { UploadRepositoryInterface } from '../../Upload/UploadRepositoryInterface'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'

export class FinishUploadSession implements UseCaseInterface<void> {
  constructor(
    private fileUploader: FileUploaderInterface,
    private uploadRepository: UploadRepositoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
  ) {}

  async execute(dto: FinishUploadSessionDTO): Promise<Result<void>> {
    try {
      const userUuidOrError = Uuid.create(dto.userUuid)
      if (userUuidOrError.isFailed()) {
        return Result.fail(userUuidOrError.getError())
      }
      const userUuid = userUuidOrError.getValue()

      let sharedVaultUuid: Uuid | undefined
      if (dto.sharedVaultUuid !== undefined) {
        const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
        if (sharedVaultUuidOrError.isFailed()) {
          return Result.fail(sharedVaultUuidOrError.getError())
        }
        sharedVaultUuid = sharedVaultUuidOrError.getValue()
      }

      const filePath = `${sharedVaultUuid ? sharedVaultUuid.value : userUuid.value}/${dto.resourceRemoteIdentifier}`

      const uploadId = await this.uploadRepository.retrieveUploadSessionId(filePath)
      if (uploadId === undefined) {
        return Result.fail('Could not finish upload session')
      }

      const uploadChunkResults = await this.uploadRepository.retrieveUploadChunkResults(uploadId)

      let totalFileSize = 0
      for (const uploadChunkResult of uploadChunkResults) {
        totalFileSize += uploadChunkResult.chunkSize
      }

      const userHasUnlimitedStorage = dto.uploadBytesLimit === -1
      const remainingSpaceLeft = dto.uploadBytesLimit - dto.uploadBytesUsed
      if (!userHasUnlimitedStorage && remainingSpaceLeft < totalFileSize) {
        return Result.fail('Could not finish upload session. You are out of space.')
      }

      await this.fileUploader.finishUploadSession(uploadId, filePath, uploadChunkResults)

      if (sharedVaultUuid !== undefined) {
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createSharedVaultFileUploadedEvent({
            sharedVaultUuid: sharedVaultUuid.value,
            vaultOwnerUuid: userUuid.value,
            filePath,
            fileName: dto.resourceRemoteIdentifier,
            fileByteSize: totalFileSize,
          }),
        )
      } else {
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createFileUploadedEvent({
            userUuid: userUuid.value,
            filePath,
            fileName: dto.resourceRemoteIdentifier,
            fileByteSize: totalFileSize,
          }),
        )
      }

      return Result.ok()
    } catch (error) {
      return Result.fail('Could not finish upload session')
    }
  }
}
