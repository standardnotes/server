import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { UseCaseInterface } from '../UseCaseInterface'
import { UploadFileChunkDTO } from './UploadFileChunkDTO'
import { UploadFileChunkResponse } from './UploadFileChunkResponse'
import { FileUploaderInterface } from '../../Services/FileUploaderInterface'
import { UploadRepositoryInterface } from '../../Upload/UploadRepositoryInterface'

@injectable()
export class UploadFileChunk implements UseCaseInterface {
  constructor(
    @inject(TYPES.Files_FileUploader) private fileUploader: FileUploaderInterface,
    @inject(TYPES.Files_UploadRepository) private uploadRepository: UploadRepositoryInterface,
    @inject(TYPES.Files_Logger) private logger: Logger,
  ) {}

  async execute(dto: UploadFileChunkDTO): Promise<UploadFileChunkResponse> {
    try {
      if (!dto.data.byteLength || dto.data.byteLength === 0) {
        this.logger.debug(
          `Skipping upload file chunk ${dto.chunkId} with 0 bytes for resource: ${dto.resourceRemoteIdentifier}`,
        )

        return {
          success: false,
          message: 'Empty file chunk',
        }
      }

      this.logger.debug(
        `Starting upload file chunk ${dto.chunkId} with ${dto.data.byteLength} bytes for resource: ${dto.resourceRemoteIdentifier}`,
      )

      const filePath = `${dto.ownerUuid}/${dto.resourceRemoteIdentifier}`

      const uploadId = await this.uploadRepository.retrieveUploadSessionId(filePath)
      if (uploadId === undefined) {
        this.logger.warn(`Could not find upload session for file path: ${filePath}`)

        return {
          success: false,
          message: 'Could not find upload session',
        }
      }

      const uploadFileChunkETag = await this.fileUploader.uploadFileChunk({
        uploadId,
        data: dto.data,
        chunkId: dto.chunkId,
        filePath,
        unencryptedFileSize: dto.resourceUnencryptedFileSize,
      })

      await this.uploadRepository.storeUploadChunkResult(uploadId, {
        tag: uploadFileChunkETag,
        chunkId: dto.chunkId,
        chunkSize: dto.data.byteLength,
      })

      return {
        success: true,
      }
    } catch (error) {
      this.logger.error(
        `Could not upload file chunk for resource: ${dto.resourceRemoteIdentifier} - ${(error as Error).message}`,
      )

      return {
        success: false,
        message: 'Could not upload file chunk',
      }
    }
  }
}
