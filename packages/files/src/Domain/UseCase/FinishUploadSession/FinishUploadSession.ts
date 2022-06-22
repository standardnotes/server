import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { UseCaseInterface } from '../UseCaseInterface'
import { FinishUploadSessionDTO } from './FinishUploadSessionDTO'
import { FinishUploadSessionResponse } from './FinishUploadSessionResponse'
import { FileUploaderInterface } from '../../Services/FileUploaderInterface'
import { UploadRepositoryInterface } from '../../Upload/UploadRepositoryInterface'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'

@injectable()
export class FinishUploadSession implements UseCaseInterface {
  constructor(
    @inject(TYPES.FileUploader) private fileUploader: FileUploaderInterface,
    @inject(TYPES.UploadRepository) private uploadRepository: UploadRepositoryInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: FinishUploadSessionDTO): Promise<FinishUploadSessionResponse> {
    try {
      this.logger.debug(`Finishing upload session for resource: ${dto.resourceRemoteIdentifier}`)

      const filePath = `${dto.userUuid}/${dto.resourceRemoteIdentifier}`

      const uploadId = await this.uploadRepository.retrieveUploadSessionId(filePath)
      if (uploadId === undefined) {
        this.logger.warn(`Could not find upload session for file path: ${filePath}`)

        return {
          success: false,
          message: 'Could not finish upload session',
        }
      }

      const uploadChunkResults = await this.uploadRepository.retrieveUploadChunkResults(uploadId)

      let totalFileSize = 0
      for (const uploadChunkResult of uploadChunkResults) {
        totalFileSize += uploadChunkResult.chunkSize
      }

      const remainingSpaceLeft = dto.uploadBytesLimit - dto.uploadBytesUsed
      if (remainingSpaceLeft < totalFileSize) {
        return {
          success: false,
          message: 'Could not finish upload session. You are out of space.',
        }
      }

      await this.fileUploader.finishUploadSession(uploadId, filePath, uploadChunkResults)

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createFileUploadedEvent({
          userUuid: dto.userUuid,
          filePath: `${dto.userUuid}/${dto.resourceRemoteIdentifier}`,
          fileName: dto.resourceRemoteIdentifier,
          fileByteSize: totalFileSize,
        }),
      )

      return {
        success: true,
      }
    } catch (error) {
      this.logger.error(
        `Could not finish upload session for resource: ${dto.resourceRemoteIdentifier} - ${(error as Error).message}`,
      )

      return {
        success: false,
        message: 'Could not finish upload session',
      }
    }
  }
}
